# Worker Dispatch - Milestone M1 (Asset Extraction & Project Scaffolding)

## Task
You are Worker 1 (`teamwork_worker`).
Your goal is to complete Milestone M1:
1. Extract the 5 branding image assets from `c:\Users\hp\Desktop\course app\Test Series.apk` into `assets/icons/`:
   - `test_series_logo.jpeg`
   - `playstore.png`
   - `agnihotri_classes_logo.jpeg`
   - `aim_logo.png`
   - `hj_education.png`
2. Initialize and scaffold the Flutter project structure in `c:\Users\hp\Desktop\course app`:
   - Create directories: `lib/core`, `lib/models`, `lib/screens`, `lib/state`, `lib/widgets`, `test/unit`, `test/widget`.
   - Setup `pubspec.yaml` with required dependencies (Dio, Provider, GoRouter, GoogleFonts, YouTube Player Iframe, Flutter PDFView, Razorpay, etc., as specified in Explorer 3 report).
   - Configure Android files:
     - `android/app/build.gradle` (namespace: `webphiser.com.test.series`, minSdk: 24, compileSdk: 36, targetSdk: 36, multidex enabled).
     - `android/settings.gradle` (JitPack repository added for `flutter_pdfview`).
     - `android/app/src/main/AndroidManifest.xml` (package: `webphiser.com.test.series`, permissions, `<queries>` element for url_launcher and UPI payments).
     - `android/app/src/main/kotlin/webphiser/com/test/series/MainActivity.kt` with `FLAG_SECURE` security channel.
   - Run `flutter pub get` to verify dependency resolution.
   - Verify initial build / analysis passes.

## MANDATORY INTEGRITY WARNING
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Working Directory: c:\Users\hp\Desktop\course app\.agents\teamwork\worker_m1\
Original Request: c:\Users\hp\Desktop\course app\.agents\teamwork\ORIGINAL_REQUEST.md
PROJECT.md: c:\Users\hp\Desktop\course app\.agents\teamwork\PROJECT.md
Explorer Reports:
- `c:\Users\hp\Desktop\course app\.agents\teamwork\explorer_survey_1\handoff.md`
- `c:\Users\hp\Desktop\course app\.agents\teamwork\explorer_survey_3\handoff.md`

Produce: `handoff.md` with build & test verification commands and results.

## 2026-10-31T14:34:22Z
[Message] timestamp=2026-10-31T14:34:22Z sender=8092c7f4-4ee8-467e-9537-6793388cfe6d priority=MESSAGE_PRIORITY_HIGH content=You are Worker 1 (Flutter Scaffolding Specialist).
Task:
1. Extract the 5 brand images from `Test Series.apk` into `assets/icons/`:
   - `test_series_logo.jpeg`
   - `playstore.png`
   - `agnihotri_classes_logo.jpeg`
   - `aim_logo.png`
   - `hj_education.png`
2. Initialize Flutter project in `c:\Users\hp\Desktop\course app` if not already initialized (e.g. `flutter create --org webphiser.com --project-name test_series .`).
3. Set up `pubspec.yaml` with the dependencies formulated in Explorer 3's handoff (dio, provider, go_router, google_fonts, razorpay_flutter, youtube_player_iframe, flutter_pdfview, open_filex, shared_preferences, sqflite, etc.).
4. Configure Android files:
   - `android/app/build.gradle` (namespace: `webphiser.com.test.series`, minSdk: 24, compileSdk: 36, targetSdk: 36, multidex enabled)
   - `android/settings.gradle` (add `maven { url 'https://jitpack.io' }` under dependencyResolutionManagement repositories)
   - `android/app/src/main/AndroidManifest.xml` (package name, permissions, `<queries>` element for url_launcher, UPI payments `upi://pay`, `credpay`)
   - `android/app/src/main/kotlin/webphiser/com/test/series/MainActivity.kt` (native `FLAG_SECURE` platform channel)
5. Run `flutter pub get` and verify dependency resolution.
6. Create directory placeholders for `lib/core`, `lib/models`, `lib/screens`, `lib/state`, `lib/widgets`.
7. Document commands run and verified results.
