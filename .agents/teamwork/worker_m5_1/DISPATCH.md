## 2026-11-01T19:23:15Z

You are worker_m5_1.
Your working directory is `c:\Users\hp\Desktop\course app\.agents\teamwork\worker_m5_1`.
You MUST read `c:\Users\hp\Desktop\course app\.agents\teamwork\ORIGINAL_REQUEST.md` before starting work.
Scope document: `c:\Users\hp\Desktop\course app\.agents\teamwork\orchestrator_gen2\plan.md`.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Examine the 3 Explorer Handoff Reports for complete details, contracts, schemas, and blueprints:
1. `c:\Users\hp\Desktop\course app\.agents\teamwork\explorer_m5_1\handoff.md` (Detailed endpoint mapping & critical discrepancies)
2. `c:\Users\hp\Desktop\course app\.agents\teamwork\explorer_m5_2\handoff.md` (Prisma schema & database entity audit)
3. `c:\Users\hp\Desktop\course app\.agents\teamwork\explorer_m5_3\handoff.md` (Step-by-step implementation blueprint & verification strategy)

File Ownership (You exclusively own and may edit):
- `backend/src/lib/mobile-auth.ts` (Create this centralized helper)
- `backend/src/lib/api-response.ts` (Enhance with helper functions)
- `backend/src/app/test-series/api/mobile/**` (All route handlers)
- `backend/tests/verify-mobile.ts` (Create the complete automated verification test suite)
- `backend/package.json` (Add `"test:mobile"` script)
- `backend/prisma/seed.ts` (Optional: seed questions for standalone quizzes if needed)

Tasks to Complete:
1. Create `backend/src/lib/mobile-auth.ts` per `explorer_m5_3` blueprint:
   - `getStudentFromBearer(req, options)`: Support Bearer JWT token, seeded mock tokens, active status check, and return 401 Unauthorized when `options.required === true`.
   - `formatStudentResponse(student, token)`.
2. Enhance `backend/src/lib/api-response.ts`:
   - Add `mobileSuccess`, `mobileError`, `mobileUnauthorized`, `mobileNotFound`.
3. Standardize and fix all route handlers in `backend/src/app/test-series/api/mobile/` to adopt dual-key superset envelopes matching Flutter `models.dart`:
   - Fix FATAL crash in `quiz-attempts/[id]/route.ts`: nest `question: { id, question_text, options, correct_option, ... }` inside each element of `questions: QuestionReview[]`.
   - Fix `quizzes/[id]/submit/route.ts`: return `attempt_id` (number), `quiz_title`, `total_marks`, `correct_answers`, `incorrect_answers`, `unattempted`, `accuracy`, `rank`, `total_participants`, `percentile`, `is_passed`, `certificate_url`.
   - Fix `home-feed/route.ts`: provide `popular_courses` AND `featured_courses`, `featured_test_series` AND `popular_test_series`, plus `free_quizzes` and `recent_attempts`.
   - Fix `banners/route.ts`: return `action_type`, `action_value`, `order` alongside `target_type`, `target_id`.
   - Fix `courses/[id]/route.ts`: in lessons, provide `video_id`, `duration_minutes: number`, `folder_id`, `order`, `pdf_url`.
   - Fix `my-courses/route.ts`: when `courseIds.length === 0`, return empty array `[]` (not all courses).
   - Fix `checkout/route.ts`: return `amount` in Rupees (not paise), `item_name`, `user_email`, `user_phone`.
   - Fix `community/route.ts`: provide `author_id`, `author_name`, `author_avatar`, `like_count`, `reply_count`, `is_liked` alongside existing keys. Ensure like toggle updates database.
   - Fix `doubts/route.ts` & replies: provide `author_id`, `author_name`, `author_avatar`, `author_type`.
   - Fix `my-performance/route.ts`: provide `total_tests_attempted`, `total_questions_answered`, `overall_accuracy`, `overall_rank`, `score_trend`, `focus_areas`.
   - Fix `ebooks`, `resources`, `live`: align keys (`cover_url`, `page_count`, `file_size`, `instructor_name`, `subject`).
   - Fix `ai/chat`: provide `suggestions` array.
   - Add missing mobile endpoints: `/announcements`, `/notifications`, `/orders`, `/coupons/validate` under `/test-series/api/mobile/`.
4. Create comprehensive verification test suite `backend/tests/verify-mobile.ts`:
   - Test all 36 operations across 9 suites.
   - Assert deep schema fields, data types, and status codes.
   - Test security: assert 401 Unauthorized when token is missing on protected routes.
5. Verification commands:
   - Run `npx tsx tests/verify-mobile.ts` inside `backend/` and assert 100% pass rate.
   - Run `npm run build` inside `backend/` and assert exit code 0 with 0 TypeScript/ESLint errors.
6. Write detailed handoff report to `c:\Users\hp\Desktop\course app\.agents\teamwork\worker_m5_1\handoff.md`.
7. Send completion message back with verification results.
