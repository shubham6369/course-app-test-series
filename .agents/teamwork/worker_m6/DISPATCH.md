# Worker Dispatch - Milestone M6 (CBT Exam Engine & Quiz Suite)

## Task
You are Worker 6 (`teamwork_worker`).
Your goal is to implement Milestone M6:
1. Implement `lib/screens/test_series/test_series_screen.dart`:
   - Catalog of test series packages (NEET, JEE, Mock Tests, DPPs) with filter chips, package cards with test counts, and detail navigation.
2. Implement `lib/screens/test_series/test_series_detail_screen.dart`:
   - Package overview, syllabus coverage, and list of tests (`SeriesQuiz`) with duration, marks, negative marking rules, and "Attempt Now" / "View Result" buttons.
3. Implement `lib/screens/quiz/free_quizzes_screen.dart`:
   - Daily practice quizzes list with instant start action.
4. Implement `lib/screens/quiz/quiz_ui.dart`:
   - Question palette with 5 states (Not Visited, Unanswered, Answered, Marked for Review, Answered & Marked for Review) with clear color tokens.
   - Countdown timer badge chip with warning styling.
   - Option selection tile (single / multi-choice).
   - CBT action controls: Clear response, Mark for Review & Next, Save & Next, Previous, Submit.
5. Implement `lib/screens/quiz/quiz_player_screen.dart`:
   - Full CBT exam engine with Question Palette drawer/sheet, live countdown timer, auto-submit on expiry, submission confirmation dialog, and instant score computation.
   - ScreenshotGuard protection enabled during test.
6. Implement `lib/screens/quiz/quiz_result_screen.dart`:
   - Instant score card: Score, Percentile, Accuracy %, Time taken, Correct/Incorrect/Skipped breakdown.
   - Action buttons: View Solutions, Certificate, Retake, Share Score.
7. Implement `lib/screens/quiz/attempt_report_screen.dart`:
   - Question-by-question review with student's response, correct answer highlight, step-by-step explanations, time spent per question, and filter by status.
8. Implement `lib/screens/quiz/report_widgets.dart` and `lib/screens/quiz/focus_areas.dart`:
   - Score gauges, accuracy rings, and Strong vs Weak topic breakdown.
9. Implement `lib/screens/quiz/certificate_screen.dart`:
   - Certificate of completion with student name, score, accuracy, date, UUID (`CERT-...`), and share/download actions via `ShareHelper`.
10. Implement `lib/screens/quiz/my_performance_screen.dart` and `lib/screens/quiz/previous_results.dart`:
    - Aggregate score analytics, trend chart, and history of past test attempts.
11. Wire routes in `lib/router.dart`:
    - `/test-series/:id`, `/quiz-player`, `/quiz-result`, `/attempt-report`, `/certificate`, `/my-performance`, `/previous-results`, `/free-quizzes`.
12. Implement tests:
    - `test/unit/cbt_scoring_test.dart`: scoring formula ($S = Q_c \cdot M - Q_w \cdot N$), accuracy, negative marks.
    - `test/widget/quiz_player_test.dart`: Question palette 5-state transitions, countdown timer, option selection, submit confirmation.
13. Run `flutter analyze` and `flutter test` to ensure 0 errors.

## MANDATORY INTEGRITY WARNING
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Working Directory: c:\Users\hp\Desktop\course app\.agents\teamwork\worker_m6\
Original Request: c:\Users\hp\Desktop\course app\.agents\teamwork\ORIGINAL_REQUEST.md
PROJECT.md: c:\Users\hp\Desktop\course app\.agents\teamwork\PROJECT.md
Architecture Reference: c:\Users\hp\Desktop\course app\.agents\teamwork\explorer_survey_2\handoff.md
CBT Engine Reference: c:\Users\hp\Desktop\course app\.agents\teamwork\explorer_survey_3\handoff.md

Produce: `handoff.md` with implementation details, test outputs, and verification methods.

## 2026-10-31T16:06:44Z
You are Worker 6 (CBT Exam Engine Specialist).
Your working directory is: c:\Users\hp\Desktop\course app\.agents\teamwork\worker_m6\
Original Request path: c:\Users\hp\Desktop\course app\.agents\teamwork\ORIGINAL_REQUEST.md
PROJECT.md path: c:\Users\hp\Desktop\course app\.agents\teamwork\PROJECT.md
Architecture Reference: c:\Users\hp\Desktop\course app\.agents\teamwork\explorer_survey_2\handoff.md
CBT Engine Reference: c:\Users\hp\Desktop\course app\.agents\teamwork\explorer_survey_3\handoff.md
Your Dispatch instructions: c:\Users\hp\Desktop\course app\.agents\teamwork\worker_m6\DISPATCH.md

Task:
Read ORIGINAL_REQUEST.md, PROJECT.md, and DISPATCH.md first.
Implement Milestone M6:
1. `lib/screens/test_series/test_series_screen.dart`: Catalog of test packages, filter chips, package cards.
2. `lib/screens/test_series/test_series_detail_screen.dart`: Package details & tests list with duration/marks.
3. `lib/screens/quiz/free_quizzes_screen.dart`: Daily practice quizzes.
4. `lib/screens/quiz/quiz_ui.dart`: 5-state Question Palette, timer badge chip, option selector, CBT navigation action bar.
5. `lib/screens/quiz/quiz_player_screen.dart`: Full CBT engine, countdown timer, auto-submit, confirmation dialog, instant result computation, ScreenshotGuard.
6. `lib/screens/quiz/quiz_result_screen.dart`: Instant score card, rank, accuracy, solution & certificate CTAs.
7. `lib/screens/quiz/attempt_report_screen.dart`: Question-by-question solutions with explanation & filter by status.
8. `lib/screens/quiz/report_widgets.dart` & `lib/screens/quiz/focus_areas.dart`: Accuracy charts & Strong vs Weak topic analysis.
9. `lib/screens/quiz/certificate_screen.dart`: Official Certificate of Achievement with student name, score, UUID, and share actions.
10. `lib/screens/quiz/my_performance_screen.dart` & `lib/screens/quiz/previous_results.dart`: Score progression analytics & attempt history.
11. Wire routes in `lib/router.dart`.
12. Tests: `test/unit/cbt_scoring_test.dart` and `test/widget/quiz_player_test.dart`.
13. Run `flutter analyze` and `flutter test` to ensure 0 errors.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Maintain progress.md in your working directory.
When done, write handoff.md and send a message back with your results.

## 2026-10-31T16:17:21Z
**Context**: Milestone M6 Verification & Handoff
**Content**: All 10 CBT exam and quiz modules are authored in lib/screens/quiz/ and lib/screens/test_series/, along with test/widget/cbt_quiz_test.dart. Please report your verification test results (`flutter analyze`, `flutter test`) and deliver handoff.md.
**Action**: Reply with your verification summary and deliver handoff.md.
