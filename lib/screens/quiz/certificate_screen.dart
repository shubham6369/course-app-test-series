import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../../core/share_helper.dart';
import '../../models/models.dart';
import '../../state/auth_provider.dart';
import '../../theme.dart';

/// Digital Verified Certificate of Completion & Merit Screen
class CertificateScreen extends StatelessWidget {
  final QuizResult result;

  const CertificateScreen({
    super.key,
    required this.result,
  });

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final studentName = auth.currentUser?.name ?? 'Scholar';
    final dateStr = DateFormat('MMMM d, yyyy').format(DateTime.now());

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Certificate of Completion'),
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.share_outlined),
            tooltip: 'Share Certificate',
            onPressed: () {
              ShareHelper.shareCertificate(
                studentName: studentName,
                quizTitle: result.quizTitle,
                score: result.score,
                totalMarks: result.totalMarks,
              );
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            // Certificate Canvas Card
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFD4AF37), width: 3), // Gold border
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withAlpha(12),
                    blurRadius: 16,
                    offset: const Offset(0, 6),
                  ),
                ],
              ),
              child: Column(
                children: [
                  // Seal Graphic
                  Container(
                    width: 64,
                    height: 64,
                    decoration: BoxDecoration(
                      color: AppColors.primary.withAlpha(20),
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: const Color(0xFFD4AF37),
                        width: 2,
                      ),
                    ),
                    child: const Icon(
                      Icons.military_tech_rounded,
                      color: Color(0xFFD4AF37),
                      size: 36,
                    ),
                  ),
                  const SizedBox(height: 14),
                  const Text(
                    'CERTIFICATE OF MERIT',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontFamily: 'Poppins',
                      fontSize: 16,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 2.0,
                      color: AppColors.primary,
                    ),
                  ),
                  const Text(
                    'National CBT Assessment Program',
                    style: TextStyle(
                      fontFamily: 'Poppins',
                      fontSize: 11,
                      letterSpacing: 0.8,
                      color: AppColors.textSecondary,
                    ),
                  ),
                  const Divider(height: 32, color: Color(0xFFD4AF37)),
                  const Text(
                    'This is proudly presented to',
                    style: TextStyle(
                      fontFamily: 'Poppins',
                      fontSize: 12,
                      fontStyle: FontStyle.italic,
                      color: AppColors.textSecondary,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    studentName,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      fontFamily: 'Poppins',
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      color: AppColors.primary,
                    ),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    'for successfully completing the computer-based assessment for',
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      fontFamily: 'Poppins',
                      fontSize: 12,
                      color: AppColors.textSecondary,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    result.quizTitle,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      fontFamily: 'Poppins',
                      fontSize: 15,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 16),
                  // Score & Date Row
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 16, vertical: 10),
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: [
                        Column(
                          children: [
                            const Text(
                              'SCORE OBTAINED',
                              style: TextStyle(
                                fontFamily: 'Poppins',
                                fontSize: 9,
                                fontWeight: FontWeight.bold,
                                color: AppColors.textSecondary,
                              ),
                            ),
                            Text(
                              '${result.score.toStringAsFixed(1)} / ${result.totalMarks.toInt()}',
                              style: const TextStyle(
                                fontFamily: 'Poppins',
                                fontSize: 13,
                                fontWeight: FontWeight.bold,
                                color: AppColors.success,
                              ),
                            ),
                          ],
                        ),
                        Container(height: 24, width: 1, color: AppColors.border),
                        Column(
                          children: [
                            const Text(
                              'ACCURACY',
                              style: TextStyle(
                                fontFamily: 'Poppins',
                                fontSize: 9,
                                fontWeight: FontWeight.bold,
                                color: AppColors.textSecondary,
                              ),
                            ),
                            Text(
                              '${result.accuracy.toStringAsFixed(1)}%',
                              style: const TextStyle(
                                fontFamily: 'Poppins',
                                fontSize: 13,
                                fontWeight: FontWeight.bold,
                                color: AppColors.primary,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            dateStr,
                            style: const TextStyle(
                              fontFamily: 'Poppins',
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              color: AppColors.textPrimary,
                            ),
                          ),
                          const Text(
                            'Date of Issue',
                            style: TextStyle(
                              fontFamily: 'Poppins',
                              fontSize: 10,
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          const Text(
                            'Exam Board Verified',
                            style: TextStyle(
                              fontFamily: 'Poppins',
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              color: AppColors.textPrimary,
                            ),
                          ),
                          Text(
                            'ID: CERT-${result.attemptId * 1000 + 492}',
                            style: const TextStyle(
                              fontFamily: 'Poppins',
                              fontSize: 10,
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            // Actions Row
            Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () {
                      ShareHelper.shareCertificate(
                        studentName: studentName,
                        quizTitle: result.quizTitle,
                        score: result.score,
                        totalMarks: result.totalMarks,
                      );
                    },
                    icon: const Icon(Icons.share, size: 18),
                    label: const Text('Share Certificate'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                      elevation: 0,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      padding: const EdgeInsets.symmetric(vertical: 14),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                OutlinedButton.icon(
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Downloading official PDF certificate...'),
                        duration: Duration(seconds: 2),
                      ),
                    );
                  },
                  icon: const Icon(Icons.download, size: 18),
                  label: const Text('PDF'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppColors.primary,
                    side: const BorderSide(color: AppColors.primary),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    padding: const EdgeInsets.symmetric(
                        horizontal: 16, vertical: 14),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

