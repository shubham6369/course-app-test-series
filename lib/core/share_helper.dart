import 'package:flutter/foundation.dart';
import 'package:share_plus/share_plus.dart';
import '../models/models.dart';

class ShareHelper {
  /// Shares generic text / invitation / message
  static Future<void> shareText(String text, {String? subject}) async {
    try {
      await Share.share(text, subject: subject);
    } catch (e) {
      debugPrint('ShareHelper.shareText error: $e');
    }
  }

  /// Shares a student's score card summary
  static Future<void> shareScoreResult(QuizResult result) async {
    final message = '''
🎯 I just completed "${result.quizTitle}" on Test Series!
📊 My Score: ${result.score.toStringAsFixed(1)}/${result.totalMarks.toStringAsFixed(1)}
⚡ Accuracy: ${result.accuracy.toStringAsFixed(1)}%
🏆 Rank: #${result.rank} (${result.percentile.toStringAsFixed(1)}th Percentile)

Practice tests and boost your exam rank today!
Download Test Series App: https://edu.d3vx.in/test-series/app
''';
    await shareText(message, subject: 'My Exam Result - ${result.quizTitle}');
  }

  /// Shares a certificate file or text card
  static Future<void> shareCertificate({
    required String studentName,
    required String quizTitle,
    required double score,
    required double totalMarks,
    String? certificateFilePath,
  }) async {
    if (certificateFilePath != null && certificateFilePath.isNotEmpty) {
      await shareFile(
        certificateFilePath,
        text: 'Certificate of Excellence awarded to $studentName for $quizTitle with score $score/$totalMarks.',
        subject: 'Certificate of Achievement - $quizTitle',
      );
      return;
    }

    final message = '''
🎓 Certificate of Achievement
Awarded to: $studentName
For outstanding performance in "$quizTitle"
Score: ${score.toStringAsFixed(1)} / ${totalMarks.toStringAsFixed(1)}

Verified by Test Series Learning Platform.
''';
    await shareText(message, subject: 'Certificate of Achievement - $quizTitle');
  }

  /// Shares a local file (e.g. PDF report, image, certificate)
  static Future<void> shareFile(String filePath, {String? text, String? subject}) async {
    try {
      await Share.shareXFiles(
        [XFile(filePath)],
        text: text,
        subject: subject,
      );
    } catch (e) {
      debugPrint('ShareHelper.shareFile error: $e');
    }
  }
}
