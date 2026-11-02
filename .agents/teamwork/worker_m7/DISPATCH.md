# Worker M7 Dispatch: Milestone M7 (Doubts, Community, AI Tutor & Resources)

- **Date**: 2026-10-31
- **Assigned Subagent**: worker_m7 (teamwork_worker)
- **Role**: Doubts, Community & Resources Specialist
- **Working Directory**: c:\Users\hp\Desktop\course app\.agents\teamwork\worker_m7\
- **Original Request**: c:\Users\hp\Desktop\course app\.agents\teamwork\ORIGINAL_REQUEST.md
- **Project Scope**: c:\Users\hp\Desktop\course app\.agents\teamwork\PROJECT.md

## Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor and reviewer will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Scope of Work
Verify, polish, and ensure full test passing for all Milestone M7 modules:
1. `lib/screens/doubt/doubt_screen.dart`: Student doubts list, status filter chips ('All', 'Pending', 'Resolved'), FAB to open submit doubt modal with photo attachment / title / description.
2. `lib/screens/doubt/doubt_detail_screen.dart`: View selected doubt, student question, image attachment, teacher response thread, and status badge.
3. `lib/screens/community/community_screen.dart`: Community social feed with posts, like counter toggle, comments expansion, post doubt / discussion box.
4. `lib/screens/ai/ai_chat_screen.dart`: AI Study Tutor chat interface with message history, quick question chips, loading animation, and instant replies from `ApiService.askAi`.
5. `lib/screens/resources/ebooks_screen.dart` & `resource_list_screen.dart`: eBook and notes digital library with category tabs, search, read online and download buttons.
6. `lib/screens/content/content_viewer_screen.dart`: Secure in-app PDF and syllabus content reader.
7. `test/widget/doubts_community_test.dart`: Widget tests verifying all M7 flows.

## Mandatory Commands to Run & Document
1. Analyze M7 targets:
   `flutter analyze lib/screens/doubt lib/screens/community lib/screens/ai lib/screens/resources lib/screens/content test/widget/doubts_community_test.dart`
2. Run M7 widget tests:
   `flutter test test/widget/doubts_community_test.dart`
3. If any test or analysis issue fails, resolve it cleanly without regressions.
4. Document all results with verbatim terminal outputs in `handoff.md`.

## 2026-10-31T16:33:11Z
[Message] timestamp=2026-10-31T16:33:11Z sender=8092c7f4-4ee8-467e-9537-6793388cfe6d priority=MESSAGE_PRIORITY_HIGH content=You are worker_m7, a teamwork_worker specializing in Doubts, Community, AI Tutor & Resources for the educational test series app.

Your working directory is:
c:\Users\hp\Desktop\course app\.agents\teamwork\worker_m7\

First, read:
1. c:\Users\hp\Desktop\course app\.agents\teamwork\ORIGINAL_REQUEST.md
2. c:\Users\hp\Desktop\course app\.agents\teamwork\PROJECT.md
3. c:\Users\hp\Desktop\course app\.agents\teamwork\worker_m7\DISPATCH.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your tasks:
1. Review and verify the existing implementations for Milestone M7:
   - lib/screens/doubt/doubt_screen.dart (student doubts list, status filters, submit doubt dialog with photo attachment)
   - lib/screens/doubt/doubt_detail_screen.dart (doubt discussion thread with teacher replies)
   - lib/screens/community/community_screen.dart (social feed with likes, comments, and discussions)
   - lib/screens/ai/ai_chat_screen.dart (AI study assistant chat with quick question chips and instant responses)
   - lib/screens/resources/ebooks_screen.dart & resource_list_screen.dart (eBooks & PDF study materials)
   - lib/screens/content/content_viewer_screen.dart (secure in-app PDF and syllabus reader)
   - lib/router.dart routes for all M7 screens
2. Run static analysis:
   flutter analyze lib/screens/doubt lib/screens/community lib/screens/ai lib/screens/resources lib/screens/content test/widget/doubts_community_test.dart
3. Run the M7 widget tests:
   flutter test test/widget/doubts_community_test.dart
4. If any test or analysis issue fails, resolve it cleanly without regressions.
5. Create c:\Users\hp\Desktop\course app\.agents\teamwork\worker_m7\handoff.md following standard Handoff format (Observation, Logic Chain, Caveats, Conclusion, Verification Method) with verbatim terminal outputs of analysis and tests.
6. When finished, send a message to the caller with a summary of your findings and results.

## 2026-10-31T16:45:01Z
**Context**: Milestone M7 (Doubts, Community, AI & Resources)
**Content**: Status inquiry: Please report current progress on M7 static analysis, widget tests, and handoff generation.
**Action**: Reply with your current status or submit your handoff.md if complete.
