import 'package:flutter/material.dart';
import '../../models/models.dart';
import '../../theme.dart';

/// Focus Areas Widget displaying Strong & Weak Academic Topics with accuracy bars
class FocusAreasWidget extends StatelessWidget {
  final List<FocusArea> focusAreas;

  const FocusAreasWidget({
    super.key,
    required this.focusAreas,
  });

  @override
  Widget build(BuildContext context) {
    if (focusAreas.isEmpty) {
      return const SizedBox.shrink();
    }

    final strongAreas = focusAreas.where((f) => f.accuracyPercentage >= 70.0).toList();
    final weakAreas = focusAreas.where((f) => f.accuracyPercentage < 70.0).toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (weakAreas.isNotEmpty) ...[
          const Row(
            children: [
              Icon(Icons.warning_amber_rounded,
                  color: AppColors.warning, size: 20),
              SizedBox(width: 8),
              Text(
                'Focus Topics (Need Revision)',
                style: TextStyle(
                  fontFamily: 'Poppins',
                  fontSize: 15,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          ...weakAreas.map((area) => _buildTopicBar(area, isWeak: true)),
          const SizedBox(height: 20),
        ],
        if (strongAreas.isNotEmpty) ...[
          const Row(
            children: [
              Icon(Icons.check_circle_outline,
                  color: AppColors.success, size: 20),
              SizedBox(width: 8),
              Text(
                'Strong Topics (High Mastery)',
                style: TextStyle(
                  fontFamily: 'Poppins',
                  fontSize: 15,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          ...strongAreas.map((area) => _buildTopicBar(area, isWeak: false)),
        ],
      ],
    );
  }

  Widget _buildTopicBar(FocusArea area, {required bool isWeak}) {
    final color = isWeak ? AppColors.warning : AppColors.success;

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      area.topic,
                      style: const TextStyle(
                        fontFamily: 'Poppins',
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    Text(
                      '${area.subject} • ${area.questionsAttempted} Questions',
                      style: const TextStyle(
                        fontFamily: 'Poppins',
                        fontSize: 11,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
              Text(
                '${area.accuracyPercentage.toStringAsFixed(1)}%',
                style: TextStyle(
                  fontFamily: 'Poppins',
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: color,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: (area.accuracyPercentage / 100).clamp(0.0, 1.0),
              backgroundColor: AppColors.surface,
              valueColor: AlwaysStoppedAnimation<Color>(color),
              minHeight: 6,
            ),
          ),
        ],
      ),
    );
  }
}
