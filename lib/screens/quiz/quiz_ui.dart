import 'package:flutter/material.dart';
import '../../theme.dart';

/// 5 distinct states according to National Testing Agency (NTA) CBT specifications
enum CbtQuestionState {
  notVisited,
  notAnswered,
  answered,
  markedForReview,
  answeredAndMarked,
}

class CbtUiColors {
  static const Color notVisited = Color(0xFFE2E8F0); // Light Grey
  static const Color notAnswered = Color(0xFFEF4444); // Red
  static const Color answered = Color(0xFF10B981); // Green
  static const Color markedForReview = Color(0xFF8B5CF6); // Purple
  static const Color answeredAndMarked = Color(0xFF6366F1); // Indigo / Purple with Green dot
}

/// Digital Countdown Timer with warning threshold
class CbtCountdownTimer extends StatelessWidget {
  final int remainingSeconds;
  final VoidCallback? onTimeout;

  const CbtCountdownTimer({
    super.key,
    required this.remainingSeconds,
    this.onTimeout,
  });

  @override
  Widget build(BuildContext context) {
    final hours = remainingSeconds ~/ 3600;
    final minutes = (remainingSeconds % 3600) ~/ 60;
    final seconds = remainingSeconds % 60;

    final isUrgent = remainingSeconds <= 300 && remainingSeconds > 0; // < 5 mins

    final timeString = hours > 0
        ? '${_twoDigits(hours)}:${_twoDigits(minutes)}:${_twoDigits(seconds)}'
        : '${_twoDigits(minutes)}:${_twoDigits(seconds)}';

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: isUrgent ? AppColors.error.withAlpha(25) : AppColors.surface,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: isUrgent ? AppColors.error : AppColors.border,
          width: 1.2,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            Icons.timer_outlined,
            size: 16,
            color: isUrgent ? AppColors.error : AppColors.textPrimary,
          ),
          const SizedBox(width: 6),
          Text(
            timeString,
            style: TextStyle(
              fontFamily: 'Poppins',
              fontSize: 13,
              fontWeight: FontWeight.w700,
              color: isUrgent ? AppColors.error : AppColors.textPrimary,
            ),
          ),
        ],
      ),
    );
  }

  static String _twoDigits(int n) => n.toString().padLeft(2, '0');
}

/// Full NTA Question Palette Legend showing all 5 color states & counts
class CbtPaletteLegend extends StatelessWidget {
  final Map<CbtQuestionState, int> stateCounts;

  const CbtPaletteLegend({
    super.key,
    required this.stateCounts,
  });

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 12,
      runSpacing: 8,
      alignment: WrapAlignment.center,
      children: [
        _buildLegendItem(
          CbtUiColors.answered,
          'Answered (${stateCounts[CbtQuestionState.answered] ?? 0})',
        ),
        _buildLegendItem(
          CbtUiColors.notAnswered,
          'Not Answered (${stateCounts[CbtQuestionState.notAnswered] ?? 0})',
        ),
        _buildLegendItem(
          CbtUiColors.notVisited,
          'Not Visited (${stateCounts[CbtQuestionState.notVisited] ?? 0})',
          textColor: AppColors.textSecondary,
        ),
        _buildLegendItem(
          CbtUiColors.markedForReview,
          'Marked for Review (${stateCounts[CbtQuestionState.markedForReview] ?? 0})',
        ),
        _buildLegendItem(
          CbtUiColors.answeredAndMarked,
          'Ans & Marked (${stateCounts[CbtQuestionState.answeredAndMarked] ?? 0})',
          hasDot: true,
        ),
      ],
    );
  }

  Widget _buildLegendItem(
    Color color,
    String label, {
    Color? textColor,
    bool hasDot = false,
  }) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Stack(
          alignment: Alignment.bottomRight,
          children: [
            Container(
              width: 18,
              height: 18,
              decoration: BoxDecoration(
                color: color,
                borderRadius: BorderRadius.circular(4),
                border: Border.all(
                  color: color == CbtUiColors.notVisited
                      ? AppColors.border
                      : Colors.transparent,
                ),
              ),
            ),
            if (hasDot)
              Container(
                width: 6,
                height: 6,
                decoration: const BoxDecoration(
                  color: CbtUiColors.answered,
                  shape: BoxShape.circle,
                ),
              ),
          ],
        ),
        const SizedBox(width: 6),
        Text(
          label,
          style: TextStyle(
            fontFamily: 'Poppins',
            fontSize: 11,
            fontWeight: FontWeight.w500,
            color: textColor ?? AppColors.textPrimary,
          ),
        ),
      ],
    );
  }
}

