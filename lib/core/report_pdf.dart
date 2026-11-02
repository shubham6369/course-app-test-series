import 'dart:io';
import 'package:intl/intl.dart';
import 'package:path_provider/path_provider.dart';
import '../models/models.dart';

class ReportPdfGenerator {
  /// Generates a structured test score report file that can be saved, viewed, or shared.
  static Future<File> generateAttemptReport({
    required QuizResult result,
    required String studentName,
    List<QuestionReview>? questions,
  }) async {
    final tempDir = await getTemporaryDirectory();
    final dateFormat = DateFormat('dd MMM yyyy, hh:mm a');
    final formattedDate = dateFormat.format(DateTime.now());

    final buffer = StringBuffer();
    buffer.writeln('====================================================');
    buffer.writeln('            TEST SERIES SCORE REPORT                ');
    buffer.writeln('====================================================');
    buffer.writeln('Test Title:      ${result.quizTitle}');
    buffer.writeln('Candidate Name:  $studentName');
    buffer.writeln('Date & Time:     $formattedDate');
    buffer.writeln('Attempt ID:      #${result.attemptId}');
    buffer.writeln('Status:          ${result.isPassed ? "PASSED" : "NEEDS IMPROVEMENT"}');
    buffer.writeln('----------------------------------------------------');
    buffer.writeln('PERFORMANCE METRICS:');
    buffer.writeln('Total Marks:     ${result.score.toStringAsFixed(1)} / ${result.totalMarks.toStringAsFixed(1)}');
    buffer.writeln('Accuracy:        ${result.accuracy.toStringAsFixed(1)}%');
    buffer.writeln('Percentile:      ${result.percentile.toStringAsFixed(1)}th Percentile');
    buffer.writeln('All India Rank:  #${result.rank} of ${result.totalParticipants}');
    buffer.writeln('Time Spent:      ${result.timeTakenSeconds ~/ 60}m ${result.timeTakenSeconds % 60}s');
    buffer.writeln('Correct Answers: ${result.correctAnswers}');
    buffer.writeln('Incorrect:       ${result.incorrectAnswers}');
    buffer.writeln('Unattempted:     ${result.unattempted}');
    buffer.writeln('----------------------------------------------------');

    if (questions != null && questions.isNotEmpty) {
      buffer.writeln('QUESTION-WISE BREAKDOWN:');
      for (int i = 0; i < questions.length; i++) {
        final q = questions[i];
        final status = q.isCorrect
            ? 'CORRECT (+${q.question.marks})'
            : q.selectedOption == null
                ? 'SKIPPED (0)'
                : 'WRONG (-${q.question.negativeMarks})';
        buffer.writeln('Q${i + 1}: ${q.question.questionText}');
        buffer.writeln('   Selected: Option ${(q.selectedOption ?? -1) + 1} | Status: $status | Time: ${q.timeSpentSeconds}s');
        if (q.question.explanation != null) {
          buffer.writeln('   Explanation: ${q.question.explanation}');
        }
        buffer.writeln('');
      }
    }

    buffer.writeln('====================================================');
    buffer.writeln('Verified by Test Series Learning Platform');
    buffer.writeln('====================================================');

    final filePath = '${tempDir.path}/Report_${result.attemptId}.txt';
    final file = File(filePath);
    await file.writeAsString(buffer.toString());
    return file;
  }
}
