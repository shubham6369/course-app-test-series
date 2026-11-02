# Scope: Next.js Backend & Web Admin Dashboard Clone

## Architecture
- **Framework**: Next.js 15 (App Router with TypeScript)
- **Styling**: Tailwind CSS v4 with custom design tokens:
  - `--brand`: `#09214b`
  - `--brand-light`: `#e0a028`
  - `--brand-dark`: `#061432`
  - Radial gradient backgrounds
- **ORM & DB**: Prisma ORM with SQLite (and PostgreSQL schema compatibility)
- **Auth**:
  - Admin: `aim_admin` HTTP-only JWT cookie, role-based (`owner`, `admin`, `staff`)
  - Mobile: Bearer token auth
- **Locations**:
  - Web Admin: `/admin/*`
  - Admin Auth: `/api/admin/auth/*`
  - Mobile API: `/test-series/api/mobile/*`
  - Static Seed / Assets: `prisma/seed.ts`, `prisma/schema.prisma`

## Feature Inventory
| # | Feature | Description | Milestone |
|---|---------|-------------|-----------|
| 1 | Next.js & Tailwind Scaffolding | Next.js 15 with App router, Tailwind CSS, Lucide icons, PostCSS | M1 |
| 2 | Prisma ORM Schema & Migrations | Complete schema for Students, Admins, Courses, Quizzes, Doubts, Orders, etc. | M1 |
| 3 | Database Seeder | Seeder with default admin (`neerajkumarmahato740@gmail.com` / `123456!!`), demo courses, quizzes, doubts | M1 |
| 4 | Admin Auth & Middleware | Login route `/api/admin/auth/login`, logout, `aim_admin` JWT cookie, route protection | M2 |
| 5 | Admin Shell & 24-Item Navigation | Sidebar matching live `/admin`, header with user profile, breadcrumbs, brand styling | M2 |
| 6 | Dashboard Screen | `/admin` with 14-day revenue chart, KPI cards, recent doubts, recent sales, top courses | M3 |
| 7 | Courses & Curriculum Manager | `/admin/courses`, `/admin/courses/new` with multi-folder syllabus and video lesson editor | M3 |
| 8 | Quizzes & CBT Builder | `/admin/quizzes` with tabs (All, Series, Standalone, Free), question editor with +/- marking | M3 |
| 9 | Test Series & Test Analytics | `/admin/test-series`, `/admin/test-analytics` with attempt metrics | M3 |
| 10 | Content & Resources Screens | `/admin/resources`, `/admin/ebooks`, `/admin/live`, `/admin/comments` | M4 |
| 11 | Doubts Desk & Community Moderation | `/admin/doubts` (faculty reply thread, status tabs), `/admin/community` | M4 |
| 12 | Students & Commerce Operations | `/admin/students`, `/admin/deletion-requests`, `/admin/enrollments`, `/admin/orders`, `/admin/coupons` | M4 |
| 13 | AI, Engagement & Settings | `/admin/ai`, `/admin/banners`, `/admin/notifications`, `/admin/announcements`, `/admin/settings`, `/admin/staff`, `/admin/setup`, `/admin/billing` | M4 |
| 14 | 31 Mobile API Endpoints | Complete `/test-series/api/mobile/*` endpoints matching Flutter `api_service.dart` | M5 |
| 15 | Automated Testing & Build Validation | End-to-end tests for admin APIs, mobile APIs, and `npm run build` validation | M6 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Setup & Database | Next.js 15 app, Prisma schema with SQLite, seeder script, package.json dependencies | none | DONE |
| M2 | Auth & Shell Layout | Admin login page, auth API (`aim_admin` cookie), 24-item sidebar navigation shell | M1 | DONE |
| M3 | Core Management Screens | Dashboard, Courses, Quizzes, Test Series, Analytics | M2 | DONE |
| M4 | Operations & Settings Screens | Doubts, Community, Students, Orders, Coupons, AI, Banners, Settings (all remaining admin screens) | M2 | IN_PROGRESS |
| M5 | Mobile API Endpoints | All 31 mobile endpoints under `/test-series/api/mobile/*` | M1 | PENDING |
| M6 | Test Suite & Build Verification | Automated tests for routes, validation of build output | M3, M4, M5 | PENDING |
