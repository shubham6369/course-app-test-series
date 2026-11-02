# Scope: Webphiser Backend API & Web Admin Dashboard (Gen 2 Orchestrator)

## Architecture
- **Framework**: Next.js 15 (App Router, TypeScript) inside `backend/`
- **Styling**: Tailwind CSS v4 with brand variables (`--brand: #09214b;`, `--brand-light: #e0a028;`, `--brand-dark: #061432;`)
- **Database & ORM**: Prisma ORM with SQLite (`prisma/dev.db`), compatible with PostgreSQL.
- **Admin System**: 24 sections fully implemented and verified (Milestones 1-4 completed).
- **Mobile API Contract**:
  - Base Route: `/test-series/api/mobile/*`
  - Client Reference: `c:\Users\hp\Desktop\course app\lib\core\api_service.dart` and `models.dart`
  - 36 Operations across 37 Route Handlers matching Flutter models and services.

## Feature Inventory
| # | Feature | Description | Milestone | Status |
|---|---------|-------------|-----------|--------|
| 1-4 | Milestones 1-4 Features | Project setup, Prisma DB & seeder, admin auth, 24 admin screens | M1-M4 | COMPLETED |
| 5 | Mobile Auth Endpoints | `/login`, `/register`, `/verify-otp`, `/resend-otp`, `/forgot-password`, `/reset-password` | M5 | COMPLETED |
| 6 | Mobile Home & Navigation | `/home-feed`, `/banners`, `/categories`, `/announcements`, `/notifications` | M5 | COMPLETED |
| 7 | Mobile Courses Endpoints | `/courses`, `/courses/:id`, `/my-courses` | M5 | COMPLETED |
| 8 | Mobile Test Series & Quizzes | `/test-series`, `/test-series/:id`, `/quizzes`, `/quizzes/:id`, `/quizzes/:id/submit`, `/quiz-attempts`, `/quiz-attempts/:id`, `/my-performance` | M5 | COMPLETED |
| 9 | Mobile Doubts & Community | `/doubts` (GET/POST), `/doubts/:id`, `/doubts/:id/reply`, `/community` (GET/POST), `/community/like`, `/community/:id/comment` | M5 | COMPLETED |
| 10 | Mobile Content, Ebooks & AI | `/resources`, `/ebooks`, `/live`, `/ai/chat` | M5 | COMPLETED |
| 11 | Mobile Profile & Orders | `/profile` (GET/PUT), `/orders`, `/checkout`, `/verify-payment`, `/coupons/validate` | M5 | COMPLETED |
| 12 | Automated Verification & Build | Full verification script `tests/verify-mobile.ts`, `npm run build`, seeder check | M6 | IN_PROGRESS |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1-M4 | Scaffold, Admin Auth & 24 Screens | Next.js 15, Prisma SQLite, Admin auth, Dashboard and all 24 admin pages | none | DONE |
| M5 | 31 Mobile API Endpoints | Implement all 31+ endpoints matching `api_service.dart` under `/test-series/api/mobile/*` | M1-M4 | DONE |
| M6 | Automated Verification & Build | Full verification run (`verify-mobile.ts`, `verify-m2`, `verify-m3`, `verify-m4`, `build`), Victory Claim | M5 | IN_PROGRESS |
