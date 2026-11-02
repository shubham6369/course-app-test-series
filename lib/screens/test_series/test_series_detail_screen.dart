import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/api_service.dart';
import '../../core/payment_service.dart';
import '../../models/models.dart';
import '../../state/auth_provider.dart';
import '../../theme.dart';
import '../../widgets/common.dart';
import '../../widgets/skeleton.dart';
import '../quiz/quiz_player_screen.dart';

/// Test Package Details Screen with test listing, rules dialog, and CBT launcher
class TestSeriesDetailScreen extends StatefulWidget {
  final int seriesId;
  final TestSeriesDetail? initialDetail;

  const TestSeriesDetailScreen({
    super.key,
    required this.seriesId,
    this.initialDetail,
  });

  @override
  State<TestSeriesDetailScreen> createState() => _TestSeriesDetailScreenState();
}

class _TestSeriesDetailScreenState extends State<TestSeriesDetailScreen> {
  final ApiService _apiService = ApiService();
  final PaymentService _paymentService = PaymentService();
  late Future<TestSeriesDetail> _detailFuture;
  TestSeriesDetail? _loadedDetail;
  bool _isProcessingPurchase = false;

  @override
  void initState() {
    super.initState();
    _loadedDetail = widget.initialDetail;
    _detailFuture = _fetchDetail();
  }

  Future<TestSeriesDetail> _fetchDetail() async {
    if (widget.initialDetail != null) {
      return widget.initialDetail!;
    }
    try {
      final detail = await _apiService.getTestSeriesDetail(widget.seriesId);
      if (mounted) setState(() => _loadedDetail = detail);
      return detail;
    } catch (e) {
      if (widget.initialDetail != null) return widget.initialDetail!;
      rethrow;
    }
  }

