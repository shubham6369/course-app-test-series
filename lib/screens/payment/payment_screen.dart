import 'package:flutter/material.dart';
import '../../theme.dart';
import '../../widgets/common.dart';

/// Transactions, Billing, and Subscription Management Screen
class PaymentScreen extends StatefulWidget {
  const PaymentScreen({super.key});

  @override
  State<PaymentScreen> createState() => _PaymentScreenState();
}

class _PaymentScreenState extends State<PaymentScreen> {
  final List<Map<String, dynamic>> _transactions = [
    {
      'id': 'pay_mock_99182',
      'item_name': 'NEET 2026 Complete Test Series Package',
      'amount': '₹499.00',
      'date': '28 Oct 2026',
      'status': 'SUCCESS',
      'method': 'UPI (Google Pay)',
    },
    {
      'id': 'pay_mock_88173',
      'item_name': 'Organic Chemistry Video Crash Course',
      'amount': '₹1,299.00',
      'date': '15 Sep 2026',
      'status': 'SUCCESS',
      'method': 'Debit Card (HDFC)',
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Transactions & Billing'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Active Subscription Card
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [AppColors.primary, AppColors.primaryLight],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: AppColors.primary.withAlpha(50),
                  blurRadius: 12,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'ACTIVE ACCESS',
                      style: TextStyle(
                        fontFamily: 'Poppins',
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        color: Colors.white70,
                        letterSpacing: 1.2,
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: Colors.white24,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Text(
                        'PRO STUDENT',
                        style: TextStyle(
                          fontFamily: 'Poppins',
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                const Text(
                  'NEET 2026 Full Test Package',
                  style: TextStyle(
                    fontFamily: 'Poppins',
                    fontSize: 17,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 6),
                const Text(
                  'Valid until 31 May 2027 • All 25 Mocks Unlocked',
                  style: TextStyle(
                    fontFamily: 'Poppins',
                    fontSize: 12,
                    color: Colors.white70,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Transaction History Header
          const Text(
            'Order History & Invoices',
            style: TextStyle(
              fontFamily: 'Poppins',
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 12),

          if (_transactions.isEmpty)
            const EmptyStateView(
              icon: Icons.receipt_long_rounded,
              title: 'No Transactions Yet',
              message: 'Your course purchases and receipts will appear here.',
            )
          else
            ..._transactions.map((tx) => _buildTransactionCard(tx)),
        ],
      ),
    );
  }

  Widget _buildTransactionCard(Map<String, dynamic> tx) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(5),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  tx['item_name'] as String,
                  style: const TextStyle(
                    fontFamily: 'Poppins',
                    fontSize: 13.5,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
                ),
              ),
              Text(
                tx['amount'] as String,
                style: const TextStyle(
                  fontFamily: 'Poppins',
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: AppColors.primary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '${tx['date']} • ${tx['method']}',
                style: const TextStyle(
                  fontFamily: 'Poppins',
                  fontSize: 11,
                  color: AppColors.textSecondary,
                ),
              ),
              AppBadge(
                text: tx['status'] as String,
                backgroundColor: AppColors.success,
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            'Txn ID: ${tx['id']}',
            style: const TextStyle(
              fontFamily: 'Poppins',
              fontSize: 11,
              color: AppColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }
}