/// Question Grid Button inside the Palette
class CbtQuestionTile extends StatelessWidget {
  final int questionNumber;
  final CbtQuestionState state;
  final bool isCurrent;
  final VoidCallback onTap;

  const CbtQuestionTile({
    super.key,
    required this.questionNumber,
    required this.state,
    required this.isCurrent,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    Color bgColor;
    Color textColor = Colors.white;
    bool hasGreenDot = false;

    switch (state) {
      case CbtQuestionState.answered:
        bgColor = CbtUiColors.answered;
        break;
      case CbtQuestionState.notAnswered:
        bgColor = CbtUiColors.notAnswered;
        break;
      case CbtQuestionState.markedForReview:
        bgColor = CbtUiColors.markedForReview;
        break;
      case CbtQuestionState.answeredAndMarked:
        bgColor = CbtUiColors.answeredAndMarked;
        hasGreenDot = true;
        break;
      case CbtQuestionState.notVisited:
        bgColor = CbtUiColors.notVisited;
        textColor = AppColors.textPrimary;
        break;
    }

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Container(
        decoration: BoxDecoration(
          color: bgColor,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: isCurrent ? AppColors.primary : Colors.transparent,
            width: isCurrent ? 2.5 : 0,
          ),
          boxShadow: isCurrent
              ? [
                  BoxShadow(
                    color: AppColors.primary.withAlpha(80),
                    blurRadius: 6,
                    offset: const Offset(0, 2),
                  ),
                ]
              : null,
        ),
        child: Stack(
          alignment: Alignment.center,
          children: [
            Text(
              '$questionNumber',
              style: TextStyle(
                fontFamily: 'Poppins',
                fontSize: 13,
                fontWeight: FontWeight.bold,
                color: textColor,
              ),
            ),
            if (hasGreenDot)
              Positioned(
                bottom: 3,
                right: 3,
                child: Container(
                  width: 6,
                  height: 6,
                  decoration: const BoxDecoration(
                    color: CbtUiColors.answered,
                    shape: BoxShape.circle,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

/// CBT Question Option Selection Tile (Single / Multi Choice)
class CbtOptionTile extends StatelessWidget {
  final int index;
  final String label;
  final String text;
  final bool isSelected;
  final VoidCallback onTap;

  const CbtOptionTile({
    super.key,
    required this.index,
    required this.label,
    required this.text,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary.withAlpha(15) : Colors.white,
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
                  label,
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
                text,
                style: TextStyle(
                  fontFamily: 'Poppins',
                  fontSize: 13,
                  fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                  color: isSelected ? AppColors.primary : AppColors.textPrimary,
                ),
              ),
            ),
            if (isSelected)
              const Icon(
                Icons.check_circle_rounded,
                color: AppColors.primary,
                size: 20,
              ),
          ],
        ),
      ),
    );
  }
}

/// CBT Navigation Action Toolbar
class CbtBottomActionBar extends StatelessWidget {
  final bool hasAnswer;
  final bool isLastQuestion;
  final bool canGoBack;
  final VoidCallback? onClear;
  final VoidCallback onMarkAndNext;
  final VoidCallback? onPrevious;
  final VoidCallback onSaveAndNext;

  const CbtBottomActionBar({
    super.key,
    required this.hasAnswer,
    required this.isLastQuestion,
    required this.canGoBack,
    this.onClear,
    required this.onMarkAndNext,
    this.onPrevious,
    required this.onSaveAndNext,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: AppColors.border)),
      ),
      child: Row(
        children: [
          if (hasAnswer && onClear != null)
            TextButton(
              onPressed: onClear,
              style: TextButton.styleFrom(
                foregroundColor: AppColors.error,
              ),
              child: const Text('Clear'),
            ),
          OutlinedButton(
            onPressed: onMarkAndNext,
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
          if (canGoBack && onPrevious != null)
            IconButton(
              icon: const Icon(Icons.arrow_back_ios_rounded, size: 18),
              tooltip: 'Previous Question',
              onPressed: onPrevious,
            ),
          const SizedBox(width: 4),
          ElevatedButton(
            onPressed: onSaveAndNext,
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            ),
            child: Text(
              isLastQuestion ? 'Save & Review' : 'Save & Next',
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

