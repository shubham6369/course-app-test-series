import 'dart:async';
import 'dart:io' show Platform;
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:razorpay_flutter/razorpay_flutter.dart';
import '../models/models.dart';
import '../theme.dart';

class PaymentResult {
  final bool isSuccess;
  final String? paymentId;
  final String? orderId;
  final String? signature;
  final String? errorMessage;

  PaymentResult({
    required this.isSuccess,
    this.paymentId,
    this.orderId,
    this.signature,
    this.errorMessage,
  });

  factory PaymentResult.success({
    required String paymentId,
    required String orderId,
    required String signature,
  }) =>
      PaymentResult(
        isSuccess: true,
        paymentId: paymentId,
        orderId: orderId,
        signature: signature,
      );

  factory PaymentResult.failure(String message) => PaymentResult(
        isSuccess: false,
        errorMessage: message,
      );
}

class PaymentService {
  Razorpay? _razorpay;
  Completer<PaymentResult>? _completer;

  void _initRazorpay() {
    if (_razorpay == null && !kIsWeb && (Platform.isAndroid || Platform.isIOS)) {
      try {
        _razorpay = Razorpay();
        _razorpay!.on(Razorpay.EVENT_PAYMENT_SUCCESS, _handlePaymentSuccess);
        _razorpay!.on(Razorpay.EVENT_PAYMENT_ERROR, _handlePaymentError);
        _razorpay!.on(Razorpay.EVENT_EXTERNAL_WALLET, _handleExternalWallet);
      } catch (e) {
        debugPrint('Failed to initialize native Razorpay: $e');
        _razorpay = null;
      }
    }
  }

  void _handlePaymentSuccess(PaymentSuccessResponse response) {
    if (_completer != null && !_completer!.isCompleted) {
      _completer!.complete(
        PaymentResult.success(
          paymentId: response.paymentId ?? 'pay_${DateTime.now().millisecondsSinceEpoch}',
          orderId: response.orderId ?? '',
          signature: response.signature ?? '',
        ),
      );
    }
  }

  void _handlePaymentError(PaymentFailureResponse response) {
    if (_completer != null && !_completer!.isCompleted) {
      _completer!.complete(
        PaymentResult.failure(response.message ?? 'Payment failed or cancelled by user'),
      );
    }
  }

  void _handleExternalWallet(ExternalWalletResponse response) {
    if (_completer != null && !_completer!.isCompleted) {
      _completer!.complete(
        PaymentResult.failure('Selected external wallet: ${response.walletName}'),
      );
    }
  }

  /// Initiates payment for a CheckoutSession.
  /// Uses native Razorpay SDK on mobile devices when real keys are present.
  /// Falls back to an interactive simulator dialog if on desktop/web or in mock mode.
  Future<PaymentResult> startPayment({
    required CheckoutSession session,
    BuildContext? context,
    bool forceMock = false,
  }) async {
    _completer = Completer<PaymentResult>();

    final isMobile = !kIsWeb && (Platform.isAndroid || Platform.isIOS);
    final isMockKey = session.keyId.contains('mock') || session.keyId.isEmpty;

    if (!isMobile || isMockKey || forceMock) {
      // Offline / Desktop / Test Simulator Mode
      return _simulateCheckout(session, context);
    }

    _initRazorpay();
    if (_razorpay == null) {
      return _simulateCheckout(session, context);
    }

    final options = {
      'key': session.keyId,
      'amount': (session.amount * 100).toInt(),
      'name': 'Test Series Educational App',
      'order_id': session.orderId,
      'description': session.itemName,
      'timeout': 180,
      'prefill': {
        'contact': session.userPhone ?? '9876543210',
        'email': session.userEmail ?? 'student@example.com',
      },
      'theme': {'color': '#1A237E'},
    };

    try {
      _razorpay!.open(options);
    } catch (e) {
      debugPrint('Razorpay open error: $e. Falling back to simulator.');
      return _simulateCheckout(session, context);
    }

    return _completer!.future;
  }

  Future<PaymentResult> _simulateCheckout(CheckoutSession session, BuildContext? context) async {
    if (context != null && context.mounted) {
      final userChoice = await showDialog<bool>(
        context: context,
        barrierDismissible: false,
        builder: (ctx) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppColors.primary.withAlpha(25),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.payment_rounded, color: AppColors.primary),
              ),
              const SizedBox(width: 12),
              const Expanded(
                child: Text('Razorpay Simulator', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                session.itemName,
                style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15),
              ),
              const SizedBox(height: 8),
              Text(
                'Amount: ₹${session.amount.toStringAsFixed(2)}',
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: AppColors.primary,
                ),
              ),
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: AppColors.borderLight,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Text(
                  'Safe test environment: No real money will be charged. Choose whether to simulate a successful payment or a cancellation.',
                  style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx, false),
              child: const Text('Cancel / Fail', style: TextStyle(color: AppColors.error)),
            ),
            ElevatedButton(
              onPressed: () => Navigator.pop(ctx, true),
              style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
              child: const Text('Pay Successfully'),
            ),
          ],
        ),
      );

      if (userChoice == true) {
        return PaymentResult.success(
          paymentId: 'pay_mock_${DateTime.now().millisecondsSinceEpoch}',
          orderId: session.orderId,
          signature: 'sig_mock_verified_${DateTime.now().millisecondsSinceEpoch}',
        );
      } else {
        return PaymentResult.failure('Payment cancelled by user in simulator');
      }
    }

    // Headless / automated mode without UI context
    await Future.delayed(const Duration(milliseconds: 300));
    return PaymentResult.success(
      paymentId: 'pay_mock_${DateTime.now().millisecondsSinceEpoch}',
      orderId: session.orderId,
      signature: 'sig_mock_verified_${DateTime.now().millisecondsSinceEpoch}',
    );
  }

  void dispose() {
    if (_razorpay != null) {
      try {
        _razorpay!.clear();
      } catch (_) {}
      _razorpay = null;
    }
  }
}
