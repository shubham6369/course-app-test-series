# Worker Dispatch - Milestone M2 (Theme, Core Services, Networking & Security)

## Task
You are Worker 2 (`teamwork_worker`).
Your goal is to complete Milestone M2:
1. Implement `lib/theme.dart`:
   - Material 3 theme with GoogleFonts.poppins (`poppinsTextTheme`).
   - Primary colors: Indigo / Deep Blue (`#1A237E`, `#0D47A1`), teal accent (`#00897B`), light background (`#F8FAFC`).
   - Card themes (border radius: 12-16, elevation 1-2), InputDecorationTheme with rounded borders, ElevatedButtonTheme, AppBarTheme.
2. Implement `lib/core/api_client.dart`:
   - Dio client initialized with Base URL `https://edu.d3vx.in/test-series/api/mobile`.
   - Bearer token interceptor (extracts token from SharedPreferences or memory).
   - `MockOfflineInterceptor`: intercepts requests when offline or when mock mode is enabled (`API_OFFLINE_MODE = true` or network error fallback) and returns realistic mock data for all 31 endpoints listed in Explorer 2's handoff.
3. Implement `lib/core/api_service.dart`:
   - Methods for all mobile endpoints:
     - Auth: `login`, `register`, `forgotPassword`, `verifyOtp`, `getProfile`, `updateProfile`
     - Home & Catalog: `getBanners`, `getHomeFeed`, `getCategories`
     - Courses: `getCourses`, `getCourseDetail`, `getMyCourses`
     - Test Series: `getTestSeries`, `getTestSeriesDetail`
     - CBT Quizzes: `getFreeQuizzes`, `getQuizPaper`, `submitQuiz`, `getQuizResult`, `getMyPerformance`, `getPreviousResults`
     - Doubts: `getDoubts`, `getDoubtDetail`, `submitDoubt`, `replyDoubt`
     - Community: `getCommunityFeed`, `createPost`, `likePost`, `commentPost`
     - AI Tutor: `askAiChat`
     - Resources: `getEbooks`, `getResources`
4. Implement `lib/core/screenshot_guard.dart`:
   - `ScreenshotGuard` widget & class invoking `webphiser.com.test.series/security` MethodChannel on Android (`enableSecure` / `disableSecure`), safe no-op on desktop/web.
5. Implement `lib/core/media.dart`:
   - Media helpers for picking images (`image_picker`) and local caching.
6. Implement `lib/core/payment_service.dart`:
   - Razorpay payment handler with mock fallback simulator for safe offline checkout testing.
7. Implement `lib/core/report_pdf.dart` & `lib/core/share_helper.dart`:
   - Sharing certificates and result cards via `share_plus`.
8. Implement `lib/widgets/watermark.dart`, `lib/widgets/skeleton.dart`, and `lib/widgets/common.dart`:
   - Canvas diagonal watermark overlay, Shimmer skeleton loaders, custom buttons, badges, chips, empty state widgets.
9. Implement a unit test in `test/unit/api_service_test.dart`:
   - Verify `ApiService` with `MockOfflineInterceptor` retrieves mock data for home feed, courses, and quiz paper without errors.
10. Run `flutter analyze` and `flutter test` to ensure 0 errors.

## MANDATORY INTEGRITY WARNING
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Working Directory: c:\Users\hp\Desktop\course app\.agents\teamwork\worker_m2\
Original Request: c:\Users\hp\Desktop\course app\.agents\teamwork\ORIGINAL_REQUEST.md
PROJECT.md: c:\Users\hp\Desktop\course app\.agents\teamwork\PROJECT.md
Architecture Reference: c:\Users\hp\Desktop\course app\.agents\teamwork\explorer_survey_2\handoff.md
Build Reference: c:\Users\hp\Desktop\course app\.agents\teamwork\explorer_survey_3\handoff.md

Produce: `handoff.md` with implementation details, test outputs, and verification methods.

## 2026-10-31T14:53:20Z
[Message] sender=8092c7f4-4ee8-467e-9537-6793388cfe6d priority=MESSAGE_PRIORITY_HIGH
Dispatched for Milestone M2: Theme, Core Services, Networking & Security Specialist.

## 2026-10-31T15:03:44Z
[Message] sender=8092c7f4-4ee8-467e-9537-6793388cfe6d priority=MESSAGE_PRIORITY_HIGH
Context: Milestone M2 Verification & Handoff
Action: Reply with verification output and deliver handoff.md.

