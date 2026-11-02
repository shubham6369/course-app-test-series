# BRIEFING — 2026-10-31T14:33:00Z

## Mission
Investigate CBT exam engine specifications, key third-party integrations, Windows local build environment capabilities, and Android build configurations for the course and test series app.

## 🔒 My Identity
- Archetype: explorer
- Roles: Build and Engine Researcher
- Working directory: c:\Users\hp\Desktop\course app\.agents\teamwork\explorer_survey_3
- Original parent: 8092c7f4-4ee8-467e-9537-6793388cfe6d
- Milestone: exploration

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- Investigate CBT engine state machine, integrations (Razorpay, YouTube, PDF, Screenshot Guard), local Windows environment (Flutter/Dart/Android SDK/JDK/Gradle), and pubspec/Gradle build configs.

## Current Parent
- Conversation ID: 8092c7f4-4ee8-467e-9537-6793388cfe6d
- Updated: not yet

## Investigation State
- **Explored paths**:
  - `Test Series.apk` binary inspection (`classes.dex`, `AndroidManifest.xml` via `aapt.exe`, `NOTICES.Z` decompression, `lib/` native libraries)
  - Flutter Doctor (`flutter doctor -v`)
  - Local SDK tools: Android SDK 36.0.0, build-tools 36.0.0, OpenJDK 17 & 21
  - Cached Gradle versions in `~/.gradle/wrapper/dists`
  - Implementation plan in `clone_test_series_app_plan.md`
- **Key findings**:
  - Flutter 3.41.1, Dart 3.11.0, Android SDK 36.0.0, JDK 17 & 21 all healthy with "No issues found".
  - Verified package name: `webphiser.com.test.series`, `minSdkVersion: 24`, `targetSdkVersion: 36`, `compileSdkVersion: 36`.
  - Recovered exact packages from APK: `dio`, `cached_network_image`, `carousel_slider`, `flutter_pdfview`, `image_picker`, `intl`, `open_filex`, `razorpay_flutter`, `share_plus`, `shimmer`, `sqflite`, `uuid`, `youtube_player_iframe`.
  - Identified JitPack maven requirement for `flutter_pdfview` and ProGuard rules for `razorpay_flutter`.
  - Formulated robust 5-state CBT Question Palette state machine and instant scoring algorithms.
  - Formulated native `FLAG_SECURE` MethodChannel for Screenshot Guard.
- **Unexplored areas**: None (all survey items investigated).

## Key Decisions Made
- Confirmed full capability to build release/debug APK locally on Windows machine without missing toolchains.
- Selected native MethodChannel for ScreenshotGuard to avoid unmaintained plugins and prevent Windows desktop crash during development.
- Documented JitPack maven repository requirement in `settings.gradle` to avoid `flutter_pdfview` Gradle build failure.

## Artifact Index
- DISPATCH.md — Survey dispatch instructions
- progress.md — Liveness heartbeat and progress tracking
- handoff.md — Comprehensive 5-component handoff report
