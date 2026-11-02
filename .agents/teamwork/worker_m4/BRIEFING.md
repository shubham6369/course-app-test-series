# BRIEFING — 2026-10-31T21:12:30Z

## Mission
Implement Milestone M4: Navigation Shell, Auth & Onboarding Screens (`auth_scaffold.dart`, `otp_input.dart`, `splash_screen.dart`, `onboarding_screen.dart`, `login_screen.dart`, `register_screen.dart`, `forgot_password_screen.dart`, `shell.dart`, `router.dart`, update `main.dart`, and comprehensive widget tests in `test/widget/auth_screens_test.dart`).

## 🔒 My Identity
- Archetype: teamwork_worker
- Roles: implementer, qa, specialist
- Working directory: c:\Users\hp\Desktop\course app\.agents\teamwork\worker_m4\
- Original parent: 8092c7f4-4ee8-467e-9537-6793388cfe6d
- Milestone: M4 (Navigation Shell & Auth Screens)

## 🔒 Key Constraints
- Genuine implementation with full logic (no hardcoding, dummy facades, or cheating).
- Zero issues in `flutter analyze` and `flutter test`.
- Clean Material 3 UI with Poppins typography, brand logo `assets/icons/test_series_logo.jpeg`, and proper state wiring.
- Persistent bottom navigation bar with 5 destinations (Home, Test Series, Courses, Doubts, Profile).
- Proper GoRouter configuration with auth guards.
- Maintain progress.md and handoff.md.

## Current Parent
- Conversation ID: 8092c7f4-4ee8-467e-9537-6793388cfe6d
- Updated: 2026-10-31T21:12:30Z

## Task Summary
- **What to build**: Full navigation shell, authentication screens (Login, Register, Forgot Password, OTP), animated splash screen, onboarding carousel walkthrough, GoRouter routing, and widget tests.
- **Success criteria**: 0 flutter analyze warnings/errors, all widget tests pass, authentic UI and state management integration.
- **Interface contracts**: PROJECT.md, `AuthProvider` in `lib/state/auth_provider.dart`, `AppTheme` in `lib/theme.dart`.
- **Code layout**: PROJECT.md § Code Layout.

## Key Decisions Made
- `AuthScaffold` uses responsive scrollable layout with brand logo `assets/icons/test_series_logo.jpeg`.
- `OtpInputWidget` manages 6 digit text controllers, keyboard events, and countdown timer.
- `SplashScreen` uses `CurvedAnimation` scale/fade and post-frame callback to trigger `AuthProvider.initialize()`, routing to `/home`, `/login`, or `/onboarding`.
- `OnboardingScreen` has 3-step feature highlight carousel with interactive dots and Skip/Get Started navigation.
- `LoginScreen` integrates phone/email and password validation, visibility toggle, remember-me persistence, and `AuthProvider.login`.
- `RegisterScreen` integrates full name, phone, email, password, and class/exam dropdown with `AuthProvider.register`.
- `ForgotPasswordScreen` implements 3-step flow (phone -> OTP -> new password) with `AuthProvider.resetPassword`.
- `AppShell` implements persistent bottom NavigationBar with 5 destinations (Home, Test Series, Courses, Doubts, Profile).
- `AppRouter` establishes full `GoRouter` declarative routes, `ShellRoute`, and auth redirect guards.
- Tab screens base implementations added (`HomeScreen`, `TestSeriesScreen`, `AllCoursesScreen`, `DoubtScreen`, `ProfileScreen`) to ensure seamless navigation.
- Comprehensive widget test suite added in `test/widget/auth_screens_test.dart` (14 test cases), passing 100%.

## Artifact Index
- `lib/widgets/auth_scaffold.dart` — Auth container with brand logo & responsive card
- `lib/widgets/otp_input.dart` — 6-digit OTP pin input with countdown timer
- `lib/screens/splash_screen.dart` — Animated splash with session initialization
- `lib/screens/onboarding/onboarding_screen.dart` — 3-step feature highlights carousel
- `lib/screens/auth/login_screen.dart` — Login screen with validation & AuthProvider
- `lib/screens/auth/register_screen.dart` — Registration screen with class dropdown
- `lib/screens/auth/forgot_password_screen.dart` — 3-step reset password flow with OTP
- `lib/screens/shell.dart` — Bottom navigation shell with 5 tabs
- `lib/screens/home/home_screen.dart` — Tab destination base screen
- `lib/screens/test_series/test_series_screen.dart` — Tab destination base screen
- `lib/screens/courses/all_courses_screen.dart` — Tab destination base screen
- `lib/screens/doubt/doubt_screen.dart` — Tab destination base screen
- `lib/screens/profile/profile_screen.dart` — Tab destination base screen
- `lib/router.dart` — GoRouter route hierarchy & auth guard
- `lib/main.dart` — MultiProvider + MaterialApp.router setup
- `test/widget/auth_screens_test.dart` — 14 widget tests

## Change Tracker
- **Files modified**: `lib/widgets/auth_scaffold.dart`, `lib/widgets/otp_input.dart`, `lib/screens/splash_screen.dart`, `lib/screens/onboarding/onboarding_screen.dart`, `lib/screens/auth/login_screen.dart`, `lib/screens/auth/register_screen.dart`, `lib/screens/auth/forgot_password_screen.dart`, `lib/screens/shell.dart`, `lib/screens/home/home_screen.dart`, `lib/screens/test_series/test_series_screen.dart`, `lib/screens/courses/all_courses_screen.dart`, `lib/screens/doubt/doubt_screen.dart`, `lib/screens/profile/profile_screen.dart`, `lib/router.dart`, `lib/main.dart`, `test/widget_test.dart`, `test/widget/auth_screens_test.dart`
- **Build status**: PASS (`flutter analyze`: 0 issues, `flutter test`: 53/53 passed)
- **Pending issues**: none

## Quality Status
- **Build/test result**: PASS (53 tests passed)
- **Lint status**: clean (0 issues)
- **Tests added/modified**: 14 widget tests in `test/widget/auth_screens_test.dart` + 1 smoke test in `test/widget_test.dart`
