import 'package:flutter/material.dart';
import '../../core/api_service.dart';
import '../../models/models.dart';
import '../../theme.dart';
import '../../widgets/common.dart';
import '../../widgets/skeleton.dart';

/// Question-by-Question Solution & Explanations Review Screen
class AttemptReportScreen extends StatefulWidget {
  final int attemptId;
  final QuizPaper? paper;
  final Map<int, int>? userAnswers;

  const AttemptReportScreen({
    super.key,
    required this.attemptId,
    this.paper,
    this.userAnswers,
  });

  @override
  State<AttemptReportScreen> createState() => _AttemptReportScreenState();
}

class _AttemptReportScreenState extends State<AttemptReportScreen> {
  final ApiService _apiService = ApiService();
  late Future<Map<String, dynamic>> _reportFuture;
  String _filter = 'all'; // 'all', 'correct', 'incorrect', 'skipped'

  @override
  void initState() {
    super.initState();
    _reportFuture = _loadReport();
  }

  Future<Map<String, dynamic>> _loadReport() async {
    if (widget.paper != null && widget.userAnswers != null) {
      // Build QuestionReview list directly from paper & answers
      final reviews = widget.paper!.questions.map((q) {
        final userChoice = widget.userAnswers![q.id];
        final isCorrect =
            userChoice != null && userChoice == (q.correctOption ?? 0);
        return QuestionReview(
          question: q,
          selectedOption: userChoice,
          isCorrect: isCorrect,
          timeSpentSeconds: 45,
          markedForReview: false,
        );
      }).toList();

      return {
        'questions': reviews,
      };
    }

    return _apiService.getQuizResult(widget.attemptId);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Detailed Solutions'),
        elevation: 0,
      ),
      body: FutureBuilder<Map<String, dynamic>>(
        future: _reportFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Padding(
              padding: EdgeInsets.all(16),
              child: SkeletonList(count: 3),
            );
          }

          if (snapshot.hasError) {
            return ErrorStateView(
              message: 'Failed to load report: ${snapshot.error}',
              onRetry: () => setState(() => _reportFuture = _loadReport()),
            );
          }

          final data = snapshot.data ?? {};
          final List<QuestionReview> allReviews =
              (data['questions'] as List<dynamic>?)
                      ?.cast<QuestionReview>() ??
                  [];

          final filteredReviews = allReviews.where((r) {
            if (_filter == 'correct') return r.isCorrect;
            if (_filter == 'incorrect') {
              return r.selectedOption != null && !r.isCorrect;
            }
            if (_filter == 'skipped') return r.selectedOption == null;
            return true;
          }).toList();

