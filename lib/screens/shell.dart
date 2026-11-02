import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../theme.dart';

/// Persistent Bottom Navigation Shell supporting 5 core destinations:
/// 1. Home (`/home`)
/// 2. Test Series (`/test-series`)
/// 3. Courses (`/courses`)
/// 4. Doubts (`/doubts`)
/// 5. Profile (`/profile`)
class AppShell extends StatelessWidget {
  final Widget child;

  const AppShell({
    super.key,
    required this.child,
  });

  static int _calculateSelectedIndex(BuildContext context) {
    if (GoRouter.maybeOf(context) == null) return 0;
    try {
      final location = GoRouterState.of(context).uri.path;
      if (location.startsWith('/home')) return 0;
      if (location.startsWith('/test-series')) return 1;
      if (location.startsWith('/courses')) return 2;
      if (location.startsWith('/doubts')) return 3;
      if (location.startsWith('/profile')) return 4;
    } catch (_) {}
    return 0;
  }

  void _onItemTapped(int index, BuildContext context) {
    if (GoRouter.maybeOf(context) == null) return;
    switch (index) {
      case 0:
        context.go('/home');
        break;
      case 1:
        context.go('/test-series');
        break;
      case 2:
        context.go('/courses');
        break;
      case 3:
        context.go('/doubts');
        break;
      case 4:
        context.go('/profile');
        break;
    }
  }

  @override
  Widget build(BuildContext context) {
    final selectedIndex = _calculateSelectedIndex(context);

    return Scaffold(
      body: child,
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          boxShadow: [
            BoxShadow(
              color: Color(0x0F000000),
              blurRadius: 12,
              offset: Offset(0, -2),
            ),
          ],
        ),
        child: NavigationBar(
          selectedIndex: selectedIndex,
          onDestinationSelected: (index) => _onItemTapped(index, context),
          backgroundColor: Colors.white,
          elevation: 2,
          indicatorColor: AppColors.primary.withAlpha(25),
          destinations: const [
            NavigationDestination(
              icon: Icon(Icons.home_outlined),
              selectedIcon: Icon(Icons.home_rounded, color: AppColors.primary),
              label: 'Home',
            ),
            NavigationDestination(
              icon: Icon(Icons.quiz_outlined),
              selectedIcon: Icon(Icons.quiz_rounded, color: AppColors.primary),
              label: 'Test Series',
            ),
            NavigationDestination(
              icon: Icon(Icons.play_lesson_outlined),
              selectedIcon:
                  Icon(Icons.play_lesson_rounded, color: AppColors.primary),
              label: 'Courses',
            ),
            NavigationDestination(
              icon: Icon(Icons.help_outline_rounded),
              selectedIcon:
                  Icon(Icons.help_rounded, color: AppColors.primary),
              label: 'Doubts',
            ),
            NavigationDestination(
              icon: Icon(Icons.person_outline_rounded),
              selectedIcon:
                  Icon(Icons.person_rounded, color: AppColors.primary),
              label: 'Profile',
            ),
          ],
        ),
      ),
    );
  }
}
