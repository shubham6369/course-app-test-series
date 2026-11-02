# Reviewer Dispatch - Milestone M3 Review

## Task
You are Reviewer 3 (`teamwork_reviewer`).
Your task is to independently review and verify Milestone M3 (Domain Models & Auth State Management):
1. Review `lib/models/models.dart`:
   - Verify all 31 domain models, field types, nullability, `.fromJson` and `.toJson` methods.
2. Review `lib/state/auth_provider.dart`:
   - Verify `AuthProvider` implementation, `ChangeNotifier` integration, `SharedPreferences` session persistence, auth actions (`login`, `register`, `verifyOtp`, `forgotPassword`, `updateProfile`, `logout`), and error state handling.
3. Review unit tests:
   - `test/unit/models_test.dart`
   - `test/unit/auth_provider_test.dart`
4. Run verification commands:
   - `flutter analyze`
   - `flutter test`
5. Perform adversarial & integrity checks:
   - Verify that test assertions are genuine and test actual logic.
   - Verify that session persistence handles edge cases (e.g., corrupted JSON, missing keys).
6. Render a definitive verdict: **APPROVE** or **REQUEST_CHANGES**.

Working Directory: c:\Users\hp\Desktop\course app\.agents\teamwork\reviewer_m3\
Original Request: c:\Users\hp\Desktop\course app\.agents\teamwork\ORIGINAL_REQUEST.md
PROJECT.md: c:\Users\hp\Desktop\course app\.agents\teamwork\PROJECT.md
Worker Report: c:\Users\hp\Desktop\course app\.agents\teamwork\worker_m3\handoff.md

Produce: `handoff.md` with findings, command outputs, and final verdict.

## 2026-10-31T15:21:45Z
Sender: 8092c7f4-4ee8-467e-9537-6793388cfe6d
Priority: MESSAGE_PRIORITY_HIGH
Content:
You are Reviewer 3 (Auth State & Models Reviewer).
Your working directory is: c:\Users\hp\Desktop\course app\.agents\teamwork\reviewer_m3\
Original Request path: c:\Users\hp\Desktop\course app\.agents\teamwork\ORIGINAL_REQUEST.md
PROJECT.md path: c:\Users\hp\Desktop\course app\.agents\teamwork\PROJECT.md
Worker handoff to review: c:\Users\hp\Desktop\course app\.agents\teamwork\worker_m3\handoff.md
Your Dispatch instructions: c:\Users\hp\Desktop\course app\.agents\teamwork\reviewer_m3\DISPATCH.md

Task:
Read ORIGINAL_REQUEST.md, PROJECT.md, and worker_m3/handoff.md first.
Independently audit and verify Milestone M3:
1. Examine `lib/models/models.dart` (all 31 domain models, serialization, robustness).
2. Examine `lib/state/auth_provider.dart` (session persistence, token sync, auth lifecycle).
3. Examine `test/unit/models_test.dart` and `test/unit/auth_provider_test.dart`.
4. Run:
   - `flutter analyze`
   - `flutter test`
5. Conduct adversarial & integrity checks.
6. Render a definitive verdict: APPROVE or REQUEST_CHANGES.

Maintain progress.md in your working directory.
When done, write handoff.md and send a message back with your verdict and findings.

## 2026-10-31T15:27:09Z
Sender: 8092c7f4-4ee8-467e-9537-6793388cfe6d
Priority: MESSAGE_PRIORITY_HIGH
Content:
**Context**: Milestone M3 Review
**Content**: Heartbeat and safety check. Please provide an update on verification outputs (`flutter analyze`, `flutter test`) and handoff report ETA.
**Action**: Reply with your findings and deliver handoff.md.
