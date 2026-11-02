import 'package:flutter/material.dart';
import '../../core/api_service.dart';
import '../../models/models.dart';
import '../../theme.dart';
import '../../widgets/common.dart';
import '../../widgets/skeleton.dart';
import 'my_performance_screen.dart';
import 'quiz_player_screen.dart';

/// Free Daily Practice Quizzes Screen
/// Features daily micro-quizzes, subject filtering, search, and direct CBT launch.
class FreeQuizzesScreen extends StatefulWidget {
  const FreeQuizzesScreen({super.key});

  @override
  State<FreeQuizzesScreen> createState() => _FreeQuizzesScreenState();
}

class _FreeQuizzesScreenState extends State<FreeQuizzesScreen> {
  final ApiService _apiService = ApiService();
  final TextEditingController _searchController = TextEditingController();

  List<QuizSummary> _allQuizzes = [];
  List<QuizSummary> _filteredQuizzes = [];
  bool _isLoading = true;
  String? _errorMessage;
  String _selectedSubject = 'All';

  @override
  void initState() {
    super.initState();
    _loadQuizzes();
  }

  Future<void> _loadQuizzes() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final quizzes = await _apiService.getFreeQuizzes();
      if (!mounted) return;
      setState(() {
        _allQuizzes = quizzes;
        _isLoading = false;
        _applyFilters();
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _errorMessage = e.toString();
        _isLoading = false;
      });
    }
  }

  void _applyFilters() {
    final query = _searchController.text.trim().toLowerCase();

    setState(() {
      _filteredQuizzes = _allQuizzes.where((q) {
        final matchesQuery = query.isEmpty ||
            q.title.toLowerCase().contains(query) ||
            (q.subject?.toLowerCase().contains(query) ?? false);

        final matchesSubject = _selectedSubject == 'All' ||
            (q.subject != null &&
                q.subject!.toLowerCase() == _selectedSubject.toLowerCase());

        return matchesQuery && matchesSubject;
      }).toList();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Free Daily Quizzes'),
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.analytics_outlined),
            tooltip: 'My Performance',
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (context) => const MyPerformanceScreen(),
                ),
              );
            },
          ),
        ],
      ),
      body: Column(
        children: [
          _buildSearchAndSubjectChips(),
          const Divider(height: 1),
          Expanded(
            child: RefreshIndicator(
              onRefresh: _loadQuizzes,
              color: AppColors.primary,
              child: _buildQuizList(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSearchAndSubjectChips() {
    final subjects = ['All', 'Biology', 'Physics', 'Chemistry', 'Mathematics'];

    return Container(
      color: Colors.white,
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 12),
      child: Column(
        children: [
          TextField(
            controller: _searchController,
            onChanged: (_) => _applyFilters(),
            decoration: InputDecoration(
              hintText: 'Search daily practice quizzes...',
              hintStyle: const TextStyle(
                fontFamily: 'Poppins',
                fontSize: 13,
                color: AppColors.textSecondary,
              ),
              prefixIcon: const Icon(Icons.search, color: AppColors.primary),
              suffixIcon: _searchController.text.isNotEmpty
                  ? IconButton(
                      icon: const Icon(Icons.clear, size: 18),
                      onPressed: () {
                        _searchController.clear();
                        _applyFilters();
                      },
                    )
                  : null,
              filled: true,
              fillColor: AppColors.surface,
              contentPadding:
                  const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(color: AppColors.border),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(color: AppColors.border),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide:
                    const BorderSide(color: AppColors.primary, width: 1.5),
              ),
            ),
          ),
          const SizedBox(height: 10),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: subjects.map((subj) {
                final isSelected = _selectedSubject == subj;
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: FilterChip(
                    selected: isSelected,
                    label: Text(
                      subj,
                      style: TextStyle(
                        fontFamily: 'Poppins',
                        fontSize: 12,
                        fontWeight:
                            isSelected ? FontWeight.w600 : FontWeight.normal,
                        color:
                            isSelected ? Colors.white : AppColors.textPrimary,
                      ),
                    ),
                    selectedColor: AppColors.primary,
                    backgroundColor: Colors.white,
                    checkmarkColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(20),
                      side: BorderSide(
                        color:
                            isSelected ? AppColors.primary : AppColors.border,
                      ),
                    ),
                    onSelected: (_) {
                      setState(() {
                        _selectedSubject = subj;
                        _applyFilters();
                      });
                    },
                  ),
                );
              }).toList(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuizList() {
    if (_isLoading) {
      return const Padding(
        padding: EdgeInsets.all(16),
        child: SkeletonList(count: 4),
      );
    }

    if (_errorMessage != null) {
      return ErrorStateView(
        message: 'Failed to load quizzes: $_errorMessage',
        onRetry: _loadQuizzes,
      );
    }

    if (_filteredQuizzes.isEmpty) {
      return Center(
        child: EmptyStateView(
          icon: Icons.quiz_outlined,
          title: 'No Quizzes Found',
          message: 'Try selecting a different subject or clearing search query.',
          actionText: 'Reset Filters',
          onAction: () {
            _searchController.clear();
            setState(() {
              _selectedSubject = 'All';
              _applyFilters();
            });
          },
        ),
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: _filteredQuizzes.length,
      separatorBuilder: (_, __) => const SizedBox(height: 12),
      itemBuilder: (context, index) {
        final quiz = _filteredQuizzes[index];
        return _buildQuizCard(quiz);
      },
    );
  }

  Widget _buildQuizCard(QuizSummary quiz) {
    Color badgeColor;
    final subject = quiz.subject?.toLowerCase() ?? '';
    if (subject.contains('bio')) {
      badgeColor = AppColors.success;
    } else if (subject.contains('phy')) {
      badgeColor = AppColors.primary;
    } else if (subject.contains('chem')) {
      badgeColor = AppColors.paletteMarked;
    } else {
      badgeColor = AppColors.accent;
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
          Row(
            children: [
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: badgeColor.withAlpha(20),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  quiz.subject ?? 'Practice',
                  style: TextStyle(
                    fontFamily: 'Poppins',
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    color: badgeColor,
                  ),
                ),
              ),
              const Spacer(),
              if (quiz.isAttempted)
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: AppColors.success.withAlpha(20),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.check_circle,
                          size: 13, color: AppColors.success),
                      SizedBox(width: 4),
                      Text(
                        'Attempted',
                        style: TextStyle(
                          fontFamily: 'Poppins',
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          color: AppColors.success,
                        ),
                      ),
                    ],
                  ),
                ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            quiz.title,
            style: const TextStyle(
              fontFamily: 'Poppins',
              fontSize: 15,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              const Icon(Icons.timer_outlined,
                  size: 16, color: AppColors.textSecondary),
              const SizedBox(width: 4),
              Text(
                '${quiz.durationMinutes} mins',
                style: const TextStyle(
                  fontFamily: 'Poppins',
                  fontSize: 12,
                  color: AppColors.textSecondary,
                ),
              ),
              const SizedBox(width: 14),
              const Icon(Icons.format_list_numbered,
                  size: 16, color: AppColors.textSecondary),
              const SizedBox(width: 4),
              Text(
                '${quiz.totalQuestions} Qs',
                style: const TextStyle(
                  fontFamily: 'Poppins',
                  fontSize: 12,
                  color: AppColors.textSecondary,
                ),
              ),
              const SizedBox(width: 14),
              const Icon(Icons.grade_outlined,
                  size: 16, color: AppColors.textSecondary),
              const SizedBox(width: 4),
              Text(
                '${quiz.totalMarks.toInt()} Marks',
                style: const TextStyle(
                  fontFamily: 'Poppins',
                  fontSize: 12,
                  color: AppColors.textSecondary,
                ),
              ),
            ],
          ),
          const Divider(height: 20),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'FREE PRACTICE',
                style: TextStyle(
                  fontFamily: 'Poppins',
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 0.5,
                  color: AppColors.success,
                ),
              ),
              ElevatedButton.icon(
                onPressed: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (context) => QuizPlayerScreen(quizId: quiz.id),
                    ),
                  );
                },
                icon: Icon(
                  quiz.isAttempted ? Icons.refresh : Icons.play_arrow_rounded,
                  size: 18,
                ),
                label: Text(quiz.isAttempted ? 'Re-attempt' : 'Start Quiz'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                  padding:
                      const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
