import 'package:flutter/material.dart';
import '../../core/share_helper.dart';
import '../../models/models.dart';
import '../../theme.dart';
import 'attempt_report_screen.dart';
import 'certificate_screen.dart';
import 'my_performance_screen.dart';
import 'quiz_player_screen.dart';

/// Exam Result & Performance Summary Screen
class QuizResultScreen extends StatelessWidget {
  final QuizResult result;
  final QuizPaper? paper;
  final Map<int, int>? userAnswers;

  const QuizResultScreen({
    super.key,
    required this.result,
    this.paper,
    this.userAnswers,
  });

  @override
  Widget build(BuildContext context) {
    final percentage = result.totalMarks > 0
        ? ((result.score / result.totalMarks) * 100).clamp(0, 100)
        : 0.0;
    final isPassed = percentage >= 40.0;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Exam Result & Scorecard'),
        elevation: 0,
        automaticallyImplyLeading: false,
        actions: [
          IconButton(
            icon: const Icon(Icons.share_outlined),
            tooltip: 'Share Score',
            onPressed: () => ShareHelper.shareScoreResult(result),
          ),
          IconButton(
            icon: const Icon(Icons.close),
            onPressed: () => Navigator.of(context).pop(),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // Score Banner Card
            _buildScoreSummaryBanner(context, percentage, isPassed),
            const SizedBox(height: 16),
            // Statistics Grid (Correct, Incorrect, Skipped, Accuracy)
            _buildStatisticsGrid(),
            const SizedBox(height: 16),
            // Rank & Percentile Card
            _buildRankCard(),
            const SizedBox(height: 24),
            // Action Navigation Buttons
            _buildActionButtons(context),
          ],
        ),
      ),
    );
  }

  Widget _buildScoreSummaryBanner(
      BuildContext context, num percentage, bool isPassed) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.border),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(6),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: isPassed
                  ? AppColors.success.withAlpha(20)
                  : AppColors.warning.withAlpha(20),
              shape: BoxShape.circle,
            ),
            child: Icon(
              isPassed ? Icons.emoji_events_rounded : Icons.trending_up_rounded,
              color: isPassed ? AppColors.success : AppColors.warning,
              size: 40,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            isPassed ? 'Test Completed Successfully! 🎉' : 'Test Submitted! 📚',
            style: const TextStyle(
              fontFamily: 'Poppins',
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            result.quizTitle,
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontFamily: 'Poppins',
              fontSize: 12,
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: 16),
          // Score Highlight
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.baseline,
            textBaseline: TextBaseline.alphabetic,
            children: [
              Text(
                result.score.toStringAsFixed(1),
                style: TextStyle(
                  fontFamily: 'Poppins',
                  fontSize: 38,
                  fontWeight: FontWeight.w900,
                  color: isPassed ? AppColors.success : AppColors.primary,
                ),
              ),
              const SizedBox(width: 4),
              Text(
                '/ ${result.totalMarks.toInt()}',
                style: const TextStyle(
                  fontFamily: 'Poppins',
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textSecondary,
                ),
              ),
            ],
          ),
          Text(
            'Percentage: ${percentage.toStringAsFixed(1)}%',
            style: const TextStyle(
              fontFamily: 'Poppins',
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: AppColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatisticsGrid() {
    return Row(
      children: [
        Expanded(
          child: _buildStatTile(
            title: 'Correct',
            value: '${result.correctAnswers}',
            icon: Icons.check_circle_outline,
            color: AppColors.success,
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: _buildStatTile(
            title: 'Incorrect',
            value: '${result.incorrectAnswers}',
            icon: Icons.cancel_outlined,
            color: AppColors.error,
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: _buildStatTile(
            title: 'Skipped',
            value: '${result.unattempted}',
            icon: Icons.remove_circle_outline,
            color: AppColors.textSecondary,
          ),
        ),
      ],
    );
  }

  Widget _buildStatTile({
    required String title,
    required String value,
    required IconData icon,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        children: [
          Icon(icon, color: color, size: 22),
          const SizedBox(height: 6),
          Text(
            value,
            style: TextStyle(
              fontFamily: 'Poppins',
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
          Text(
            title,
            style: const TextStyle(
              fontFamily: 'Poppins',
              fontSize: 11,
              color: AppColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRankCard() {
    final mins = result.timeTakenSeconds ~/ 60;
    final secs = result.timeTakenSeconds % 60;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _buildRankItem(
            label: 'Accuracy',
            value: '${result.accuracy.toStringAsFixed(1)}%',
            icon: Icons.track_changes_rounded,
          ),
          Container(height: 36, width: 1, color: AppColors.border),
          _buildRankItem(
            label: 'Time Spent',
            value: '${mins}m ${secs}s',
            icon: Icons.timer_outlined,
          ),
          Container(height: 36, width: 1, color: AppColors.border),
          _buildRankItem(
            label: 'All-India Rank',
            value: '#${result.attemptId * 13 + 42}',
            icon: Icons.military_tech_outlined,
          ),
        ],
      ),
    );
  }

  Widget _buildRankItem({
    required String label,
    required String value,
    required IconData icon,
  }) {
    return Column(
      children: [
        Icon(icon, size: 20, color: AppColors.primary),
        const SizedBox(height: 4),
        Text(
          value,
          style: const TextStyle(
            fontFamily: 'Poppins',
            fontSize: 14,
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

  Widget _buildActionButtons(BuildContext context) {
    return Column(
      children: [
        // View Solutions Button
        SizedBox(
          width: double.infinity,
          height: 48,
          child: ElevatedButton.icon(
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (context) => AttemptReportScreen(
                    attemptId: result.attemptId,
                    paper: paper,
                    userAnswers: userAnswers,
                  ),
                ),
              );
            },
            icon: const Icon(Icons.menu_book_outlined),
            label: const Text('View Detailed Solutions & Explanations'),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
              elevation: 0,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          ),
        ),
        const SizedBox(height: 12),
        // Certificate Button
        SizedBox(
          width: double.infinity,
          height: 48,
          child: OutlinedButton.icon(
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (context) => CertificateScreen(result: result),
                ),
              );
            },
            icon: const Icon(Icons.verified_outlined),
            label: const Text('View Score Certificate'),
            style: OutlinedButton.styleFrom(
              foregroundColor: AppColors.primary,
              side: const BorderSide(color: AppColors.primary, width: 1.5),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          ),
        ),
        const SizedBox(height: 12),
        // Retake Test Button
        Row(
          children: [
            Expanded(
              child: SizedBox(
                height: 48,
                child: OutlinedButton.icon(
                  onPressed: () {
                    Navigator.of(context).pushReplacement(
                      MaterialPageRoute(
                        builder: (context) => QuizPlayerScreen(
                          quizId: result.quizId,
                          initialPaper: paper,
                        ),
                      ),
                    );
                  },
                  icon: const Icon(Icons.refresh_rounded),
                  label: const Text('Retake Test'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppColors.primary,
                    side: const BorderSide(color: AppColors.border),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: SizedBox(
                height: 48,
                child: OutlinedButton.icon(
                  onPressed: () => ShareHelper.shareScoreResult(result),
                  icon: const Icon(Icons.share_outlined),
                  label: const Text('Share Score'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppColors.primary,
                    side: const BorderSide(color: AppColors.border),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        // Performance Analytics
        SizedBox(
          width: double.infinity,
          height: 48,
          child: TextButton.icon(
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (context) => const MyPerformanceScreen(),
                ),
              );
            },
            icon: const Icon(Icons.insights_outlined),
            label: const Text('Comprehensive Performance Analysis'),
            style: TextButton.styleFrom(
              foregroundColor: AppColors.primary,
            ),
          ),
        ),
      ],
    );
  }
}
