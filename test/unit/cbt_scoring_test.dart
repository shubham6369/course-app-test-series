import 'package:flutter_test/flutter_test.dart';
import 'package:test_series/core/cbt_scoring_engine.dart';
import 'package:test_series/models/models.dart';

void main() {
  group('CBT Scoring Formula Unit Tests (S = Qc * M - Qw * N)', () {
    test('computeRawScore calculates standard NEET/JEE marking (+4, -1)', () {
      // 10 correct, 0 wrong
      final perfect = CbtScoringEngine.computeRawScore(
        correctCount: 10,
        marksPerCorrect: 4.0,
        wrongCount: 0,
        negativeMarksPerWrong: 1.0,
      );
      expect(perfect, 40.0);

      // 8 correct, 2 wrong -> 32 - 2 = 30
      final mixed = CbtScoringEngine.computeRawScore(
        correctCount: 8,
        marksPerCorrect: 4.0,
        wrongCount: 2,
        negativeMarksPerWrong: 1.0,
      );
      expect(mixed, 30.0);

      // 0 correct, 10 wrong -> 0 - 10 = -10
      final allWrong = CbtScoringEngine.computeRawScore(
        correctCount: 0,
        marksPerCorrect: 4.0,
        wrongCount: 10,
        negativeMarksPerWrong: 1.0,
      );
      expect(allWrong, -10.0);
    });

    test('computeRawScore handles fractional marks (+1.0, -0.25)', () {
      final score = CbtScoringEngine.computeRawScore(
        correctCount: 7,
        marksPerCorrect: 1.0,
        wrongCount: 3,
        negativeMarksPerWrong: 0.25,
      );
      expect(score, closeTo(7.0 - 0.75, 0.001));
    });

    test('computeAccuracy calculates correct percentage of attempted questions', () {
      // 0 attempted
      expect(
        CbtScoringEngine.computeAccuracy(correctCount: 0, wrongCount: 0),
        0.0,
      );

      // 10 correct, 0 wrong -> 100%
      expect(
        CbtScoringEngine.computeAccuracy(correctCount: 10, wrongCount: 0),
        100.0,
      );

      // 5 correct, 5 wrong -> 50%
      expect(
        CbtScoringEngine.computeAccuracy(correctCount: 5, wrongCount: 5),
        50.0,
      );

      // 9 correct, 1 wrong -> 90%
      expect(
        CbtScoringEngine.computeAccuracy(correctCount: 9, wrongCount: 1),
        90.0,
      );

      // 3 correct, 1 wrong -> 75%
      expect(
        CbtScoringEngine.computeAccuracy(correctCount: 3, wrongCount: 1),
        75.0,
      );
    });

    test('computePercentage clamps negative scores to 0.0% and max to 100.0%', () {
      // Normal positive percentage: 30 / 40 = 75%
      expect(
        CbtScoringEngine.computePercentage(rawScore: 30, maxScore: 40),
        75.0,
      );

      // Negative score is clamped to 0.0%
      expect(
        CbtScoringEngine.computePercentage(rawScore: -8, maxScore: 40),
        0.0,
      );

      // Perfect score: 40 / 40 = 100%
      expect(
        CbtScoringEngine.computePercentage(rawScore: 40, maxScore: 40),
        100.0,
      );

      // Zero max marks returns 0.0%
      expect(
        CbtScoringEngine.computePercentage(rawScore: 10, maxScore: 0),
        0.0,
      );
    });
  });

  group('CBT Exam Paper Evaluation Engine Tests', () {
    late QuizPaper testPaper;

    setUp(() {
      testPaper = QuizPaper(
        id: 101,
        title: 'NEET Practice Drill',
        durationMinutes: 60,
        totalMarks: 40.0,
        negativeMarks: 1.0,
        questions: List.generate(
          10,
          (i) => QuizQuestion(
            id: i + 1,
            questionNumber: i + 1,
            questionText: 'Sample Question ${i + 1}',
            options: ['Option A', 'Option B', 'Option C', 'Option D'],
            correctOption: i % 4, // 0, 1, 2, 3
            marks: 4.0,
            negativeMarks: 1.0,
          ),
        ),
      );
    });

    test('Perfect attempt evaluates to full marks and 100% accuracy', () {
      final answers = {
        for (var i = 0; i < 10; i++) i + 1: i % 4,
      };

      final result = CbtScoringEngine.evaluatePaper(
        paper: testPaper,
        selectedAnswers: answers,
      );

      expect(result.rawScore, 40.0);
      expect(result.maxMarks, 40.0);
      expect(result.scorePercentage, 100.0);
      expect(result.accuracy, 100.0);
      expect(result.correctCount, 10);
      expect(result.incorrectCount, 0);
      expect(result.unattemptedCount, 0);
      expect(result.isPassed, isTrue);
    });

    test('Mixed attempt applies positive marks, negative penalties and counts unattempted', () {
      // Questions 1..6: correct
      // Question 7..8: incorrect
      // Question 9..10: skipped
      final answers = <int, int>{
        1: 0, // correct
        2: 1, // correct
        3: 2, // correct
        4: 3, // correct
        5: 0, // correct
        6: 1, // correct
        7: 0, // correct is 2 -> wrong
        8: 1, // correct is 3 -> wrong
        // 9 skipped
        // 10 skipped
      };

      final result = CbtScoringEngine.evaluatePaper(
        paper: testPaper,
        selectedAnswers: answers,
      );

      // 6 correct * 4 = 24
      // 2 wrong * 1 = -2
      // Raw score = 22
      expect(result.rawScore, 22.0);
      expect(result.correctCount, 6);
      expect(result.incorrectCount, 2);
      expect(result.unattemptedCount, 2);
      // Accuracy = 6 / (6 + 2) * 100 = 75.0%
      expect(result.accuracy, 75.0);
      // Percentage = 22 / 40 * 100 = 55.0%
      expect(result.scorePercentage, closeTo(55.0, 0.001));
      expect(result.isPassed, isTrue); // > 40%
    });

    test('All unattempted questions result in 0 score and 0 accuracy', () {
      final result = CbtScoringEngine.evaluatePaper(
        paper: testPaper,
        selectedAnswers: {},
      );

      expect(result.rawScore, 0.0);
      expect(result.correctCount, 0);
      expect(result.incorrectCount, 0);
      expect(result.unattemptedCount, 10);
      expect(result.accuracy, 0.0);
      expect(result.scorePercentage, 0.0);
      expect(result.isPassed, isFalse);
    });

    test('Negative marking can produce net negative raw score', () {
      // 1 correct (+4), 9 wrong (-9) -> Raw = -5
      final answers = <int, int>{
        1: 0, // correct
        for (var i = 1; i < 10; i++) i + 1: (i % 4 == 0 ? 1 : 0), // all wrong
      };

      final result = CbtScoringEngine.evaluatePaper(
        paper: testPaper,
        selectedAnswers: answers,
      );

      expect(result.rawScore, -5.0);
      expect(result.correctCount, 1);
      expect(result.incorrectCount, 9);
      expect(result.accuracy, 10.0);
      expect(result.scorePercentage, 0.0); // clamped to 0
      expect(result.isPassed, isFalse);
    });

    test('toQuizResult produces complete QuizResult model', () {
      final answers = {1: 0, 2: 1, 3: 2};
      final quizResult = CbtScoringEngine.toQuizResult(
        paper: testPaper,
        selectedAnswers: answers,
        timeTakenSeconds: 300,
        rank: 5,
        totalParticipants: 500,
        percentile: 99.0,
      );

      expect(quizResult.quizId, 101);
      expect(quizResult.quizTitle, 'NEET Practice Drill');
      expect(quizResult.correctAnswers, 3);
      expect(quizResult.unattempted, 7);
      expect(quizResult.timeTakenSeconds, 300);
      expect(quizResult.rank, 5);
      expect(quizResult.percentile, 99.0);
    });
  });
}
