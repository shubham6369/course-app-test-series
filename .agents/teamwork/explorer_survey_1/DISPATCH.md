# Survey Dispatch - Explorer 1 (APK & Asset Inspection)

## Task
Inspect `c:\Users\hp\Desktop\course app\Test Series.apk`.
Investigate:
1. APK contents: unpack/inspect assets, images, icons (such as `assets/icons/test_series_logo.jpeg`, `assets/icons/playstore.png`, etc.).
2. Android manifest: package name, permissions, activities (e.g. Razorpay CheckoutActivity).
3. Flutter asset bundle and dependencies.
4. Document the exact list of assets to extract, configuration settings, and packaging requirements.

Working Directory: c:\Users\hp\Desktop\course app\.agents\teamwork\explorer_survey_1\
Original Request: c:\Users\hp\Desktop\course app\.agents\teamwork\ORIGINAL_REQUEST.md
Produce: handoff.md with evidence, file paths, and findings.

## 2026-10-31T14:23:20Z
Task:
Read ORIGINAL_REQUEST.md and DISPATCH.md first.
Inspect `c:\Users\hp\Desktop\course app\Test Series.apk`:
1. Use commands/tools (e.g. zip/tar/powershell or extraction scripts) to inspect the APK structure.
2. Check `assets/flutter_assets/` inside the APK, list all image and icon assets (e.g., logo, banners, icons).
3. Check Android package name, permissions, and activities from `AndroidManifest.xml`.
4. Check Flutter engine and asset manifest (`AssetManifest.json`, `FontManifest.json`).
5. Document findings, exact asset paths to extract, and Android configuration requirements.

Write your findings to `c:\Users\hp\Desktop\course app\.agents\teamwork\explorer_survey_1\handoff.md`.
Maintain `progress.md` in your working directory with timestamps.
When finished, send a message back to the orchestrator with your completion report.
