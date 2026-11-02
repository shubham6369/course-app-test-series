# Dispatch: Milestone 2 — Admin Auth & 24-Section Shell Layout

## Working Directory
`c:\Users\hp\Desktop\course app\.agents\teamwork\worker_m2_1\`

## Objectives & Scope Boundaries
You own exclusively:
- `backend/src/lib/auth.ts`
- `backend/src/app/api/admin/auth/login/route.ts`
- `backend/src/app/api/admin/auth/logout/route.ts`
- `backend/src/app/api/admin/auth/me/route.ts`
- `backend/src/middleware.ts`
- `backend/src/app/globals.css`
- `backend/src/app/layout.tsx`
- `backend/src/app/(admin)/admin/layout.tsx`
- `backend/src/app/(admin)/admin/login/page.tsx`
- `backend/src/components/admin-sidebar.tsx`
- `backend/src/components/admin-header.tsx`

## Input Information
- Original Request: `c:\Users\hp\Desktop\course app\.agents\teamwork\ORIGINAL_REQUEST.md`
- Approved Plan: `C:\Users\hp\.gemini\antigravity\brain\d6671959-57c7-47b0-8ff4-b04cee2e7b23\create_backend_and_admin_plan.md`
- Explorer Handoff: `c:\Users\hp\Desktop\course app\.agents\teamwork\explorer_m1_1\handoff.md`
- Worker M1 Handoff: `c:\Users\hp\Desktop\course app\.agents\teamwork\worker_m1_1\handoff.md`

## Instructions
1. Implement `src/lib/auth.ts`:
   - JWT signing and verification for admin tokens.
   - Cookie name: `aim_admin`, HTTP-only, Path `/`, SameSite `lax`, MaxAge 7 days.
2. Implement admin auth routes:
   - `src/app/api/admin/auth/login/route.ts`:
     - Reads email and password.
     - Compares bcrypt password against `Admin` table via Prisma.
     - Sets `aim_admin` cookie with JWT payload `{ id, email, name, role }`.
     - Returns `{ status: "success", user }`.
   - `src/app/api/admin/auth/logout/route.ts`:
     - Deletes `aim_admin` cookie, returns `{ status: "success" }`.
   - `src/app/api/admin/auth/me/route.ts`:
     - Returns authenticated admin profile from `aim_admin` cookie.
3. Implement `src/middleware.ts`:
   - Intercepts `/admin/*` (except `/admin/login` and static assets).
   - If `aim_admin` cookie is absent or invalid, redirects to `/admin/login`.
4. Implement `src/app/(admin)/admin/login/page.tsx`:
   - Exact Webphiser login page clone:
     - Brand color styling: Primary `#09214b`, Accent Gold `#e0a028`, Dark `#061432`.
     - Radial gradient ambient background.
     - Clean, responsive card with email, password, error message display, submit button, and credentials badge (`neerajkumarmahato740@gmail.com` / `123456!!`).
5. Implement `src/components/admin-sidebar.tsx`:
   - Exact 24-section navigation tree matching Webphiser:
     1. Dashboard (`/admin`)
     2. Courses & Curriculum (`/admin/courses`)
     3. Quizzes (`/admin/quizzes`)
     4. Test Series (`/admin/test-series`)
     5. Test Analytics (`/admin/test-analytics`)
     6. Notes & Videos (`/admin/resources`)
     7. E-Books (`/admin/ebooks`)
     8. Live Classes (`/admin/live`)
     9. Community Posts (`/admin/community`)
     10. Doubts Desk (`/admin/doubts`)
     11. Video Comments (`/admin/comments`)
     12. Students Directory (`/admin/students`)
     13. Deletion Requests (`/admin/deletion-requests`)
     14. Enrollments (`/admin/enrollments`)
     15. Orders (`/admin/orders`)
     16. Coupons (`/admin/coupons`)
     17. AI Tutor (`/admin/ai`)
     18. Banners (`/admin/banners`)
     19. Notifications (`/admin/notifications`)
     20. Announcements (`/admin/announcements`)
     21. Settings (`/admin/settings`)
     22. Team / Staff (`/admin/staff`)
     23. Branding (`/admin/setup`)
     24. Billing (`/admin/billing`)
   - Active route highlighting using `usePathname()`, collapsible or cleanly grouped sections with Lucide icons.
6. Implement `src/components/admin-header.tsx`:
   - Webphiser branded top bar, breadcrumb or section title, notifications indicator, admin user chip (`Neeraj Kumar Mahato` / `owner`), and logout button.
7. Implement `src/app/(admin)/admin/layout.tsx`:
   - Integrates sidebar and header, wraps children in the branded ambient canvas.
8. Implement verification tests in a test script (e.g. `tests/auth.test.ts` or `prisma/test-auth.ts`) testing login, cookie extraction, JWT verification, and unauthorized rejection.
9. Verify with `npx tsc --noEmit` and run your verification script.
10. Write complete handoff to `c:\Users\hp\Desktop\course app\.agents\teamwork\worker_m2_1\handoff.md`.

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.


## 2026-11-01T17:58:15Z
[Message] timestamp=2026-11-01T17:58:15Z sender=a69b7b31-9839-48ab-8a6c-0734c00ac0c5 priority=MESSAGE_PRIORITY_HIGH content=You are teamwork_worker (Frontend/Auth Engineer).
Your working directory is: c:\Users\hp\Desktop\course app\.agents\teamwork\worker_m2_1\

Please read your instructions at:
- c:\Users\hp\Desktop\course app\.agents\teamwork\worker_m2_1\DISPATCH.md
- c:\Users\hp\Desktop\course app\.agents\teamwork\ORIGINAL_REQUEST.md
- C:\Users\hp\.gemini\antigravity\brain\d6671959-57c7-47b0-8ff4-b04cee2e7b23\create_backend_and_admin_plan.md
- c:\Users\hp\Desktop\course app\.agents\teamwork\worker_m1_1\handoff.md

Implement Milestone 2 in c:\Users\hp\Desktop\course app\backend:
1. Implement auth utility in src/lib/auth.ts (JWT aim_admin cookie signing, verification, cookie options).
2. Implement admin auth APIs: /api/admin/auth/login, /api/admin/auth/logout, /api/admin/auth/me with bcrypt password comparison against Prisma Admin table.
3. Implement Next.js route middleware (src/middleware.ts) protecting /admin/* with redirect to /admin/login.
4. Implement pixel-accurate Webphiser login page (src/app/(admin)/admin/login/page.tsx) with brand colors (#09214b, #e0a028, #061432) and radial gradient canvas.
5. Implement admin layout (src/app/(admin)/admin/layout.tsx), sidebar with exact 24 navigation items (src/components/admin-sidebar.tsx), and header (src/components/admin-header.tsx).
6. Implement globals.css with complete brand variables and ambient background styling.
7. Run validation script and tsc --noEmit.
8. Deliver handoff report to c:\Users\hp\Desktop\course app\.agents\teamwork\worker_m2_1\handoff.md.

MANDATORY INTEGRITY WARNING: DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

When finished, message me with your completion summary.