          return Column(
            children: [
              _buildFilterChips(allReviews),
              const Divider(height: 1),
              Expanded(
                child: filteredReviews.isEmpty
                    ? const Center(
                        child: Text(
                          'No questions match this filter.',
                          style: TextStyle(
                            fontFamily: 'Poppins',
                            color: AppColors.textSecondary,
                          ),
                        ),
                      )
                    : ListView.separated(
                        padding: const EdgeInsets.all(16),
                        itemCount: filteredReviews.length,
                        separatorBuilder: (_, __) =>
                            const SizedBox(height: 16),
                        itemBuilder: (context, index) {
                          final review = filteredReviews[index];
                          return _buildQuestionSolutionCard(review, index + 1);
                        },
                      ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildFilterChips(List<QuestionReview> all) {
    final correctCount = all.where((r) => r.isCorrect).length;
    final incorrectCount =
        all.where((r) => r.selectedOption != null && !r.isCorrect).length;
    final skippedCount = all.where((r) => r.selectedOption == null).length;

    return Container(
      color: Colors.white,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          children: [
            _buildChoiceChip('all', 'All (${all.length})'),
            const SizedBox(width: 8),
            _buildChoiceChip('correct', 'Correct ($correctCount)',
                activeColor: AppColors.success),
            const SizedBox(width: 8),
            _buildChoiceChip('incorrect', 'Incorrect ($incorrectCount)',
                activeColor: AppColors.error),
            const SizedBox(width: 8),
            _buildChoiceChip('skipped', 'Skipped ($skippedCount)',
                activeColor: AppColors.textSecondary),
          ],
        ),
      ),
    );
  }

  Widget _buildChoiceChip(String value, String label, {Color? activeColor}) {
    final isSelected = _filter == value;
    final color = activeColor ?? AppColors.primary;

    return ChoiceChip(
      selected: isSelected,
      label: Text(
        label,
        style: TextStyle(
          fontFamily: 'Poppins',
          fontSize: 12,
          fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
          color: isSelected ? Colors.white : AppColors.textPrimary,
        ),
      ),
      selectedColor: color,
      backgroundColor: Colors.white,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
        side: BorderSide(
          color: isSelected ? color : AppColors.border,
        ),
      ),
      onSelected: (_) => setState(() => _filter = value),
    );
  }

  Widget _buildQuestionSolutionCard(QuestionReview review, int number) {
    final q = review.question;
    final correctIdx = q.correctOption ?? 0;
    final userIdx = review.selectedOption;

    Color statusColor;
    String statusText;
    IconData statusIcon;

    if (review.isCorrect) {
      statusColor = AppColors.success;
      statusText = 'Correct (+${q.marks.toInt()})';
      statusIcon = Icons.check_circle_outline;
    } else if (userIdx != null) {
      statusColor = AppColors.error;
      statusText = 'Incorrect (-${q.negativeMarks})';
      statusIcon = Icons.cancel_outlined;
    } else {
      statusColor = AppColors.textSecondary;
      statusText = 'Unattempted (0)';
      statusIcon = Icons.remove_circle_outline;
    }

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(5),
            blurRadius: 8,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Status Strip
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Question $number',
                style: const TextStyle(
                  fontFamily: 'Poppins',
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary,
                ),
              ),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: statusColor.withAlpha(20),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Row(
                  children: [
                    Icon(statusIcon, color: statusColor, size: 14),
                    const SizedBox(width: 4),
                    Text(
                      statusText,
                      style: TextStyle(
                        fontFamily: 'Poppins',
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        color: statusColor,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            q.questionText,
            style: const TextStyle(
              fontFamily: 'Poppins',
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: AppColors.textPrimary,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 14),
          // Options with Highlight
          ...List.generate(q.options.length, (optIdx) {
            final isCorrectOption = optIdx == correctIdx;
            final isUserChoice = optIdx == userIdx;

            Color optionBg = AppColors.surface;
            Color optionBorder = AppColors.border;
            Color optionText = AppColors.textPrimary;

            if (isCorrectOption) {
              optionBg = AppColors.success.withAlpha(20);
              optionBorder = AppColors.success;
              optionText = AppColors.success;
            } else if (isUserChoice && !review.isCorrect) {
              optionBg = AppColors.error.withAlpha(20);
              optionBorder = AppColors.error;
              optionText = AppColors.error;
            }

            const letters = ['A', 'B', 'C', 'D'];

            return Container(
              margin: const EdgeInsets.only(bottom: 8),
              padding:
                  const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              decoration: BoxDecoration(
                color: optionBg,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: optionBorder, width: 1.2),
              ),
              child: Row(
                children: [
                  Text(
                    '${letters[optIdx % letters.length]}.',
                    style: TextStyle(
                      fontFamily: 'Poppins',
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: optionText,
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      q.options[optIdx],
                      style: TextStyle(
                        fontFamily: 'Poppins',
                        fontSize: 12,
                        fontWeight: isCorrectOption || isUserChoice
                            ? FontWeight.w600
                            : FontWeight.normal,
                        color: optionText,
                      ),
                    ),
                  ),
                  if (isCorrectOption)
                    const Icon(Icons.check_circle_rounded,
                        color: AppColors.success, size: 18)
                  else if (isUserChoice && !review.isCorrect)
                    const Icon(Icons.cancel_rounded,
                        color: AppColors.error, size: 18),
                ],
              ),
            );
          }),
          const SizedBox(height: 12),
          // Step-by-Step Explanation
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.primary.withAlpha(10),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: AppColors.primary.withAlpha(40)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Row(
                  children: [
                    Icon(Icons.lightbulb_outline,
                        color: AppColors.primary, size: 16),
                    SizedBox(width: 6),
                    Text(
                      'Explanation & Formula Breakdown',
                      style: TextStyle(
                        fontFamily: 'Poppins',
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: AppColors.primary,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Text(
                  q.explanation ??
                      'The correct solution follows standard textbook derivation principles and dimensional consistency.',
                  style: const TextStyle(
                    fontFamily: 'Poppins',
                    fontSize: 12,
                    color: AppColors.textPrimary,
                    height: 1.45,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

