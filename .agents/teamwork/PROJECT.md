# Project: Test Series Flutter Application Clone

## Architecture
- **Framework**: Flutter (Dart 3, Material 3)
- **Application ID / Package**: `webphiser.com.test.series`
- **Architecture Pattern**: Layered clean architecture with Provider state management and GoRouter declarative routing.
- **Data Flow**:
  - UI Screens & Widgets -> Provider (State) -> Core Services (`ApiService`, `PaymentService`, `ScreenshotGuard`) -> `ApiClient` (Dio with `MockOfflineInterceptor` + Live API fallback)
- **Offline Reliability**: By default or when backend is unreachable, `MockOfflineInterceptor` intercepts requests to `https://edu.d3vx.in/test-series/api/mobile` and serves deterministic mock data for seamless testing and zero network failure.
- **Security**: Content protection via native `FLAG_SECURE` platform channel and dynamic student watermark canvas overlay.

## Code Layout
```
lib/
├── main.dart
├── router.dart
├── theme.dart
├── core/
│   ├── api_client.dart
│   ├── api_service.dart
│   ├── media.dart
│   ├── payment_service.dart
│   ├── report_pdf.dart
│   ├── screenshot_guard.dart
│   └── share_helper.dart
├── models/
│   └── models.dart
├── state/
│   └── auth_provider.dart
├── widgets/
│   ├── auth_scaffold.dart
│   ├── category_grid.dart
│   ├── common.dart
│   ├── course_card.dart
│   ├── otp_input.dart
│   ├── skeleton.dart
│   └── watermark.dart
└── screens/
    ├── splash_screen.dart
    ├── shell.dart
    ├── onboarding/onboarding_screen.dart
    ├── auth/
    │   ├── login_screen.dart
    │   ├── register_screen.dart
    │   └── forgot_password_screen.dart
    ├── home/home_screen.dart
    ├── test_series/
    │   ├── test_series_screen.dart
    │   └── test_series_detail_screen.dart
    ├── courses/
    │   ├── all_courses_screen.dart
    │   ├── course_detail_screen.dart
    │   └── my_courses_screen.dart
    ├── quiz/
    │   ├── free_quizzes_screen.dart
    │   ├── quiz_player_screen.dart
    │   ├── quiz_result_screen.dart
    │   ├── quiz_ui.dart
    │   ├── attempt_report_screen.dart
    │   ├── my_performance_screen.dart
    │   ├── previous_results.dart
    │   ├── report_widgets.dart
    │   ├── focus_areas.dart
    │   └── certificate_screen.dart
    ├── video/video_player_screen.dart
    ├── resources/
    │   ├── ebooks_screen.dart
    │   └── resource_list_screen.dart
    ├── content/content_viewer_screen.dart
    ├── live/live_screen.dart
    ├── doubt/
    │   ├── doubt_screen.dart
    │   └── doubt_detail_screen.dart
    ├── community/community_screen.dart
    ├── ai/ai_chat_screen.dart
    ├── profile/
    │   ├── profile_screen.dart
    │   └── edit_profile_screen.dart
    ├── payment/payment_screen.dart
    └── legal/legal_screen.dart
```

---

## Feature Inventory

Every identified feature from the survey phase mapped to its assigned milestone:

| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Asset Extraction | Extract 5 verified brand logos from APK (`assets/icons/`) | M1 | Survey (Explorer 1) |
| 2 | Project Scaffolding | Initialize Flutter project, pubspec.yaml with all 28 packages, and Android Gradle config | M1 | Survey (Explorer 1 & 3) |
| 3 | Material 3 Theme | Poppins typography, Indigo/Blue color palette, card themes, button themes | M2 | Survey (Explorer 1 & 2) |
| 4 | ApiClient & Mock Interceptor | Dio HTTP client with Bearer auth, error mapping, and offline mock interceptor | M2 | Survey (Explorer 2) |
| 5 | ApiService Endpoints | Complete client implementation for all 31 mobile API endpoints | M2 | Survey (Explorer 2) |
| 6 | Media & Security Core | Screenshot guard (`FLAG_SECURE`), watermark canvas, and media pickers | M2 | Survey (Explorer 1 & 3) |
| 7 | Domain Models (30 Entities) | Complete models in `models.dart` with manual `.fromJson()` & `.toJson()` | M3 | Survey (Explorer 2) |
| 8 | Auth State Management | `AuthProvider` for login, token persistence via SharedPreferences, logout | M3 | Survey (Explorer 2) |
| 9 | GoRouter & Shell Navigation | Persistent bottom navigation shell (Home, Test Series, Courses, Doubts, Profile) | M4 | Survey (Explorer 2) |
| 10 | Onboarding & Auth Flow | Splash screen, onboarding carousel, Login, Register, Forgot Password, OTP input | M4 | Survey (Explorer 2) |
| 11 | Home Dashboard & Feeds | Banner carousel slider, subject category grid, continue learning cards, live notice | M5 | Survey (Explorer 2) |
| 12 | Courses & Video Player | Course list, course details with syllabus, My Courses, embedded YouTube player | M5 | Survey (Explorer 1 & 2) |
| 13 | Test Series Directory | Test packages catalog, test package details with test listing, attempt status | M6 | Survey (Explorer 2) |
| 14 | CBT Exam Engine Player | Countdown timer, 5-state question palette, clear response, mark for review, auto-submit | M6 | Survey (Explorer 3) |
| 15 | Score Calculation & Penalty | Correct/incorrect scoring, negative marking, accuracy percentage, time tracking | M6 | Survey (Explorer 3) |
| 16 | Solution Review & Analytics | Question-by-question review, explanations, score gauges, focus areas (strong/weak) | M6 | Survey (Explorer 2 & 3) |
| 17 | Certificate Generator | Score certificate generation, passing threshold check, share certificate | M6 | Survey (Explorer 3) |
| 18 | Doubts Forum | Student doubts listing, submit doubt with photo attachment, teacher reply thread | M7 | Survey (Explorer 2) |
| 19 | Community Social Feed | Student posts, discussions, likes, comments | M7 | Survey (Explorer 2) |
| 20 | AI Study Tutor | Interactive AI Chat assistant for academic questions and test tips | M7 | Survey (Explorer 2) |
| 21 | eBooks & PDF Viewer | Digital library, in-app PDF view (`flutter_pdfview`), download & external open | M7 | Survey (Explorer 1 & 3) |
| 22 | Student Profile & Settings | View profile, edit profile, change target exam/class, app info | M8 | Survey (Explorer 2) |
| 23 | Razorpay Payment Gateway | Razorpay checkout integration with offline mock payment simulator | M8 | Survey (Explorer 1 & 3) |
| 24 | Legal & Policies | Terms of service, privacy policy, refund policy | M8 | Survey (Explorer 2) |
| 25 | APK Build & Packaging | Android manifest queries, JitPack repo, ProGuard rules, `flutter build apk` | M8 | Survey (Explorer 1 & 3) |
| 26 | E2E Test Suite & Validation | Complete unit tests for models, API, CBT engine, widget tests, and APK smoke check | M9 | Survey (Explorer 3) |

