# Dispatch: Milestone 4 — Operations & Moderation Screens (All Remaining Admin Views)

## Working Directory
`c:\Users\hp\Desktop\course app\.agents\teamwork\worker_m4_1\`

## Objectives & Scope Boundaries
You own exclusively all remaining admin screens and their supporting API handlers:
- `backend/src/app/(admin)/admin/resources/page.tsx` (Notes & Videos)
- `backend/src/app/(admin)/admin/ebooks/page.tsx` (E-Books Library)
- `backend/src/app/(admin)/admin/live/page.tsx` (Live Classes Scheduler)
- `backend/src/app/(admin)/admin/community/page.tsx` (Community Posts Moderation)
- `backend/src/app/(admin)/admin/doubts/page.tsx` (Doubts Desk with Faculty Reply Thread)
- `backend/src/app/(admin)/admin/comments/page.tsx` (Video Lesson Comments)
- `backend/src/app/(admin)/admin/students/page.tsx` (Students Directory)
- `backend/src/app/(admin)/admin/deletion-requests/page.tsx` (Account Deletion Requests)
- `backend/src/app/(admin)/admin/enrollments/page.tsx` (Enrollments Manager)
- `backend/src/app/(admin)/admin/orders/page.tsx` (Orders & Razorpay Transaction Receipts)
- `backend/src/app/(admin)/admin/coupons/page.tsx` (Coupons & Discount Codes)
- `backend/src/app/(admin)/admin/ai/page.tsx` (AI Academic Tutor Configuration & Logs)
- `backend/src/app/(admin)/admin/banners/page.tsx` (Home Carousel Banners)
- `backend/src/app/(admin)/admin/notifications/page.tsx` (Push Notifications Broadcast)
- `backend/src/app/(admin)/admin/announcements/page.tsx` (Notice Board Announcements)
- `backend/src/app/(admin)/admin/settings/page.tsx` (Platform Settings)
- `backend/src/app/(admin)/admin/staff/page.tsx` (Team & Staff RBAC)
- `backend/src/app/(admin)/admin/setup/page.tsx` (Branding & Identity Setup)
- `backend/src/app/(admin)/admin/billing/page.tsx` (Billing & Invoices)
- Supporting API endpoints under `backend/src/app/api/admin/*` for doubt replies, coupon creation, banner toggling, student status, etc.

## Input Information
- Original Request: `c:\Users\hp\Desktop\course app\.agents\teamwork\ORIGINAL_REQUEST.md`
- Approved Plan: `C:\Users\hp\.gemini\antigravity\brain\d6671959-57c7-47b0-8ff4-b04cee2e7b23\create_backend_and_admin_plan.md`
- Explorer Handoff: `c:\Users\hp\Desktop\course app\.agents\teamwork\explorer_m1_1\handoff.md`
- Previous Worker Handoffs: `worker_m1_1/handoff.md`, `worker_m2_1/handoff.md`, `worker_m3_1/handoff.md`

## Instructions
1. Implement each of the 19 remaining admin views using real Prisma SQLite data:
   - Use Webphiser theme styling (`#09214b`, `#e0a028`, `#061432`).
   - Doubts desk (`/admin/doubts`): Include status tabs (`All`, `Open`, `Answered`, `Closed`), student query view with image attachments, and faculty reply editor supporting direct teacher answers and status toggling (`SOLVED`).
   - Orders (`/admin/orders`): Razorpay transaction receipts with status badges, order reference numbers, amount in INR, and receipt drawer/modal.
   - Students (`/admin/students`): Search by name, phone, email, display enrollment/attempt counts, and active toggle.
   - Banners (`/admin/banners`): Banner carousel list with active toggles and add banner modal.
   - Coupons (`/admin/coupons`): Create discount codes (`percentage` or `fixed`), set min order, validity, and active toggle.
   - AI Tutor (`/admin/ai`): System prompt editor, model parameters (temperature, maxTokens), and audit logs table.
   - All other screens (`resources`, `ebooks`, `live`, `community`, `comments`, `deletion-requests`, `enrollments`, `notifications`, `announcements`, `settings`, `staff`, `setup`, `billing`) with full features and authentic Prisma data.
2. Ensure every single one of the 24 routes in `admin-sidebar.tsx` resolves to a fully styled, functional page (zero 404s).
3. Create automated verification suite `backend/tests/verify-m4.ts` testing that all 24 admin routes render with HTTP 200 and authenticate via `aim_admin` session.
4. Verify with `npx tsc --noEmit` and `npm run build` in `backend/` (confirming all 24 admin routes compile cleanly into Next.js production build).
5. Deliver handoff report to `c:\Users\hp\Desktop\course app\.agents\teamwork\worker_m4_1\handoff.md`.

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.


## 2026-11-01T18:40:22Z
You are teamwork_worker (Fullstack Engineer).
Your working directory is: c:\Users\hp\Desktop\course app\.agents\teamwork\worker_m4_1\

Please read your instructions at:
- c:\Users\hp\Desktop\course app\.agents\teamwork\worker_m4_1\DISPATCH.md
- c:\Users\hp\Desktop\course app\.agents\teamwork\ORIGINAL_REQUEST.md
- C:\Users\hp\.gemini\antigravity\brain\d6671959-57c7-47b0-8ff4-b04cee2e7b23\create_backend_and_admin_plan.md
- c:\Users\hp\Desktop\course app\.agents\teamwork\worker_m3_1\handoff.md

Implement Milestone 4 (All remaining 19 Admin Operations & Moderation views) in c:\Users\hp\Desktop\course app\backend:
1. Resources (/admin/resources), E-Books (/admin/ebooks), Live Classes (/admin/live).
2. Community moderation (/admin/community), Doubts Desk with faculty reply thread (/admin/doubts), Video Comments (/admin/comments).
3. Students Directory (/admin/students), Deletion Requests (/admin/deletion-requests), Enrollments (/admin/enrollments).
4. Orders with Razorpay transaction receipts (/admin/orders), Coupons (/admin/coupons).
5. AI Tutor config & logs (/admin/ai), Banners (/admin/banners), Notifications (/admin/notifications), Announcements (/admin/announcements).
6. Platform Settings (/admin/settings), Team / Staff RBAC (/admin/staff), Branding Setup (/admin/setup), Billing (/admin/billing).
7. Supporting admin API endpoints for CRUD actions.
8. Verify that all 24 admin routes in the sidebar are 100% functional, pass tsc --noEmit, pass automated tests, and compile in npm run build.
9. Deliver handoff report to c:\Users\hp\Desktop\course app\.agents\teamwork\worker_m4_1\handoff.md.

MANDATORY INTEGRITY WARNING: DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

When finished, message me with your completion summary.
