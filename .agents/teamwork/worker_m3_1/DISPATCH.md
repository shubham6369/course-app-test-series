# Dispatch: Milestone 3 — Core Admin Management Screens

## Working Directory
`c:\Users\hp\Desktop\course app\.agents\teamwork\worker_m3_1\`

## Objectives & Scope Boundaries
You own exclusively:
- `backend/src/app/(admin)/admin/page.tsx` (Dashboard with 14-day revenue analytics, KPI cards, recent doubts, recent sales, top courses)
- `backend/src/app/(admin)/admin/courses/page.tsx` (Courses list & curriculum overview)
- `backend/src/app/(admin)/admin/courses/new/page.tsx` (Course builder with multi-folder syllabus and video lesson editor)
- `backend/src/app/(admin)/admin/quizzes/page.tsx` (Quizzes directory with tabs: All, Series, Standalone, Free, and CBT question editor)
- `backend/src/app/(admin)/admin/test-series/page.tsx` (Test series packages and bundle manager)
- `backend/src/app/(admin)/admin/test-analytics/page.tsx` (Platform test analytics, score distributions, and leaderboards)
- Any supporting components in `backend/src/components/admin/` (e.g. `kpi-card.tsx`, `revenue-chart.tsx`, `cbt-question-editor.tsx`, `syllabus-builder.tsx`)
- Associated API endpoints for admin CRUD if needed (`backend/src/app/api/admin/courses/route.ts`, `backend/src/app/api/admin/quizzes/route.ts`, etc.)

## Input Information
- Original Request: `c:\Users\hp\Desktop\course app\.agents\teamwork\ORIGINAL_REQUEST.md`
- Approved Plan: `C:\Users\hp\.gemini\antigravity\brain\d6671959-57c7-47b0-8ff4-b04cee2e7b23\create_backend_and_admin_plan.md`
- Explorer Handoff: `c:\Users\hp\Desktop\course app\.agents\teamwork\explorer_m1_1\handoff.md`
- M1 & M2 Handoffs: `c:\Users\hp\Desktop\course app\.agents\teamwork\worker_m1_1\handoff.md`, `worker_m2_1\handoff.md`

## Instructions
1. Implement the Main Dashboard (`/admin` / `src/app/(admin)/admin/page.tsx`):
   - Fetch real metrics from Prisma: Total active students, total attempts, open doubts count, monthly revenue.
   - Interactive or styled SVG 14-day revenue trends chart matching Webphiser theme (`#09214b`, `#e0a028`).
   - Recent Doubts table with status badges (`OPEN`, `ANSWERED`).
   - Recent Sales table with Razorpay payment details and badges (`PAID`, `PENDING`).
   - Top Courses list with enrollment counts and ratings.
2. Implement Courses & Curriculum (`/admin/courses`):
   - Shows all seeded courses, folders, and lessons count, price badges, and active status.
   - `+ New Course` button navigating to `/admin/courses/new`.
3. Implement Course & Syllabus Builder (`/admin/courses/new`):
   - Metadata inputs: title, slug, description, category selector, price, discount price, instructor, validity.
   - Multi-folder curriculum builder: Add/Remove Folder -> Add/Remove Lesson within folder (title, video ID/URL, duration minutes, Free preview toggle).
   - Save handler creating Course, CourseFolder, and Lesson in Prisma.
4. Implement Quizzes (`/admin/quizzes`):
   - Filter tabs: `All`, `In a Series`, `Standalone`, `Free Quizzes`.
   - List quizzes with duration, total marks, positive/negative marking rules, question count.
   - Question Editor modal or accordion: Statement, 4 options, correct answer key, marks (+4), negative marks (-1), explanation.
5. Implement Test Series (`/admin/test-series`):
   - View test series packages, category, price, discount price, enrolled students, attached quizzes count, and Add/Edit capability.
6. Implement Test Analytics (`/admin/test-analytics`):
   - Platform exam statistics: Average accuracy, total participants, pass rate, score range distribution, top rankers list.
7. Verify all screens render authentic data from Prisma.
8. Run `npx tsc --noEmit` and `npm run build` in `backend/` to verify zero build/type errors.
9. Deliver handoff report to `c:\Users\hp\Desktop\course app\.agents\teamwork\worker_m3_1\handoff.md`.

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.


## 2026-11-01T18:18:00Z
[Message] timestamp=2026-11-01T18:18:00Z sender=a69b7b31-9839-48ab-8a6c-0734c00ac0c5 priority=MESSAGE_PRIORITY_HIGH content=You are teamwork_worker (Frontend/Fullstack Engineer).
Your working directory is: c:\Users\hp\Desktop\course app\.agents\teamwork\worker_m3_1\

Please read your instructions at:
- c:\Users\hp\Desktop\course app\.agents\teamwork\worker_m3_1\DISPATCH.md
- c:\Users\hp\Desktop\course app\.agents\teamwork\ORIGINAL_REQUEST.md
- C:\Users\hp\.gemini\antigravity\brain\d6671959-57c7-47b0-8ff4-b04cee2e7b23\create_backend_and_admin_plan.md
- c:\Users\hp\Desktop\course app\.agents\teamwork\worker_m2_1\handoff.md

Implement Milestone 3 (Core Admin Management Screens) in c:\Users\hp\Desktop\course app\backend:
1. Main Dashboard (/admin): 14-day revenue analytics chart, 4 KPI cards (Total Students, Attempts, Open Doubts, Revenue), recent doubts table, recent sales table, top courses.
2. Courses & Curriculum (/admin/courses): Courses catalog with price badges, syllabus summary, active status.
3. Course Builder (/admin/courses/new): Course metadata, multi-folder syllabus builder, video lesson editor with free preview toggle, Prisma persistence.
4. Quizzes & CBT Builder (/admin/quizzes): Tabs (All, Series, Standalone, Free), quiz question editor with 4 options, +/- marking (+4/-1), explanation.
5. Test Series (/admin/test-series): Test series package manager with pricing and quiz attachments.
6. Test Analytics (/admin/test-analytics): Exam metrics, score distribution, accuracy averages, leaderboard.
7. Run verification test script, npx tsc --noEmit, and npm run build.
8. Deliver handoff report to c:\Users\hp\Desktop\course app\.agents\teamwork\worker_m3_1\handoff.md.

MANDATORY INTEGRITY WARNING: DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

When finished, message me with your completion summary.
