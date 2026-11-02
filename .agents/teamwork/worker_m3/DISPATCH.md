# Worker Dispatch - Milestone M3 (Domain Models & Auth State Management)

## Task
You are Worker 3 (`teamwork_worker`).
Your goal is to complete Milestone M3:
1. Review and refine `lib/models/models.dart`:
   - Ensure all 30 domain models from Explorer 2's specification are completely defined with robust `.fromJson` and `.toJson` methods.
2. Implement `lib/state/auth_provider.dart`:
   - Extend `ChangeNotifier`.
   - Manage state: `Student? currentUser`, `String? token`, `bool isLoading`, `String? errorMessage`.
   - Persistent session storage via `SharedPreferences`:
     - Keys: `auth_token`, `user_profile`
     - `initialize()` to restore session on app launch.
   - Authentication actions:
     - `login(String phone, String password)`
     - `register(String name, String phone, String email, String password, String classId)`
     - `verifyOtp(String phone, String otp)`
     - `forgotPassword(String phone)`
     - `updateProfile(Map<String, dynamic> data)`
     - `logout()`
3. Implement `test/unit/models_test.dart`:
   - Comprehensive tests validating round-trip JSON serialization (`fromJson` -> `toJson`) for all domain models: `Student`, `BannerItem`, `HomeFeed`, `CourseFolder`, `Course`, `Lesson`, `TestSeriesSummary`, `TestSeriesDetail`, `SeriesQuiz`, `QuizPaper`, `QuizQuestion`, `QuizResult`, `QuizAttemptSummary`, `Doubt`, `DoubtReply`, `CommunityPost`, `LiveClass`, `Ebook`, `Resource`, `AiMessage`, `AiReply`, etc.
4. Implement `test/unit/auth_provider_test.dart`:
   - Test login, registration, profile update, session restore, and logout with mock SharedPreferences / ApiService.
5. Run `flutter analyze` and `flutter test` to ensure 0 errors.

## MANDATORY INTEGRITY WARNING
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Working Directory: c:\Users\hp\Desktop\course app\.agents\teamwork\worker_m3\
Original Request: c:\Users\hp\Desktop\course app\.agents\teamwork\ORIGINAL_REQUEST.md
PROJECT.md: c:\Users\hp\Desktop\course app\.agents\teamwork\PROJECT.md
Architecture Reference: c:\Users\hp\Desktop\course app\.agents\teamwork\explorer_survey_2\handoff.md

Produce: `handoff.md` with implementation details, test outputs, and verification methods.
