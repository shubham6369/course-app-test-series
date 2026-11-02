import 'package:flutter/material.dart';
import '../../theme.dart';

/// Terms of Service, Privacy Policy, and Refund Policy Screen
class LegalScreen extends StatefulWidget {
  final int initialTabIndex;

  const LegalScreen({super.key, this.initialTabIndex = 0});

  @override
  State<LegalScreen> createState() => _LegalScreenState();
}

class _LegalScreenState extends State<LegalScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(
      length: 3,
      vsync: this,
      initialIndex: widget.initialTabIndex,
    );
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Policies & Terms'),
        bottom: TabBar(
          controller: _tabController,
          labelColor: AppColors.primary,
          unselectedLabelColor: AppColors.textSecondary,
          indicatorColor: AppColors.primary,
          tabs: const [
            Tab(text: 'Terms'),
            Tab(text: 'Privacy'),
            Tab(text: 'Refunds'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildPolicyContent(
            title: 'Terms & Conditions of Service',
            lastUpdated: '15 October 2026',
            sections: const [
              {
                'heading': '1. Acceptance of Terms',
                'body': 'By registering, accessing, or downloading materials from the Test Series learning platform, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use this application.',
              },
              {
                'heading': '2. Proprietary Intellectual Property & DRM',
                'body': 'All questions, mock tests, video solutions, lecture notes, formula sheets, and software source code are the exclusive intellectual property of the organization. Screen recording, screenshots, redistribution, reverse-engineering, or unauthorized sharing of account credentials is strictly prohibited and subject to immediate termination without refund.',
              },
              {
                'heading': '3. Computer-Based Test (CBT) Regulations',
                'body': 'Our CBT interface accurately mirrors national testing agency guidelines. In case of power or connectivity interruptions, auto-save periodically persists student answers. Results, ranks, and percentiles calculated are final for the respective mock cycle.',
              },
            ],
          ),
          _buildPolicyContent(
            title: 'Privacy Policy',
            lastUpdated: '15 October 2026',
            sections: const [
              {
                'heading': '1. Information We Collect',
                'body': 'We collect your mobile number, email address, name, class standard, and target examination upon registration. Device diagnostics and test attempt logs are recorded strictly to deliver personalized performance analytics.',
              },
              {
                'heading': '2. Data Security & Storage',
                'body': 'All communications with our servers are encrypted via industry-standard TLS 1.3 protocols. Payment card details and UPI pins are processed directly by RBI-regulated payment gateways (e.g. Razorpay) and are never stored on our servers.',
              },
              {
                'heading': '3. User Rights',
                'body': 'You may request a copy of your test history or request account deactivation at any time via support@webphiser.com.',
              },
            ],
          ),
          _buildPolicyContent(
            title: 'Refund & Cancellation Policy',
            lastUpdated: '15 October 2026',
            sections: const [
              {
                'heading': '1. Test Packages & Digital Access',
                'body': 'Due to the instantaneous digital unlocking of question banks, video explanations, and downloadable resources, course and test series purchases are non-refundable once content is accessed.',
              },
              {
                'heading': '2. Duplicate Transactions',
                'body': 'If an amount is charged multiple times due to payment gateway delays or connectivity drops, duplicate charges are automatically reversed within 5 to 7 working days to the original payment method.',
              },
              {
                'heading': '3. Technical Support Escalations',
                'body': 'For any billing discrepancies, email your transaction ID and phone number to billing@webphiser.com for prompt resolution.',
              },
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildPolicyContent({
    required String title,
    required String lastUpdated,
    required List<Map<String, String>> sections,
  }) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(
              fontFamily: 'Poppins',
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'Last Updated: $lastUpdated',
            style: const TextStyle(
              fontFamily: 'Poppins',
              fontSize: 12,
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: 16),
          const Divider(),
          const SizedBox(height: 16),
          ...sections.map(
            (sec) => Padding(
              padding: const EdgeInsets.only(bottom: 20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    sec['heading']!,
                    style: const TextStyle(
                      fontFamily: 'Poppins',
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    sec['body']!,
                    style: const TextStyle(
                      fontFamily: 'Poppins',
                      fontSize: 13,
                      height: 1.5,
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

