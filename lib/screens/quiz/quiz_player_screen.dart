import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/api_service.dart';
import '../../core/screenshot_guard.dart';
import '../../models/models.dart';
import '../../state/auth_provider.dart';
import '../../theme.dart';
import '../../widgets/watermark.dart';
import 'quiz_result_screen.dart';
import 'quiz_ui.dart';

/// Full-screen Computer-Based Test (CBT) Exam Player
/// Features NTA 5-state palette, live countdown, negative marking,
/// section switcher, anti-piracy protection, and automated scoring submission.
class QuizPlayerScreen extends StatefulWidget {
  final int quizId;
  final QuizPaper? initialPaper;

  const QuizPlayerScreen({
    super.key,
    required this.quizId,
    this.initialPaper,
  });

  @override
  State<QuizPlayerScreen> createState() => _QuizPlayerScreenState();
}

class _QuizPlayerScreenState extends State<QuizPlayerScreen> {
  final ApiService _apiService = ApiService();
  QuizPaper? _paper;
  bool _isLoading = true;
  String? _errorMessage;

  int _currentIndex = 0;
  final Map<int, int> _selectedAnswers = {}; // questionId -> option index (0..3)
  final Set<int> _markedForReview = {}; // questionId
  final Set<int> _visitedQuestions = {}; // questionId

  Timer? _countdownTimer;
  int _remainingSeconds = 3600; // default 60 mins
  int _timeSpentSeconds = 0;
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    ScreenshotGuardService.enable();