---

## Milestones

| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Assets & Scaffolding | Extract 5 image assets from APK, scaffold Flutter project with pubspec.yaml and Android build settings | none | DONE |
| M2 | Theme & Core Services | `theme.dart`, `api_client.dart` with mock interceptor, `api_service.dart`, `screenshot_guard.dart`, `watermark.dart` | M1 | DONE |
| M3 | Domain Models & Auth State | `models/models.dart` (30 entities), `state/auth_provider.dart`, model serialization unit tests | M2 | DONE |
| M4 | Navigation Shell & Auth Screens | `router.dart`, `shell.dart`, `splash_screen.dart`, `onboarding_screen.dart`, `login_screen.dart`, `register_screen.dart`, `forgot_password_screen.dart`, `otp_input.dart`, `auth_scaffold.dart` | M3 | DONE |
| M5 | Home Dashboard & Courses | `home_screen.dart`, `category_grid.dart`, `all_courses_screen.dart`, `course_detail_screen.dart`, `my_courses_screen.dart`, `video_player_screen.dart`, `course_card.dart` | M4 | DONE |
| M6 | CBT Exam Engine & Quiz Suite | `test_series_screen.dart`, `test_series_detail_screen.dart`, `quiz_player_screen.dart`, `quiz_result_screen.dart`, `attempt_report_screen.dart`, `quiz_ui.dart`, `report_widgets.dart`, `focus_areas.dart`, `certificate_screen.dart`, `my_performance_screen.dart`, `previous_results.dart` | M4 | DONE |
| M7 | Doubts, Community, AI & Resources | `doubt_screen.dart`, `doubt_detail_screen.dart`, `community_screen.dart`, `ai_chat_screen.dart`, `ebooks_screen.dart`, `resource_list_screen.dart`, `content_viewer_screen.dart` | M4 | DONE |
| M8 | Profile, Payments, Legal & Build APK | `profile_screen.dart`, `edit_profile_screen.dart`, `payment_screen.dart`, `payment_service.dart`, `legal_screen.dart`, Android packaging & `flutter build apk` | M5, M6, M7 | DONE |
| M9 | E2E Verification & Test Pass | Comprehensive test suite (102 tests pass, 0 flutter analyze issues), release APK verified at 76.9MB | M8 | DONE |

---

## Interface Contracts

### 1. `ApiClient` ↔ `ApiService`
- `ApiClient.dio`: Returns configured `Dio` instance with Base URL `https://edu.d3vx.in/test-series/api/mobile`, timeout 15s, Bearer token interceptor, and `MockOfflineInterceptor`.
- `ApiService(ApiClient client)`: Exposes typed async methods returning domain models or lists:
  - `Future<Student> login(String phone, String password)`
  - `Future<HomeFeed> getHomeFeed()`
  - `Future<List<Course>> getCourses({String? categoryId, String? search})`
  - `Future<Course> getCourseDetail(int courseId)`
  - `Future<List<TestSeriesSummary>> getTestSeries()`
  - `Future<TestSeriesDetail> getTestSeriesDetail(int seriesId)`
  - `Future<QuizPaper> getQuizPaper(int quizId)`
  - `Future<QuizResult> submitQuiz(int quizId, Map<int, dynamic> answers, int timeSpentSeconds)`
  - `Future<List<Doubt>> getDoubts()`
  - `Future<Doubt> submitDoubt(String title, String description, {String? imagePath})`
  - `Future<List<CommunityPost>> getCommunityFeed()`
  - `Future<AiReply> askAi(String question)`
  - `Future<List<Ebook>> getEbooks()`

### 2. `AuthProvider` ↔ UI Screens
- Exposes:
  - `Student? get user`
  - `bool get isAuthenticated`
  - `Future<bool> login(String phone, String password)`
  - `Future<bool> register(String name, String phone, String email, String password, String classId)`
  - `Future<void> logout()`
  - `Future<void> updateProfile(...)`

### 3. `QuizPlayerScreen` ↔ CBT Engine
- Manages:
  - Question indices (0 to N-1)
  - Answers map: `Map<int, int>` (questionId -> selectedOptionIndex)
  - Review flags: `Set<int>` (marked question IDs)
  - Visited questions: `Set<int>`
  - Time elapsed: `int remainingSeconds`
  - Auto-submission on timer expiry -> calls `ApiService.submitQuiz()` -> navigates to `QuizResultScreen(result: result)`
