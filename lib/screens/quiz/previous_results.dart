import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../core/api_service.dart';
import '../../models/models.dart';
import '../../theme.dart';
import '../../widgets/common.dart';
import '../../widgets/skeleton.dart';
import 'attempt_report_screen.dart';
import 'my_performance_screen.dart';
import 'quiz_player_screen.dart';

/// Previous Test Results & Attempt History Screen
/// Displays past completed test attempts, scores, accuracy, and solution review.
class PreviousResultsScreen extends StatefulWidget {
  const PreviousResultsScreen({super.key});

  @override
  State<PreviousResultsScreen> createState() => _PreviousResultsScreenState();
}

class _PreviousResultsScreenState extends State<PreviousResultsScreen> {
  final ApiService _apiService = ApiService();
  final TextEditingController _searchController = TextEditingController();

  List<QuizAttemptSummary> _allAttempts = [];
  List<QuizAttemptSummary> _filteredAttempts = [];
  bool _isLoading = true;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _loadPreviousResults();
  }

  Future<void> _loadPreviousResults() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final results = await _apiService.getPreviousResults();
      if (!mounted) return;
      setState(() {
        _allAttempts = results;
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
      _filteredAttempts = _allAttempts.where((a) {
        return query.isEmpty || a.quizTitle.toLowerCase().contains(query);
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
        title: const Text('Attempt History'),
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.insights_outlined),
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
          _buildSearchBar(),
          const Divider(height: 1),
          Expanded(
            child: RefreshIndicator(
              onRefresh: _loadPreviousResults,
              color: AppColors.primary,
              child: _buildAttemptsList(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSearchBar() {
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 12),
      child: TextField(
        controller: _searchController,
        onChanged: (_) => _applyFilters(),
        decoration: InputDecoration(
          hintText: 'Search previous test attempts...',
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
            borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
          ),
        ),
      ),
    );
  }

  Widget _buildAttemptsList() {
    if (_isLoading) {
      return const Padding(
        padding: EdgeInsets.all(16),
        child: SkeletonList(count: 4),
      );
    }

    if (_errorMessage != null) {
      return ErrorStateView(
        message: 'Failed to load test history: $_errorMessage',
        onRetry: _loadPreviousResults,
      );
    }

    if (_filteredAttempts.isEmpty) {
      return Center(
        child: EmptyStateView(
          icon: Icons.history_edu_outlined,
          title: 'No Past Test Attempts',
          message: 'You have not attempted any tests yet. Start with a mock test!',
          actionText: 'Browse Tests',
          onAction: () => Navigator.of(context).pop(),
        ),
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: _filteredAttempts.length,
      separatorBuilder: (_, __) => const SizedBox(height: 12),
      itemBuilder: (context, index) {
        final attempt = _filteredAttempts[index];
        return _buildAttemptCard(attempt);
      },
    );
  }

  Widget _buildAttemptCard(QuizAttemptSummary a) {
    final dateStr = DateFormat('dd MMM yyyy, hh:mm a').format(a.completedAt);
    final percentage = a.totalMarks > 0
        ? ((a.score / a.totalMarks) * 100).clamp(0.0, 100.0)
        : 0.0;
    final isPassed = percentage >= 40.0;

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
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                dateStr,
                style: const TextStyle(
                  fontFamily: 'Poppins',
                  fontSize: 11,
                  color: AppColors.textSecondary,
                ),
              ),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: (isPassed ? AppColors.success : AppColors.warning)
                      .withAlpha(20),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  isPassed ? 'Passed' : 'Needs Practice',
                  style: TextStyle(
                    fontFamily: 'Poppins',
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: isPassed ? AppColors.success : AppColors.warning,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            a.quizTitle,
            style: const TextStyle(
              fontFamily: 'Poppins',
              fontSize: 14,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildStatItem('Score', '${a.score.toStringAsFixed(1)} / ${a.totalMarks.toInt()}'),
                Container(height: 20, width: 1, color: AppColors.border),
                _buildStatItem('Accuracy', '${a.accuracy.toStringAsFixed(1)}%'),
                Container(height: 20, width: 1, color: AppColors.border),
                _buildStatItem('Percentage', '${percentage.toStringAsFixed(1)}%'),
              ],
            ),
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              OutlinedButton(
                onPressed: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (context) => QuizPlayerScreen(quizId: a.quizId),
                    ),
                  );
                },
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppColors.primary,
                  side: const BorderSide(color: AppColors.primary),
                  padding:
                      const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  minimumSize: Size.zero,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                child: const Text(
                  'Retake',
                  style: TextStyle(
                    fontFamily: 'Poppins',
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              ElevatedButton.icon(
                onPressed: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (context) =>
                          AttemptReportScreen(attemptId: a.id),
                    ),
                  );
                },
                icon: const Icon(Icons.visibility_outlined, size: 14),
                label: const Text('View Solutions'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  elevation: 0,
                  padding:
                      const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  minimumSize: Size.zero,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStatItem(String label, String value) {
    return Column(
      children: [
        Text(
          value,
          style: const TextStyle(
            fontFamily: 'Poppins',
            fontSize: 12,
            fontWeight: FontWeight.bold,
            color: AppColors.textPrimary,
          ),
        ),
        Text(
          label,
          style: const TextStyle(
            fontFamily: 'Poppins',
            fontSize: 10,
            color: AppColors.textSecondary,
          ),
        ),
      ],
    );
  }
}
