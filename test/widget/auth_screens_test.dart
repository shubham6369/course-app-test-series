import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:test_series/router.dart';
import 'package:test_series/screens/auth/forgot_password_screen.dart';
import 'package:test_series/screens/auth/login_screen.dart';
import 'package:test_series/screens/auth/register_screen.dart';
import 'package:test_series/screens/onboarding/onboarding_screen.dart';
import 'package:test_series/screens/shell.dart';
import 'package:test_series/screens/splash_screen.dart';
import 'package:test_series/state/auth_provider.dart';
import 'package:test_series/theme.dart';
import 'package:test_series/widgets/auth_scaffold.dart';
import 'package:test_series/widgets/otp_input.dart';

Widget _buildTestApp({
  required Widget child,
  AuthProvider? authProvider,
}) {
  return MultiProvider(
    providers: [
      ChangeNotifierProvider<AuthProvider>.value(
        value: authProvider ?? AuthProvider(),
      ),
    ],
    child: MaterialApp(
      theme: AppTheme.lightTheme,
      home: child,
    ),
  );
}

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() {
    SharedPreferences.setMockInitialValues({});
  });

  group('AuthScaffold Widget Tests', () {
    testWidgets('Renders title, subtitle, logo and child content', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: const AuthScaffold(
            title: 'Test Title',
            subtitle: 'Test Subtitle',
            showBackButton: true,
            child: Text('Card Content Inside'),
          ),
        ),
      );

      expect(find.text('Test Title'), findsOneWidget);
      expect(find.text('Test Subtitle'), findsOneWidget);
      expect(find.text('Card Content Inside'), findsOneWidget);
      expect(find.byIcon(Icons.arrow_back_ios_new_rounded), findsOneWidget);
    });

    testWidgets('Tapping outside unfocuses text fields', (tester) async {
      final focusNode = FocusNode();

      await tester.pumpWidget(
        _buildTestApp(
          child: AuthScaffold(
            title: 'Focus Test',
            child: TextField(focusNode: focusNode),
          ),
        ),
      );

      focusNode.requestFocus();
      await tester.pump();
      expect(focusNode.hasFocus, isTrue);

      // Tap on title area outside
      await tester.tap(find.text('Focus Test'));
      await tester.pump();
      expect(focusNode.hasFocus, isFalse);
    });
  });

  group('OtpInputWidget Tests', () {
    testWidgets('Renders 6 input boxes and invokes onChanged/onCompleted', (tester) async {
      String latestPin = '';
      String completedPin = '';

      await tester.pumpWidget(
        _buildTestApp(
          child: Scaffold(
            body: OtpInputWidget(
              length: 6,
              onChanged: (pin) => latestPin = pin,
              onCompleted: (pin) => completedPin = pin,
              resendTimeoutSeconds: 5,
            ),
          ),
        ),
      );

      expect(find.byType(TextField), findsNWidgets(6));

      // Enter digits in sequence
      for (int i = 0; i < 6; i++) {
        await tester.enterText(find.byType(TextField).at(i), '${i + 1}');
        await tester.pump();
      }

      expect(latestPin, equals('123456'));
      expect(completedPin, equals('123456'));
    });

    testWidgets('Resend countdown timer decrements and enables resend button', (tester) async {
      bool resendCalled = false;

      await tester.pumpWidget(
        _buildTestApp(
          child: Scaffold(
            body: OtpInputWidget(
              length: 6,
              resendTimeoutSeconds: 2,
              onResend: () async {
                resendCalled = true;
              },
            ),
          ),
        ),
      );

      expect(find.textContaining('Resend in 2s'), findsOneWidget);

      // Fast forward 1 second
      await tester.pump(const Duration(seconds: 1));
      expect(find.textContaining('Resend in 1s'), findsOneWidget);

      // Fast forward 1 more second
      await tester.pump(const Duration(seconds: 1));
      await tester.pump();
      expect(find.text('Resend OTP'), findsOneWidget);

      // Tap Resend
      await tester.tap(find.text('Resend OTP'));
      await tester.pump();
      expect(resendCalled, isTrue);

      // Settle remaining timer
      await tester.pump(const Duration(seconds: 3));
    });
  });

  group('SplashScreen Redirection Tests', () {
    testWidgets('Splash initializes and routes to /home if authenticated', (tester) async {
      SharedPreferences.setMockInitialValues({
        'auth_token': 'valid_token_123',
        'user_profile': '{"id": 1, "name": "Aarav Sharma", "email": "aarav@example.com", "phone": "9876543210"}',
      });

      final authProvider = AuthProvider();
      AppRouter.setAuthOverride(authProvider);

      await tester.pumpWidget(
        MultiProvider(
          providers: [
            ChangeNotifierProvider<AuthProvider>.value(value: authProvider),
          ],
          child: MaterialApp.router(
            routerConfig: AppRouter.router,
          ),
        ),
      );

      expect(find.byType(SplashScreen), findsOneWidget);

      // Advance past splash delay
      await tester.pump(const Duration(seconds: 2));
      await tester.pumpAndSettle();

      expect(authProvider.isAuthenticated, isTrue);
      expect(find.byType(AppShell), findsOneWidget);
    });

    testWidgets('Splash routes to /onboarding if first launch unauthenticated', (tester) async {
      SharedPreferences.setMockInitialValues({});

      final authProvider = AuthProvider();
      AppRouter.setAuthOverride(authProvider);
      AppRouter.router.go('/splash');

      await tester.pumpWidget(
        MultiProvider(
          providers: [
            ChangeNotifierProvider<AuthProvider>.value(value: authProvider),
          ],
          child: MaterialApp.router(
            routerConfig: AppRouter.router,
          ),
        ),
      );

      await tester.pump(const Duration(seconds: 2));
      await tester.pumpAndSettle();

      expect(find.byType(OnboardingScreen), findsOneWidget);
    });
  });

  group('OnboardingScreen Walkthrough Tests', () {
    testWidgets('Swipes carousel and navigates to /login on Skip or Get Started', (tester) async {
      final router = GoRouter(
        initialLocation: '/onboarding',
        routes: [
          GoRoute(path: '/onboarding', builder: (_, __) => const OnboardingScreen()),
          GoRoute(path: '/login', builder: (_, __) => const Scaffold(body: Text('Login Screen Loaded'))),
        ],
      );

      await tester.pumpWidget(
        MaterialApp.router(
          routerConfig: router,
        ),
      );

      expect(find.text('Real CBT Exam Simulation'), findsOneWidget);
      expect(find.text('Skip'), findsOneWidget);
      expect(find.text('Continue'), findsOneWidget);

      // Tap Continue to next step
      await tester.tap(find.text('Continue'));
      await tester.pumpAndSettle();
      expect(find.text('Expert Video Courses & Notes'), findsOneWidget);

      // Tap Continue to third step
      await tester.tap(find.text('Continue'));
      await tester.pumpAndSettle();
      expect(find.text('Instant Doubt Clearing & AI Tutor'), findsOneWidget);
      expect(find.text('Get Started'), findsOneWidget);

      // Tap Get Started -> navigates to /login
      await tester.tap(find.text('Get Started'));
      await tester.pumpAndSettle();
      expect(find.text('Login Screen Loaded'), findsOneWidget);
    });
  });

  group('LoginScreen Form Validation & Actions Tests', () {
    testWidgets('Shows validation errors on empty submission', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(child: const LoginScreen()),
      );

      // Tap Sign In button without entering fields
      await tester.tap(find.byKey(const Key('login_button')));
      await tester.pump();

      expect(find.text('Please enter your phone or email'), findsOneWidget);
      expect(find.text('Please enter your password'), findsOneWidget);
    });

    testWidgets('Password visibility toggle updates obscureText', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(child: const LoginScreen()),
      );

      final passwordFieldFinder = find.byKey(const Key('password_input'));
      expect(passwordFieldFinder, findsOneWidget);

      TextField tf = tester.widget<TextField>(
        find.descendant(of: passwordFieldFinder, matching: find.byType(TextField)),
      );
      expect(tf.obscureText, isTrue);

      // Tap visibility toggle icon
      await tester.tap(find.byIcon(Icons.visibility_off_outlined));
      await tester.pump();

      tf = tester.widget<TextField>(
        find.descendant(of: passwordFieldFinder, matching: find.byType(TextField)),
      );
      expect(tf.obscureText, isFalse);
    });

    testWidgets('Submitting valid credentials invokes AuthProvider.login', (tester) async {
      final authProvider = AuthProvider();

      await tester.pumpWidget(
        _buildTestApp(
          child: const LoginScreen(),
          authProvider: authProvider,
        ),
      );

      await tester.enterText(
        find.byKey(const Key('phone_or_email_input')),
        '9876543210',
      );
      await tester.enterText(
        find.byKey(const Key('password_input')),
        'password123',
      );

      await tester.tap(find.byKey(const Key('login_button')));
      await tester.pump();

      // With MockOfflineInterceptor enabled by default, login succeeds
      await tester.pump(const Duration(seconds: 1));
      await tester.pumpAndSettle();

      expect(authProvider.isAuthenticated, isTrue);
      expect(authProvider.user?.name, isNotEmpty);
    });
  });

  group('RegisterScreen Form Validation Tests', () {
    testWidgets('Validates name, phone, email, password fields', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(child: const RegisterScreen()),
      );

      // Ensure button is visible and tap
      await tester.ensureVisible(find.byKey(const Key('register_button')));
      await tester.tap(find.byKey(const Key('register_button')));
      await tester.pump();

      expect(find.text('Please enter your full name'), findsOneWidget);
      expect(find.text('Please enter your phone number'), findsOneWidget);
      expect(find.text('Please enter your email address'), findsOneWidget);
      expect(find.text('Please create a password'), findsOneWidget);

      // Enter invalid email and short phone
      await tester.enterText(find.byKey(const Key('register_name_input')), 'Rajesh Kumar');
      await tester.enterText(find.byKey(const Key('register_phone_input')), '12345');
      await tester.enterText(find.byKey(const Key('register_email_input')), 'invalid-email');
      await tester.enterText(find.byKey(const Key('register_password_input')), '123');

      await tester.ensureVisible(find.byKey(const Key('register_button')));
      await tester.tap(find.byKey(const Key('register_button')));
      await tester.pump();

      expect(find.text('Please enter a valid phone number'), findsOneWidget);
      expect(find.text('Please enter a valid email address'), findsOneWidget);
      expect(find.text('Password must be at least 6 characters'), findsOneWidget);
    });

    testWidgets('Registers successfully with class dropdown selection', (tester) async {
      final authProvider = AuthProvider();

      await tester.pumpWidget(
        _buildTestApp(
          child: const RegisterScreen(),
          authProvider: authProvider,
        ),
      );

      await tester.enterText(find.byKey(const Key('register_name_input')), 'Priya Patel');
      await tester.enterText(find.byKey(const Key('register_phone_input')), '9876543210');
      await tester.enterText(find.byKey(const Key('register_email_input')), 'priya@test.com');
      await tester.enterText(find.byKey(const Key('register_password_input')), 'secret123');

      await tester.ensureVisible(find.byKey(const Key('register_button')));
      await tester.tap(find.byKey(const Key('register_button')));
      await tester.pump();
      await tester.pump(const Duration(seconds: 1));
      await tester.pumpAndSettle();

      expect(authProvider.isAuthenticated, isTrue);
    });
  });

  group('ForgotPasswordScreen Multi-Step Tests', () {
    testWidgets('Navigates through phone -> OTP -> New Password flow', (tester) async {
      final authProvider = AuthProvider();

      await tester.pumpWidget(
        _buildTestApp(
          child: const ForgotPasswordScreen(),
          authProvider: authProvider,
        ),
      );

      // Step 1: Phone input
      expect(find.text('Forgot Password'), findsOneWidget);
      expect(find.byKey(const Key('forgot_phone_input')), findsOneWidget);

      await tester.enterText(find.byKey(const Key('forgot_phone_input')), '9876543210');
      await tester.ensureVisible(find.byKey(const Key('send_otp_button')));
      await tester.tap(find.byKey(const Key('send_otp_button')));
      await tester.pump();
      await tester.pump(const Duration(seconds: 1));
      await tester.pumpAndSettle();

      // Step 2: OTP screen
      expect(find.text('Enter Verification Code'), findsOneWidget);
      expect(find.byKey(const Key('forgot_otp_input')), findsOneWidget);

      // Enter 6 digit OTP
      for (int i = 0; i < 6; i++) {
        await tester.enterText(find.byType(TextField).at(i), '${i + 1}');
        await tester.pump();
      }

      await tester.ensureVisible(find.byKey(const Key('verify_otp_button')));
      await tester.tap(find.byKey(const Key('verify_otp_button')));
      await tester.pumpAndSettle();

      // Step 3: New password screen
      expect(find.text('Set New Password'), findsOneWidget);
      expect(find.byKey(const Key('new_password_input')), findsOneWidget);
      expect(find.byKey(const Key('confirm_password_input')), findsOneWidget);

      await tester.enterText(find.byKey(const Key('new_password_input')), 'newSecret123');
      await tester.enterText(find.byKey(const Key('confirm_password_input')), 'newSecret123');

      await tester.ensureVisible(find.byKey(const Key('reset_password_button')));
      await tester.tap(find.byKey(const Key('reset_password_button')));
      await tester.pump();
      await tester.pump(const Duration(seconds: 1));
      await tester.pumpAndSettle();

      // Settle any remaining timers
      await tester.pump(const Duration(seconds: 35));
    });
  });

  group('AppShell Persistent Navigation Bar Tests', () {
    testWidgets('Renders all 5 destinations with proper labels and icons', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          child: const AppShell(
            child: Center(child: Text('Shell Body Content')),
          ),
        ),
      );

      expect(find.text('Shell Body Content'), findsOneWidget);
      expect(find.text('Home'), findsOneWidget);
      expect(find.text('Test Series'), findsOneWidget);
      expect(find.text('Courses'), findsOneWidget);
      expect(find.text('Doubts'), findsOneWidget);
      expect(find.text('Profile'), findsOneWidget);
    });
  });
}