  Future<void> _handlePurchase(TestSeriesDetail detail) async {
    final auth = Provider.of<AuthProvider>(context, listen: false);
    if (!auth.isAuthenticated) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please log in to purchase this Test Series.'),
          backgroundColor: AppColors.warning,
        ),
      );
      return;
    }

    setState(() => _isProcessingPurchase = true);

    try {
      final session = await _apiService.createCheckoutSession(
        'test_series',
        detail.id,
      );

      if (!mounted) return;

      final result = await _paymentService.startPayment(
        session: session,
        context: context,
      );

      if (!mounted) return;

      if (result.isSuccess) {
        setState(() {
          _loadedDetail = _loadedDetail != null
              ? TestSeriesDetail(
                  id: _loadedDetail!.id,
                  title: _loadedDetail!.title,
                  description: _loadedDetail!.description,
                  category: _loadedDetail!.category,
                  thumbnailUrl: _loadedDetail!.thumbnailUrl,
                  price: _loadedDetail!.price,
                  discountPrice: _loadedDetail!.discountPrice,
                  isPurchased: true,
                  validityDays: _loadedDetail!.validityDays,
                  quizzes: _loadedDetail!.quizzes.map((q) {
                    return SeriesQuiz(
                      id: q.id,
                      testSeriesId: q.testSeriesId,
                      title: q.title,
                      durationMinutes: q.durationMinutes,
                      totalQuestions: q.totalQuestions,
                      totalMarks: q.totalMarks,
                      isFree: q.isFree,
                      isLocked: false,
                      isAttempted: q.isAttempted,
                      bestScore: q.bestScore,
                      attemptsTaken: q.attemptsTaken,
                    );
                  }).toList(),
                )
              : null;
        });

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
                '🎉 Test Series Unlocked! Reference: ${result.paymentId}'),
            backgroundColor: AppColors.success,
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(result.errorMessage ?? 'Payment cancelled.'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Checkout failed: $e'),
          backgroundColor: AppColors.error,
        ),
      );
    } finally {
      if (mounted) setState(() => _isProcessingPurchase = false);
    }
  }

  void _showTestInstructions(SeriesQuiz quiz, bool isPackagePurchased) {
    final isUnlocked = isPackagePurchased || quiz.isFree || !quiz.isLocked;

    if (!isUnlocked) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('🔒 This test is locked. Purchase the series to access.'),
          backgroundColor: AppColors.warning,
        ),
      );
      return;
    }

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Row(
          children: [
            const Icon(Icons.info_outline_rounded, color: AppColors.primary),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                quiz.title,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  fontFamily: 'Poppins',
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Exam Instructions & Rules:',
              style: TextStyle(
                fontFamily: 'Poppins',
                fontSize: 13,
                fontWeight: FontWeight.bold,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 10),
            _buildInstructionItem(Icons.timer_outlined,
                'Duration: ${quiz.durationMinutes} Minutes strictly timed.'),
            _buildInstructionItem(Icons.format_list_numbered,
                'Total Questions: ${quiz.totalQuestions} Questions.'),
            _buildInstructionItem(Icons.add_circle_outline,
                'Marking: +4 marks for correct, -1 mark for incorrect.'),
            _buildInstructionItem(Icons.security_outlined,
                'Security: Screenshots and screen recording are prohibited.'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.of(context).pop();
              Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (context) => QuizPlayerScreen(quizId: quiz.id),
                ),
              );
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            child: const Text('Start Test Now'),
          ),
        ],
      ),
    );
  }

  Widget _buildInstructionItem(IconData icon, String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 16, color: AppColors.primary),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              text,
              style: const TextStyle(
                fontFamily: 'Poppins',
                fontSize: 12,
                color: AppColors.textSecondary,
              ),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Test Series Package'),
        elevation: 0,
      ),
      body: FutureBuilder<TestSeriesDetail>(
        future: _detailFuture,
        initialData: _loadedDetail,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting &&
              _loadedDetail == null) {
            return const Padding(
              padding: EdgeInsets.all(16),
              child: SkeletonList(count: 4),
            );
          }

          if (snapshot.hasError && _loadedDetail == null) {
            return ErrorStateView(
              message: 'Failed to load test series: ${snapshot.error}',
              onRetry: () => setState(() => _detailFuture = _fetchDetail()),
            );
          }

          final detail = snapshot.data ?? _loadedDetail!;

          return Column(
            children: [
              Expanded(
                child: ListView(
                  padding: const EdgeInsets.all(16),
                  children: [
                    _buildPackageHeader(detail),
                    const SizedBox(height: 20),
                    const Text(
                      'All Included Tests & Mock Exams',
                      style: TextStyle(
                        fontFamily: 'Poppins',
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 12),
                    ...detail.quizzes.map((quiz) {
                      return _buildQuizCard(quiz, detail.isPurchased);
                    }),
                  ],
                ),
              ),
              if (!detail.isPurchased) _buildBottomPurchaseBar(detail),
            ],
          );
        },
      ),
    );
  }

  Widget _buildPackageHeader(TestSeriesDetail detail) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
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
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: AppColors.primary.withAlpha(20),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  detail.category ?? 'Target Exam',
                  style: const TextStyle(
                    fontFamily: 'Poppins',
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    color: AppColors.primary,
                  ),
                ),
              ),
              const Spacer(),
              if (detail.isPurchased)
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: AppColors.success.withAlpha(20),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: const Row(
                    children: [
                      Icon(Icons.check_circle,
                          size: 14, color: AppColors.success),
                      SizedBox(width: 4),
                      Text(
                        'Enrolled',
                        style: TextStyle(
                          fontFamily: 'Poppins',
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: AppColors.success,
                        ),
                      ),
                    ],
                  ),
                ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            detail.title,
            style: const TextStyle(
              fontFamily: 'Poppins',
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
          if (detail.description != null) ...[
            const SizedBox(height: 6),
            Text(
              detail.description!,
              style: const TextStyle(
                fontFamily: 'Poppins',
                fontSize: 12,
                color: AppColors.textSecondary,
              ),
            ),
          ],
          const Divider(height: 24),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildMetaItem(Icons.quiz_outlined, '${detail.quizzes.length}', 'Tests'),
              _buildMetaItem(Icons.calendar_today_outlined, '${detail.validityDays} Days', 'Validity'),
              _buildMetaItem(Icons.military_tech_outlined, 'All-India', 'Ranking'),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildMetaItem(IconData icon, String val, String label) {
    return Column(
      children: [
        Icon(icon, size: 20, color: AppColors.primary),
        const SizedBox(height: 4),
        Text(
          val,
          style: const TextStyle(
            fontFamily: 'Poppins',
            fontSize: 13,
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

  Widget _buildQuizCard(SeriesQuiz quiz, bool isPackagePurchased) {
    final isUnlocked = isPackagePurchased || quiz.isFree || !quiz.isLocked;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: isUnlocked
                  ? AppColors.primary.withAlpha(20)
                  : AppColors.surface,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(
              isUnlocked
                  ? (quiz.isAttempted
                      ? Icons.check_circle_outline_rounded
                      : Icons.assignment_outlined)
                  : Icons.lock_outline_rounded,
              color: isUnlocked ? AppColors.primary : AppColors.textSecondary,
              size: 22,
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  quiz.title,
                  style: TextStyle(
                    fontFamily: 'Poppins',
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                    color: isUnlocked
                        ? AppColors.textPrimary
                        : AppColors.textSecondary,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  '${quiz.totalQuestions} Questions • ${quiz.durationMinutes} mins • ${quiz.totalMarks.toInt()} Marks',
                  style: const TextStyle(
                    fontFamily: 'Poppins',
                    fontSize: 11,
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          ElevatedButton(
            onPressed: isUnlocked
                ? () => _showTestInstructions(quiz, isPackagePurchased)
                : null,
            style: ElevatedButton.styleFrom(
              backgroundColor: quiz.isAttempted
                  ? AppColors.accent
                  : AppColors.primary,
              foregroundColor: Colors.white,
              elevation: 0,
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              minimumSize: Size.zero,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            child: Text(
              quiz.isAttempted
                  ? 'Re-take'
                  : (quiz.isFree ? 'Free' : 'Start'),
              style: const TextStyle(
                fontFamily: 'Poppins',
                fontSize: 11,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBottomPurchaseBar(TestSeriesDetail detail) {
    final effectivePrice = detail.discountPrice ?? detail.price;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: AppColors.border)),
      ),
      child: SafeArea(
        top: false,
        child: Row(
          children: [
            Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'SERIES PASS',
                  style: TextStyle(
                    fontFamily: 'Poppins',
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textSecondary,
                  ),
                ),
                Text(
                  '₹${effectivePrice.toInt()}',
                  style: const TextStyle(
                    fontFamily: 'Poppins',
                    fontSize: 20,
                    fontWeight: FontWeight.w800,
                    color: AppColors.textPrimary,
                  ),
                ),
              ],
            ),
            const SizedBox(width: 20),
            Expanded(
              child: PrimaryButton(
                text: 'Unlock Test Series',
                isLoading: _isProcessingPurchase,
                icon: Icons.lock_open_rounded,
                onPressed: () => _handlePurchase(detail),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

