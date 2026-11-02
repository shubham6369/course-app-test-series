import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../state/auth_provider.dart';
import '../../theme.dart';
import '../../widgets/common.dart';

/// Student Profile & Account Hub Screen
class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();
    final user = authProvider.user;

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Profile & Hub'),
        actions: [
          if (authProvider.isAuthenticated)
            IconButton(
              icon: const Icon(Icons.edit_outlined),
              tooltip: 'Edit Profile',
              onPressed: () => context.push('/edit-profile'),
            ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            // User Avatar Card
            Container(
              padding: const EdgeInsets.all(20),
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
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 32,
                    backgroundColor: AppColors.primary.withAlpha(25),
                    child: Text(
                      user != null && user.name.isNotEmpty
                          ? user.name.substring(0, 1).toUpperCase()
                          : 'S',
                      style: const TextStyle(
                        fontFamily: 'Poppins',
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: AppColors.primary,
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          user?.name ?? 'Guest Student',
                          style: const TextStyle(
                            fontFamily: 'Poppins',
                            fontSize: 17,
                            fontWeight: FontWeight.bold,
                            color: AppColors.textPrimary,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          user?.phone ?? user?.email ?? 'Sign in for full access',
                          style: const TextStyle(
                            fontFamily: 'Poppins',
                            fontSize: 12.5,
                            color: AppColors.textSecondary,
                          ),
                        ),
                        if (user?.targetExam != null) ...[
                          const SizedBox(height: 6),
                          AppBadge(
                            text: user!.targetExam!,
                            backgroundColor: AppColors.accent,
                          ),
                        ],
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Academic Hub Section
            _buildSectionHeader('ACADEMIC & LEARNING'),
            const SizedBox(height: 8),
            _buildMenuItem(
              context: context,
              icon: Icons.insights_rounded,
              title: 'My Performance Analytics',
              subtitle: 'Score trends, accuracy & weak topics',
              onTap: () => context.push('/my-performance'),
            ),
            _buildMenuItem(
              context: context,
              icon: Icons.video_library_outlined,
              title: 'My Enrolled Courses',
              subtitle: 'Continue watching your course lectures',
              onTap: () => context.push('/my-courses'),
            ),
            _buildMenuItem(
              context: context,
              icon: Icons.auto_awesome,
              title: 'AI Academic Tutor',
              subtitle: '24/7 instant conceptual explanations',
              onTap: () => context.push('/ai-chat'),
            ),
            _buildMenuItem(
              context: context,
              icon: Icons.menu_book_rounded,
              title: 'Digital Books & Ebooks',
              subtitle: 'Read study handbooks and question banks',
              onTap: () => context.push('/ebooks'),
            ),
            _buildMenuItem(
              context: context,
              icon: Icons.notes_rounded,
              title: 'Revision Notes & Formula Sheets',
              subtitle: 'High-yield PDF summaries',
              onTap: () => context.push('/resources'),
            ),
            _buildMenuItem(
              context: context,
              icon: Icons.forum_outlined,
              title: 'Aspirants Community Feed',
              subtitle: 'Study tips, motivation & peer discussions',
              onTap: () => context.push('/community'),
            ),

            const SizedBox(height: 24),

            // Account & Support Section
            _buildSectionHeader('ACCOUNT & BILLING'),
            const SizedBox(height: 8),
            _buildMenuItem(
              context: context,
              icon: Icons.receipt_long_outlined,
              title: 'Billing & Transaction History',
              subtitle: 'Purchased packages, receipts & invoices',
              onTap: () => context.push('/payments'),
            ),
            _buildMenuItem(
              context: context,
              icon: Icons.policy_outlined,
              title: 'Terms & Privacy Policies',
              subtitle: 'Legal regulations, data safety & refund policy',
              onTap: () => context.push('/legal'),
            ),

            const SizedBox(height: 28),

            // Logout or Sign In CTA
            if (authProvider.isAuthenticated)
              OutlineAppButton(
                text: 'Sign Out',
                icon: Icons.logout_rounded,
                onPressed: () async {
                  await authProvider.logout();
                  if (context.mounted) {
                    context.go('/login');
                  }
                },
              )
            else
              PrimaryButton(
                text: 'Sign In to Account',
                icon: Icons.login_rounded,
                onPressed: () => context.go('/login'),
              ),

            const SizedBox(height: 16),
            const Text(
              'Test Series App • v1.0.0 (Build 1)',
              style: TextStyle(
                fontFamily: 'Poppins',
                fontSize: 11,
                color: AppColors.textSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Align(
      alignment: Alignment.centerLeft,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 4),
        child: Text(
          title,
          style: const TextStyle(
            fontFamily: 'Poppins',
            fontSize: 11,
            fontWeight: FontWeight.bold,
            color: AppColors.textSecondary,
            letterSpacing: 1.1,
          ),
        ),
      ),
    );
  }

  Widget _buildMenuItem({
    required BuildContext context,
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: ListTile(
        leading: Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: AppColors.primary.withAlpha(20),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(icon, color: AppColors.primary, size: 20),
        ),
        title: Text(
          title,
          style: const TextStyle(
            fontFamily: 'Poppins',
            fontSize: 13.5,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
        subtitle: Text(
          subtitle,
          style: const TextStyle(
            fontFamily: 'Poppins',
            fontSize: 11.5,
            color: AppColors.textSecondary,
          ),
        ),
        trailing: const Icon(Icons.arrow_forward_ios_rounded, size: 14, color: AppColors.textSecondary),
        onTap: onTap,
      ),
    );
  }
}
