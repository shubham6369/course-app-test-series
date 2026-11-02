import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../theme.dart';
import '../../widgets/common.dart';

class OnboardingItem {
  final String title;
  final String description;
  final IconData icon;
  final Color iconColor;

  const OnboardingItem({
    required this.title,
    required this.description,
    required this.icon,
    required this.iconColor,
  });
}

/// Visual feature highlights walkthrough with interactive carousel,
/// page indicator dots, and Skip / Get Started navigation.
class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final PageController _pageController = PageController();
  int _currentIndex = 0;

  static const List<OnboardingItem> _items = [
    OnboardingItem(
      title: 'Real CBT Exam Simulation',
      description:
          'Experience computer-based exams with real-time countdown timers, question palettes, negative marking, and instant detailed solutions.',
      icon: Icons.timer_outlined,
      iconColor: AppColors.primary,
    ),
    OnboardingItem(
      title: 'Expert Video Courses & Notes',
      description:
          'Learn from top educators through comprehensive chapter-wise video lectures, high-yield eBooks, and downloadable study materials.',
      icon: Icons.play_lesson_outlined,
      iconColor: AppColors.accent,
    ),
    OnboardingItem(
      title: 'Instant Doubt Clearing & AI Tutor',
      description:
          'Snap and upload questions to get step-by-step teacher explanations, discuss in student communities, and get 24/7 AI tutor guidance.',
      icon: Icons.forum_outlined,
      iconColor: AppColors.paletteMarked,
    ),
  ];

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  Future<void> _completeOnboarding() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool('has_completed_onboarding', true);
    } catch (e) {
      debugPrint('Error saving onboarding flag: $e');
    }
    if (!mounted) return;
    context.go('/login');
  }

  void _nextPage() {
    if (_currentIndex < _items.length - 1) {
      _pageController.nextPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    } else {
      _completeOnboarding();
    }
  }

  @override
  Widget build(BuildContext context) {
    final isLastPage = _currentIndex == _items.length - 1;

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        actions: [
          TextButton(
            onPressed: _completeOnboarding,
            child: const Text(
              'Skip',
              style: TextStyle(
                fontFamily: 'Poppins',
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: AppColors.textSecondary,
              ),
            ),
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: PageView.builder(
                controller: _pageController,
                itemCount: _items.length,
                onPageChanged: (index) {
                  setState(() {
                    _currentIndex = index;
                  });
                },
                itemBuilder: (context, index) {
                  final item = _items[index];
                  return Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 32),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        // Icon Illustration Container
                        Container(
                          width: 160,
                          height: 160,
                          decoration: BoxDecoration(
                            color: item.iconColor.withAlpha(20),
                            shape: BoxShape.circle,
                          ),
                          child: Center(
                            child: Container(
                              width: 110,
                              height: 110,
                              decoration: BoxDecoration(
                                color: item.iconColor.withAlpha(40),
                                shape: BoxShape.circle,
                              ),
                              child: Icon(
                                item.icon,
                                size: 56,
                                color: item.iconColor,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(height: 48),

                        // Title
                        Text(
                          item.title,
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            fontFamily: 'Poppins',
                            fontSize: 22,
                            fontWeight: FontWeight.bold,
                            color: AppColors.textPrimary,
                            letterSpacing: -0.3,
                          ),
                        ),
                        const SizedBox(height: 16),

                        // Description
                        Text(
                          item.description,
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            fontFamily: 'Poppins',
                            fontSize: 14,
                            height: 1.5,
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),

            // Dots Indicator & Action Button
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 24),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: List.generate(_items.length, (index) {
                      final isActive = index == _currentIndex;
                      return AnimatedContainer(
                        duration: const Duration(milliseconds: 250),
                        margin: const EdgeInsets.symmetric(horizontal: 4),
                        width: isActive ? 24 : 8,
                        height: 8,
                        decoration: BoxDecoration(
                          color: isActive
                              ? AppColors.primary
                              : AppColors.border,
                          borderRadius: BorderRadius.circular(4),
                        ),
                      );
                    }),
                  ),
                  const SizedBox(height: 32),
                  PrimaryButton(
                    text: isLastPage ? 'Get Started' : 'Continue',
                    icon: isLastPage
                        ? Icons.check_circle_outline
                        : Icons.arrow_forward_rounded,
                    onPressed: _nextPage,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
