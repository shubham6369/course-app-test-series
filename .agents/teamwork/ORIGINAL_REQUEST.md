# Original User Request

## Parameters
[skip-interview]
How this run was launched; not part of the task.

## Initial Request — 2026-11-01T17:33:18Z

ok proceed

Context:
The user has approved the implementation plan in `C:\Users\hp\.gemini\antigravity\brain\d6671959-57c7-47b0-8ff4-b04cee2e7b23\create_backend_and_admin_plan.md`.

Build the complete Next.js & TypeScript backend and matching Web Admin Dashboard inside `c:\Users\hp\Desktop\course app\backend`:
1. Clone the exact UI and features of `https://edu.d3vx.in/admin` (Webphiser Education System Admin):
   - Brand color palette (`--brand: #09214b;`, `--brand-light: #e0a028;`, `--brand-dark: #061432;`, radial gradient canvas)
   - Exact 24-section navigation tree:
     - Dashboard (`/admin`) with 14-day revenue analytics, KPI cards, recent doubts, recent sales, top courses
     - Courses & Curriculum (`/admin/courses`, `/admin/courses/new`) with multi-folder syllabus and video lesson editor
     - Quizzes (`/admin/quizzes`) with tabs (All, Series, Standalone, Free), CBT questions editor with positive/negative marking
     - Test Series (`/admin/test-series`)
     - Test Analytics (`/admin/test-analytics`)
     - Notes & Videos (`/admin/resources`)
     - E-Books (`/admin/ebooks`)
     - Live Classes (`/admin/live`)
     - Community Posts (`/admin/community`)
     - Doubts Desk (`/admin/doubts`) with status tabs (All, Open, Answered, Closed) and faculty reply thread
     - Video Comments (`/admin/comments`)
     - Students Directory (`/admin/students`)
     - Deletion Requests (`/admin/deletion-requests`)
     - Enrollments (`/admin/enrollments`)
     - Orders (`/admin/orders`) with Razorpay transaction receipts
     - Coupons (`/admin/coupons`)
     - AI Tutor (`/admin/ai`)
     - Banners (`/admin/banners`)
     - Notifications (`/admin/notifications`)
     - Announcements (`/admin/announcements`)
     - Settings (`/admin/settings`)
     - Team / Staff (`/admin/staff`)
     - Branding (`/admin/setup`)
     - Billing (`/admin/billing`)
   - Admin authentication (`/api/admin/auth/login`) setting HTTP-only `aim_admin` JWT cookie for `neerajkumarmahato740@gmail.com` / `123456!!` (Role: `owner`).
2. Implement all 31 mobile API endpoints matching `c:\Users\hp\Desktop\course app\lib\core\api_service.dart` under `/test-series/api/mobile/*`.
3. Configure Prisma ORM with SQLite for zero-setup local execution + Postgres compatibility, and create a comprehensive database seeder.
4. Verify through automated tests and build validation.

## Follow-up — 2026-11-01T17:43:50Z

The user has formally approved the implementation plan (create_backend_and_admin_plan.md). Please proceed through all milestones (M1 to M6) to build the complete Next.js backend, all 31 mobile API routes, database seeder, and the Webphiser 24-section Admin Dashboard.
