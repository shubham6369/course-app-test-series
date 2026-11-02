import '../models/models.dart';

/// Structured scoring calculation output for CBT tests
class CbtScoreResult {
  final double rawScore;
  final double maxMarks;
  final double scorePercentage;
  final double accuracy;
  final int correctCount;
  final int incorrectCount;
  final int unattemptedCount;
  final bool isPassed;

  const CbtScoreResult({
    required this.rawScore,
    required this.maxMarks,
    required this.scorePercentage,
    required this.accuracy,
    required this.correctCount,
    required this.incorrectCount,
    required this.unattemptedCount,
    required this.isPassed,
  });

  @override
  String toString() {
    return 'CbtScoreResult(score: $rawScore/$maxMarks ($scorePercentage%), accuracy: $accuracy%, correct: $correctCount, incorrect: $incorrectCount, skipped: $unattemptedCount, passed: $isPassed)';
  }
}

/// Core Computer-Based Testing (CBT) Scoring Engine
/// Implements NTA/GATE exam marking rules:
/// - S = (Q_c * M) - (Q_w * N)
/// - Accuracy = (Q_c / (Q_c + Q_w)) * 100
/// - Percentage = max(0, S / MaxScore * 100)
class CbtScoringEngine {
  /// Pure mathematical scoring formula: S = (Q_c * M) - (Q_w * N)
  static double computeRawScore({
    required int correctCount,
    required double marksPerCorrect,
    required int wrongCount,
    required double negativeMarksPerWrong,
  }) {
    return (correctCount * marksPerCorrect) - (wrongCount * negativeMarksPerWrong);
  }

  /// Accuracy percentage: (Q_c / (Q_c + Q_w)) * 100
  /// Returns 0.0 if no questions were attempted.
  static double computeAccuracy({
    required int correctCount,
    required int wrongCount,
  }) {
    final totalAttempted = correctCount + wrongCount;
    if (totalAttempted <= 0) return 0.0;
    return (correctCount / totalAttempted) * 100.0;
  }

  /// Score percentage clamped to [0.0, 100.0]
  static double computePercentage({
    required double rawScore,
    required double maxScore,
  }) {
    if (maxScore <= 0) return 0.0;
    final pct = (rawScore / maxScore) * 100.0;
    if (pct < 0.0) return 0.0;
    if (pct > 100.0) return 100.0;
    return pct;
  }

  /// Evaluates an entire QuizPaper against user's selected answers map:
  /// [selectedAnswers]: Map of questionId -> selectedOptionIndex (0-based)
  static CbtScoreResult evaluatePaper({
    required QuizPaper paper,
    required Map<int, int> selectedAnswers,
    double passingPercentageThreshold = 40.0,
  }) {
    int correctCount = 0;
    int incorrectCount = 0;
    int unattemptedCount = 0;
    double totalRawScore = 0.0;
    double totalMaxMarks = 0.0;

    for (final q in paper.questions) {
      final marks = q.marks > 0 ? q.marks : 1.0;
      final negMarks = q.negativeMarks >= 0 ? q.negativeMarks : 0.0;
      totalMaxMarks += marks;

      final selectedOpt = selectedAnswers[q.id];
      if (selectedOpt == null) {
        unattemptedCount++;
      } else if (q.correctOption != null && selectedOpt == q.correctOption) {
        correctCount++;
        totalRawScore += marks;
      } else {
        incorrectCount++;
        totalRawScore -= negMarks;
      }
    }

    final accuracy = computeAccuracy(
      correctCount: correctCount,
      wrongCount: incorrectCount,
    );

    final scorePercentage = computePercentage(
      rawScore: totalRawScore,
      maxScore: totalMaxMarks,
    );

    final isPassed = scorePercentage >= passingPercentageThreshold;

    return CbtScoreResult(
      rawScore: totalRawScore,
      maxMarks: totalMaxMarks,
      scorePercentage: scorePercentage,
      accuracy: accuracy,
      correctCount: correctCount,
      incorrectCount: incorrectCount,
      unattemptedCount: unattemptedCount,
      isPassed: isPassed,
    );
  }

  /// Converts evaluation to a full QuizResult model
  static QuizResult toQuizResult({
    required QuizPaper paper,
    required Map<int, int> selectedAnswers,
    required int timeTakenSeconds,
    int attemptId = 1,
    int rank = 1,
    int totalParticipants = 1000,
    double percentile = 95.0,
  }) {
    final eval = evaluatePaper(paper: paper, selectedAnswers: selectedAnswers);
    return QuizResult(
      attemptId: attemptId,
      quizId: paper.id,
      quizTitle: paper.title,
      score: eval.rawScore,
      totalMarks: eval.maxMarks,
      correctAnswers: eval.correctCount,
      incorrectAnswers: eval.incorrectCount,
      unattempted: eval.unattemptedCount,
      accuracy: eval.accuracy,
      timeTakenSeconds: timeTakenSeconds,
      rank: rank,
      totalParticipants: totalParticipants,
      percentile: percentile,
      isPassed: eval.isPassed,
    );
  }
}
