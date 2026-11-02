import 'package:flutter/material.dart';
import '../../models/models.dart';
import '../../theme.dart';

/// Circular Accuracy Ring Widget with percentage and status indicator
class AccuracyRingWidget extends StatelessWidget {
  final double accuracy;
  final double size;
  final double strokeWidth;
  final Color? color;

  const AccuracyRingWidget({
    super.key,
    required this.accuracy,
    this.size = 100,
    this.strokeWidth = 8,
    this.color,
  });

  @override
  Widget build(BuildContext context) {
    final ringColor = color ??
        (accuracy >= 80.0
            ? AppColors.success
            : (accuracy >= 50.0 ? AppColors.primary : AppColors.error));

    return SizedBox(
      width: size,
      height: size,
      child: Stack(
        alignment: Alignment.center,
        children: [
          SizedBox(
            width: size,
            height: size,
            child: CircularProgressIndicator(
              value: (accuracy / 100).clamp(0.0, 1.0),
              strokeWidth: strokeWidth,
              backgroundColor: AppColors.surface,
              valueColor: AlwaysStoppedAnimation<Color>(ringColor),
              strokeCap: StrokeCap.round,
            ),
          ),
          Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                '${accuracy.toStringAsFixed(1)}%',
                style: TextStyle(
                  fontFamily: 'Poppins',
                  fontSize: size * 0.22,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary,
                ),
              ),
              Text(
                'Accuracy',
                style: TextStyle(
                  fontFamily: 'Poppins',
                  fontSize: size * 0.11,
                  color: AppColors.textSecondary,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

/// Score Gauge Card with pass/fail status and detailed metrics breakdown
class ScoreGaugeCard extends StatelessWidget {
  final QuizResult result;

  const ScoreGaugeCard({
    super.key,
    required this.result,
  });

  @override
  Widget build(BuildContext context) {
    final percentage = result.totalMarks > 0
        ? ((result.score / result.totalMarks) * 100).clamp(0.0, 100.0)
        : 0.0;
    final isPassed = result.isPassed || percentage >= 40.0;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(5),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    result.quizTitle,
                    style: const TextStyle(
                      fontFamily: 'Poppins',
                      fontSize: 15,
                      fontWeight: FontWeight.bold,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    isPassed ? 'Passed Examination 🎯' : 'Needs Practice 📚',
                    style: TextStyle(
                      fontFamily: 'Poppins',
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: isPassed ? AppColors.success : AppColors.warning,
                    ),
                  ),
                ],
              ),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: (isPassed ? AppColors.success : AppColors.warning)
                      .withAlpha(20),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  isPassed ? 'QUALIFIED' : 'ATTEMPTED',
                  style: TextStyle(
                    fontFamily: 'Poppins',
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    color: isPassed ? AppColors.success : AppColors.warning,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              AccuracyRingWidget(
                accuracy: result.accuracy,
                size: 96,
                strokeWidth: 8,
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildMetricLine(
                    'Score',
                    '${result.score.toStringAsFixed(1)} / ${result.totalMarks.toInt()}',
                    AppColors.primary,
                  ),
                  const SizedBox(height: 6),
                  _buildMetricLine(
                    'Percentile',
                    '${result.percentile.toStringAsFixed(1)}%ile',
                    AppColors.accent,
                  ),
                  const SizedBox(height: 6),
                  _buildMetricLine(
                    'Rank',
                    '#${result.rank} of ${result.totalParticipants}',
                    AppColors.textPrimary,
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildMetricLine(String label, String value, Color color) {
    return Row(
      children: [
        Container(
          width: 8,
          height: 8,
          decoration: BoxDecoration(
            color: color,
            shape: BoxShape.circle,
          ),
        ),
        const SizedBox(width: 8),
        Text(
          '$label: ',
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
            color: color,
          ),
        ),
      ],
    );
  }
}

/// Question Breakdown Bar showing Correct, Incorrect, and Skipped counts
class QuestionBreakdownBar extends StatelessWidget {
  final int correct;
  final int incorrect;
  final int unattempted;
  final int total;

  const QuestionBreakdownBar({
    super.key,
    required this.correct,
    required this.incorrect,
    required this.unattempted,
    required this.total,
  });

  @override
  Widget build(BuildContext context) {
    final effectiveTotal = total > 0 ? total : (correct + incorrect + unattempted);
    if (effectiveTotal == 0) return const SizedBox.shrink();

    final correctFlex = (correct * 1000 ~/ effectiveTotal);
    final incorrectFlex = (incorrect * 1000 ~/ effectiveTotal);
    final unattemptedFlex = (unattempted * 1000 ~/ effectiveTotal);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        ClipRRect(
          borderRadius: BorderRadius.circular(6),
          child: SizedBox(
            height: 10,
            child: Row(
              children: [
                if (correctFlex > 0)
                  Expanded(
                    flex: correctFlex,
                    child: Container(color: AppColors.success),
                  ),
                if (incorrectFlex > 0)
                  Expanded(
                    flex: incorrectFlex,
                    child: Container(color: AppColors.error),
                  ),
                if (unattemptedFlex > 0)
                  Expanded(
                    flex: unattemptedFlex,
                    child: Container(color: AppColors.border),
                  ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 10),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            _buildLegend(AppColors.success, 'Correct ($correct)'),
            _buildLegend(AppColors.error, 'Incorrect ($incorrect)'),
            _buildLegend(AppColors.textSecondary, 'Skipped ($unattempted)'),
          ],
        ),
      ],
    );
  }

  Widget _buildLegend(Color color, String text) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 8,
          height: 8,
          decoration: BoxDecoration(
            color: color,
            shape: BoxShape.circle,
          ),
        ),
        const SizedBox(width: 4),
        Text(
          text,
          style: const TextStyle(
            fontFamily: 'Poppins',
            fontSize: 11,
            color: AppColors.textSecondary,
          ),
        ),
      ],
    );
  }
}
