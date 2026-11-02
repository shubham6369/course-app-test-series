# Worker Dispatch - Milestone M4 (Navigation Shell, Auth & Onboarding Screens)

## Task
You are Worker 4 (`teamwork_worker`).
Your goal is to implement Milestone M4:
1. Implement `lib/widgets/auth_scaffold.dart`:
   - Clean, professional auth background with brand logo `assets/icons/test_series_logo.jpeg`, title, subtitle, scrollable card, keyboard dismissal.
2. Implement `lib/widgets/otp_input.dart`:
   - 6-digit pin code input with auto-advance, backspace handling, resend countdown timer.
3. Implement `lib/screens/splash_screen.dart`:
   - Smooth animated splash, session initialization check via `AuthProvider.initialize()`, auto-navigate to `/home` (if authenticated) or `/onboarding` (if first time/unauthenticated).
4. Implement `lib/screens/onboarding/onboarding_screen.dart`:
   - 3-step carousel slider featuring CBT Mock Exams, Video Lectures, and Doubt Clearing. "Skip" and "Get Started" buttons leading to `/login`.
5. Implement `lib/screens/auth/login_screen.dart`:
   - Phone/email field, password field with visibility toggle, remember me checkbox, "Forgot Password?", "Sign In" button with loading state, link to `/register`.
6. Implement `lib/screens/auth/register_screen.dart`:
   - Full Name, Phone, Email, Password, Class/Exam selector dropdown, "Register" button, validation errors display, link to `/login`.
7. Implement `lib/screens/auth/forgot_password_screen.dart`:
   - Phone input -> OTP verification step -> New password step -> Success toast and redirect to `/login`.
8. Implement `lib/screens/shell.dart`:
   - Persistent `NavigationBar` with 5 navigation destinations: Home, Test Series, Courses, Doubts, Profile. Smooth page switching.
9. Implement `lib/router.dart`:
   - GoRouter setup with `/splash`, `/onboarding`, `/login`, `/register`, `/forgot-password`, and `ShellRoute` with 5 tab branches (`/home`, `/test-series`, `/courses`, `/doubts`, `/profile`).
   - Auth redirect guard based on `AuthProvider.isAuthenticated`.
10. Update `lib/main.dart`:
    - Wire `MultiProvider` with `AuthProvider`, use `AppTheme.lightTheme`, and configure `MaterialApp.router`.
11. Implement widget tests in `test/widget/auth_screens_test.dart`:
    - Test splash redirection, login form validation & button click, register screen input, and OTP widget.
12. Run `flutter analyze` and `flutter test` to ensure 0 errors.

## MANDATORY INTEGRITY WARNING
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Working Directory: c:\Users\hp\Desktop\course app\.agents\teamwork\worker_m4\
Original Request: c:\Users\hp\Desktop\course app\.agents\teamwork\ORIGINAL_REQUEST.md
PROJECT.md: c:\Users\hp\Desktop\course app\.agents\teamwork\PROJECT.md
Architecture Reference: c:\Users\hp\Desktop\course app\.agents\teamwork\explorer_survey_2\handoff.md

Produce: `handoff.md` with implementation details, test outputs, and verification methods.


## 2026-10-31T15:28:26Z
You are Worker 4 (Navigation & Auth Screens Specialist).
Your working directory is: c:\Users\hp\Desktop\course app\.agents\teamwork\worker_m4\
Original Request path: c:\Users\hp\Desktop\course app\.agents\teamwork\ORIGINAL_REQUEST.md
PROJECT.md path: c:\Users\hp\Desktop\course app\.agents\teamwork\PROJECT.md
Architecture Reference: c:\Users\hp\Desktop\course app\.agents\teamwork\explorer_survey_2\handoff.md
Your Dispatch instructions: c:\Users\hp\Desktop\course app\.agents\teamwork\worker_m4\DISPATCH.md


## 2026-10-31T15:39:02Z
Context: Milestone M4 Verification & Handoff
Content: Observed that all M4 artifacts (auth_scaffold.dart, otp_input.dart, splash_screen.dart, onboarding_screen.dart, login_screen.dart, register_screen.dart, forgot_password_screen.dart, shell.dart, router.dart, main.dart, and auth_screens_test.dart) have been authored. Please deliver your verification test outputs and handoff.md.
Action: Reply with your verification summary and deliver handoff.md.
