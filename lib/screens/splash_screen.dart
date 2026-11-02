import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../state/auth_provider.dart';
import '../theme.dart';

/// Animated splash screen that initializes the student session and routes
/// to the appropriate initial destination.
class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with SingleTickerProviderStateMixin {
  late final AnimationController _animController;
  late final Animation<double> _fadeAnimation;
  late final Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1400),
    );

    _fadeAnimation = CurvedAnimation(
      parent: _animController,
      curve: const Interval(0.0, 0.7, curve: Curves.easeIn),
    );

    _scaleAnimation = Tween<double>(begin: 0.8, end: 1.0).animate(
      CurvedAnimation(
        parent: _animController,
        curve: const Interval(0.0, 0.7, curve: Curves.easeOutBack),
      ),
    );

    _animController.forward();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        _initializeApp();
      }
    });
  }

  @override
  void dispose() {
    _animController.dispose();
    super.dispose();
  }

  Future<void> _initializeApp() async {
    // Ensure animation plays for at least 1.5 seconds for branding presence
    final animDelay = Future.delayed(const Duration(milliseconds: 1500));

    final authProvider = context.read<AuthProvider>();
    final sessionInit = authProvider.initialize();

    await Future.wait([animDelay, sessionInit]);

    if (!mounted) return;

    if (authProvider.isAuthenticated) {
      context.go('/home');
      return;
    }

    try {
      final prefs = await SharedPreferences.getInstance();
      final hasCompletedOnboarding =
          prefs.getBool('has_completed_onboarding') ?? false;

      if (!mounted) return;

      if (hasCompletedOnboarding) {
        context.go('/login');
      } else {
        context.go('/onboarding');
      }
    } catch (e) {
      if (mounted) {
        context.go('/onboarding');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.primary,
      body: Center(
        child: AnimatedBuilder(
          animation: _animController,
          builder: (context, child) {
            return FadeTransition(
              opacity: _fadeAnimation,
              child: ScaleTransition(
                scale: _scaleAnimation,
                child: child,
              ),
            );
          },
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Hero(
                tag: 'app_logo',
                child: Container(
                  width: 110,
                  height: 110,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(24),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withAlpha(50),
                        blurRadius: 24,
                        offset: const Offset(0, 10),
                      ),
                    ],
                  ),
                  clipBehavior: Clip.antiAlias,
                  child: Image.asset(
                    'assets/icons/test_series_logo.jpeg',
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) => Container(
                      color: Colors.white,
                      child: const Icon(
                        Icons.school_rounded,
                        color: AppColors.primary,
                        size: 54,
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 24),
              const Text(
                'TEST SERIES',
                style: TextStyle(
                  fontFamily: 'Poppins',
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1.5,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 6),
              const Text(
                'Learn, Practice & Succeed',
                style: TextStyle(
                  fontFamily: 'Poppins',
                  fontSize: 14,
                  fontWeight: FontWeight.w400,
                  color: Colors.white70,
                ),
              ),
              const SizedBox(height: 36),
              const SizedBox(
                width: 24,
                height: 24,
                child: CircularProgressIndicator(
                  strokeWidth: 2.2,
                  valueColor: AlwaysStoppedAnimation<Color>(Colors.white70),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
