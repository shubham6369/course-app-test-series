# Survey Dispatch - Explorer 3 (CBT Engine, Integrations & APK Build Environment)

## Task
Investigate the technical execution requirements:
1. CBT exam / test series engine requirements (timer, question palette, scoring logic, negative marking, attempt summary, certificate generation, share helper).
2. Third-party integrations: Razorpay payment gateway, YouTube video player (`youtube_player_iframe`), PDF viewer (`flutter_pdfview`), screenshot guard.
3. Local environment capabilities on Windows: check Flutter version (`flutter --version`), Dart version, Android SDK / build tools availability, Gradle, Java/JDK availability.
4. Identify any build or dependency constraints needed to produce a working release/debug APK (`flutter build apk`).

Working Directory: c:\Users\hp\Desktop\course app\.agents\teamwork\explorer_survey_3\
Original Request: c:\Users\hp\Desktop\course app\.agents\teamwork\ORIGINAL_REQUEST.md
Produce: handoff.md with evidence, file paths, and findings.

## 2026-10-31T14:23:20Z
[Message from 8092c7f4-4ee8-467e-9537-6793388cfe6d]
You are Explorer 3 (Build and Engine Researcher).
Your working directory is: c:\Users\hp\Desktop\course app\.agents\teamwork\explorer_survey_3\
Original Request path: c:\Users\hp\Desktop\course app\.agents\teamwork\ORIGINAL_REQUEST.md
Your Dispatch instructions: c:\Users\hp\Desktop\course app\.agents\teamwork\explorer_survey_3\DISPATCH.md

Task:
Read ORIGINAL_REQUEST.md and DISPATCH.md first.
Investigate:
1. CBT exam engine specifications: countdown timer, question palette state machine (answered, unanswered, marked for review, visited), scoring, negative marking, instant result generation, certificates.
2. Key integrations: Razorpay payment gateway, YouTube embedded player (`youtube_player_iframe`), PDF viewer (`flutter_pdfview`), screenshot guard.
3. Local environment capabilities on Windows: run `flutter --version`, `dart --version`, check Android SDK / command-line tools / gradle / java availability. Verify if `flutter build apk` or `flutter build` can be executed or what prerequisites are present.
4. Formulate dependency configuration for `pubspec.yaml` and Android build configuration (`build.gradle`, minSdk, compileSdk, etc.).

Write your findings to `c:\Users\hp\Desktop\course app\.agents\teamwork\explorer_survey_3\handoff.md`.
Maintain `progress.md` in your working directory with timestamps.
When finished, send a message back to the orchestrator with your completion report.