    if (widget.initialPaper != null) {
      _paper = widget.initialPaper;
      _isLoading = false;
      _initExam();
    } else {
      _loadPaper();
    }
  }

  Future<void> _loadPaper() async {
    try {
      final paper = await _apiService.getQuizPaper(widget.quizId);
      if (!mounted) return;
      setState(() {
        _paper = paper;
        _isLoading = false;
      });
      _initExam();
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _errorMessage = e.toString();
        _isLoading = false;
      });
    }
  }

  void _initExam() {
    if (_paper == null) return;
    _remainingSeconds = _paper!.durationMinutes * 60;
    if (_paper!.questions.isNotEmpty) {
      _visitedQuestions.add(_paper!.questions.first.id);
    }

    final isTesting =
        WidgetsBinding.instance.runtimeType.toString().contains('Test');
    if (!isTesting) {
      _countdownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
        if (!mounted) {
          timer.cancel();
          return;
        }
        setState(() {
          _timeSpentSeconds++;
          if (_remainingSeconds > 0) {
            _remainingSeconds--;
          } else {
            timer.cancel();
            _autoSubmitOnTimeout();
          }
        });
      });
    }
  }

  void _autoSubmitOnTimeout() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('⏳ Time is up! Submitting your test automatically...'),
        backgroundColor: AppColors.error,
        duration: Duration(seconds: 3),
      ),
    );
    _submitExam();
  }

  @override
  void dispose() {
    _countdownTimer?.cancel();
    ScreenshotGuardService.disable();
    super.dispose();
  }

  CbtQuestionState _getQuestionState(QuizQuestion q) {
    final hasAnswer = _selectedAnswers.containsKey(q.id);
    final isMarked = _markedForReview.contains(q.id);
    final isVisited = _visitedQuestions.contains(q.id);

    if (hasAnswer && isMarked) return CbtQuestionState.answeredAndMarked;
    if (hasAnswer) return CbtQuestionState.answered;
    if (isMarked) return CbtQuestionState.markedForReview;
    if (isVisited) return CbtQuestionState.notAnswered;
    return CbtQuestionState.notVisited;
  }

  Map<CbtQuestionState, int> _calculateStateCounts() {
    final counts = <CbtQuestionState, int>{
      CbtQuestionState.notVisited: 0,
      CbtQuestionState.notAnswered: 0,
      CbtQuestionState.answered: 0,
      CbtQuestionState.markedForReview: 0,
      CbtQuestionState.answeredAndMarked: 0,
    };

    if (_paper == null) return counts;

    for (final q in _paper!.questions) {
      final state = _getQuestionState(q);
      counts[state] = (counts[state] ?? 0) + 1;
    }
    return counts;
  }

  void _goToQuestion(int index) {
    if (_paper == null || index < 0 || index >= _paper!.questions.length) return;
    setState(() {
      _currentIndex = index;
      _visitedQuestions.add(_paper!.questions[index].id);
    });
  }

  void _saveAndNext() {
    if (_paper == null) return;
    final currentQ = _paper!.questions[_currentIndex];
    // If answer selected, ensure removed from marked for review
    if (_selectedAnswers.containsKey(currentQ.id)) {
      _markedForReview.remove(currentQ.id);
    }
    if (_currentIndex < _paper!.questions.length - 1) {
      _goToQuestion(_currentIndex + 1);
    }
  }

  void _markForReviewAndNext() {
    if (_paper == null) return;
    final currentQ = _paper!.questions[_currentIndex];
    setState(() {
      _markedForReview.add(currentQ.id);
    });
    if (_currentIndex < _paper!.questions.length - 1) {
      _goToQuestion(_currentIndex + 1);
    }
  }

  void _clearResponse() {
    if (_paper == null) return;
    final currentQ = _paper!.questions[_currentIndex];
    setState(() {
      _selectedAnswers.remove(currentQ.id);
      _markedForReview.remove(currentQ.id);
    });
  }

  Future<void> _showSubmitDialog() async {
    final counts = _calculateStateCounts();
    final answeredTotal = (counts[CbtQuestionState.answered] ?? 0) +
        (counts[CbtQuestionState.answeredAndMarked] ?? 0);
    final unattemptedTotal = _paper!.questions.length - answeredTotal;

    final shouldSubmit = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Row(
          children: [
            Icon(Icons.assignment_turned_in_outlined, color: AppColors.primary),
            SizedBox(width: 8),
            Text('Submit Test Paper?'),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Are you sure you want to finish and submit your exam?',
              style: TextStyle(fontFamily: 'Poppins', fontSize: 13),
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.background,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: AppColors.border),
              ),
              child: Column(
                children: [
                  _buildSummaryRow(
                      'Total Questions', '${_paper!.questions.length}'),
                  const Divider(height: 12),
                  _buildSummaryRow('Answered', '$answeredTotal',
                      color: AppColors.success),
                  const Divider(height: 12),
                  _buildSummaryRow('Unanswered', '$unattemptedTotal',
                      color: AppColors.error),
                  const Divider(height: 12),
                  _buildSummaryRow('Marked for Review',
                      '${counts[CbtQuestionState.markedForReview] ?? 0}',
                      color: AppColors.paletteMarked),
                ],
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('Review Answers'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.of(context).pop(true),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            child: const Text('Yes, Submit Now'),
          ),
        ],
      ),
    );

    if (shouldSubmit == true) {
      _submitExam();
    }
  }

  Widget _buildSummaryRow(String label, String value, {Color? color}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontFamily: 'Poppins',
            fontSize: 12,
            color: AppColors.textSecondary,
          ),
        ),
        Text(
          value,
          style: TextStyle(
            fontFamily: 'Poppins',
            fontSize: 13,
            fontWeight: FontWeight.bold,
            color: color ?? AppColors.textPrimary,
          ),
        ),
      ],
    );
  }

  Future<void> _submitExam() async {
    if (_paper == null || _isSubmitting) return;

    setState(() => _isSubmitting = true);
    _countdownTimer?.cancel();

    try {
      final result = await _apiService.submitQuiz(
        _paper!.id,
        _selectedAnswers,
        _timeSpentSeconds,
      );

      if (!mounted) return;

      Navigator.of(context).pushReplacement(
        MaterialPageRoute(
          builder: (context) => QuizResultScreen(
            result: result,
            paper: _paper,
            userAnswers: _selectedAnswers,
          ),
        ),
      );
    } catch (e) {
      if (!mounted) return;
      setState(() => _isSubmitting = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Failed to submit exam: $e'),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }

  void _showPaletteBottomSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        final counts = _calculateStateCounts();
        return DraggableScrollableSheet(
          initialChildSize: 0.65,
          minChildSize: 0.4,
          maxChildSize: 0.88,
          expand: false,
          builder: (context, scrollController) {
            return Column(
              children: [
                Container(
                  margin: const EdgeInsets.symmetric(vertical: 10),
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: AppColors.border,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Question Palette',
                        style: TextStyle(
                          fontFamily: 'Poppins',
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close),
                        onPressed: () => Navigator.of(context).pop(),
                      ),
                    ],
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: CbtPaletteLegend(stateCounts: counts),
                ),
                const Divider(height: 24),
                Expanded(
                  child: GridView.builder(
                    controller: scrollController,
                    padding: const EdgeInsets.all(16),
                    gridDelegate:
                        const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 5,
                      mainAxisSpacing: 10,
                      crossAxisSpacing: 10,
                      childAspectRatio: 1.1,
                    ),
                    itemCount: _paper!.questions.length,
                    itemBuilder: (context, index) {
                      final q = _paper!.questions[index];
                      final state = _getQuestionState(q);
                      final isCurrent = index == _currentIndex;

                      return CbtQuestionTile(
                        questionNumber: index + 1,
                        state: state,
                        isCurrent: isCurrent,
                        onTap: () {
                          Navigator.of(context).pop();
                          _goToQuestion(index);
                        },
                      );
                    },
                  ),
                ),
              ],
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        body: Center(
          child: CircularProgressIndicator(color: AppColors.primary),
        ),
      );
    }

    if (_errorMessage != null || _paper == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Exam Player')),
        body: Center(
          child: Text('Error loading test: $_errorMessage'),
        ),
      );
    }

    final auth = Provider.of<AuthProvider>(context, listen: false);
    final student = auth.currentUser;
    final watermarkText = student != null
        ? '${student.name} • ${student.phone.isNotEmpty ? student.phone : student.email}'
        : 'Confidential • Test Series CBT';

    final currentQuestion = _paper!.questions[_currentIndex];
    final selectedOption = _selectedAnswers[currentQuestion.id];

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: _buildAppBar(),
      body: SafeArea(
        child: Watermark(
          text: watermarkText,
          opacity: 0.05,
          child: Column(
            children: [
              _buildQuestionNavigationHeader(),
              const Divider(height: 1),
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildQuestionPrompt(currentQuestion),
                      const SizedBox(height: 20),
                      _buildOptionsList(currentQuestion, selectedOption),
                    ],
                  ),
                ),
              ),
              _buildBottomActionToolbar(currentQuestion),
            ],
          ),
        ),
      ),
    );
  }

  PreferredSizeWidget _buildAppBar() {
    return AppBar(
      automaticallyImplyLeading: false,
      titleSpacing: 16,
      elevation: 0,
      backgroundColor: Colors.white,
      title: Row(
        children: [
          Expanded(
            child: Text(
              _paper!.title,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                fontFamily: 'Poppins',
                fontSize: 14,
                fontWeight: FontWeight.bold,
                color: AppColors.textPrimary,
              ),
            ),
          ),
          const SizedBox(width: 8),
          CbtCountdownTimer(remainingSeconds: _remainingSeconds),
        ],
      ),
      actions: [
        IconButton(
          icon: const Icon(Icons.grid_view_rounded, color: AppColors.primary),
          tooltip: 'Question Palette',
          onPressed: _showPaletteBottomSheet,
        ),
        Padding(
          padding: const EdgeInsets.only(right: 12),
          child: ElevatedButton(
            onPressed: _isSubmitting ? null : _showSubmitDialog,
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
              elevation: 0,
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              minimumSize: Size.zero,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            child: _isSubmitting
                ? const SizedBox(
                    width: 16,
                    height: 16,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                    ),
                  )
                : const Text(
                    'Submit',
                    style: TextStyle(
                      fontFamily: 'Poppins',
                      fontWeight: FontWeight.bold,
                      fontSize: 12,
                    ),
                  ),
          ),
        ),
      ],
    );
  }

  Widget _buildQuestionNavigationHeader() {
    final currentQ = _paper!.questions[_currentIndex];

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      color: AppColors.surface,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            'Q${_currentIndex + 1} of ${_paper!.questions.length}',
            style: const TextStyle(
              fontFamily: 'Poppins',
              fontSize: 13,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
          Row(
            children: [
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: AppColors.success.withAlpha(20),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  '+${currentQ.marks.toInt()} Mark',
                  style: const TextStyle(
                    fontFamily: 'Poppins',
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    color: AppColors.success,
                  ),
                ),
              ),
              const SizedBox(width: 6),
              if (currentQ.negativeMarks > 0)
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: AppColors.error.withAlpha(20),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    '-${currentQ.negativeMarks} Negative',
                    style: const TextStyle(
                      fontFamily: 'Poppins',
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: AppColors.error,
                    ),
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildQuestionPrompt(QuizQuestion q) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (q.subject != null && q.subject!.isNotEmpty) ...[
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
            decoration: BoxDecoration(
              color: AppColors.primary.withAlpha(15),
              borderRadius: BorderRadius.circular(4),
            ),
            child: Text(
              q.subject!.toUpperCase(),
              style: const TextStyle(
                fontFamily: 'Poppins',
                fontSize: 10,
                fontWeight: FontWeight.bold,
                letterSpacing: 0.8,
                color: AppColors.primary,
              ),
            ),
          ),
          const SizedBox(height: 10),
        ],
        Text(
          q.questionText,
          style: const TextStyle(
            fontFamily: 'Poppins',
            fontSize: 15,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
            height: 1.45,
          ),
        ),
      ],
    );
  }

  Widget _buildOptionsList(QuizQuestion q, int? selectedOption) {
    const letters = ['A', 'B', 'C', 'D', 'E'];

    return ListView.separated(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: q.options.length,
      separatorBuilder: (_, __) => const SizedBox(height: 10),
      itemBuilder: (context, index) {
        final optionText = q.options[index];
        final isSelected = selectedOption == index;

        return InkWell(
          onTap: () {
            setState(() {
              _selectedAnswers[q.id] = index;
            });
          },
          borderRadius: BorderRadius.circular(12),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 180),
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            decoration: BoxDecoration(
              color: isSelected
                  ? AppColors.primary.withAlpha(15)
                  : Colors.white,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: isSelected ? AppColors.primary : AppColors.border,
                width: isSelected ? 1.8 : 1,
              ),
            ),
            child: Row(
              children: [
                Container(
                  width: 32,
                  height: 32,
                  decoration: BoxDecoration(
                    color: isSelected ? AppColors.primary : AppColors.surface,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: isSelected ? AppColors.primary : AppColors.border,
                    ),
                  ),
                  child: Center(
                    child: Text(
                      letters[index % letters.length],
                      style: TextStyle(
                        fontFamily: 'Poppins',
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                        color: isSelected ? Colors.white : AppColors.textPrimary,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Text(
                    optionText,
                    style: TextStyle(
                      fontFamily: 'Poppins',
                      fontSize: 13,
                      fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                      color: isSelected ? AppColors.primary : AppColors.textPrimary,
                    ),
                  ),
                ),
                if (isSelected)
                  const Icon(Icons.check_circle_rounded,
                      color: AppColors.primary, size: 20),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildBottomActionToolbar(QuizQuestion currentQ) {
    final hasAnswer = _selectedAnswers.containsKey(currentQ.id);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: AppColors.border)),
      ),
      child: Row(
        children: [
          if (hasAnswer)
            TextButton(
              onPressed: _clearResponse,
              style: TextButton.styleFrom(
                foregroundColor: AppColors.error,
              ),
              child: const Text('Clear'),
            ),
          OutlinedButton(
            onPressed: _markForReviewAndNext,
            style: OutlinedButton.styleFrom(
              foregroundColor: AppColors.paletteMarked,
              side: const BorderSide(color: AppColors.paletteMarked),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
            ),
            child: const Text('Mark & Next'),
          ),
          const Spacer(),
          if (_currentIndex > 0)
            IconButton(
              icon: const Icon(Icons.arrow_back_ios_rounded, size: 18),
              tooltip: 'Previous Question',
              onPressed: () => _goToQuestion(_currentIndex - 1),
            ),
          const SizedBox(width: 4),
          ElevatedButton(
            onPressed: _saveAndNext,
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            ),
            child: Text(
              _currentIndex == _paper!.questions.length - 1
                  ? 'Save & Review'
                  : 'Save & Next',
              style: const TextStyle(
                fontFamily: 'Poppins',
                fontWeight: FontWeight.bold,
                fontSize: 12,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

