# Dispatch: Milestone 1 — Next.js 15 Project Setup, Prisma Schema & Comprehensive Database Seeder

## Working Directory
`c:\Users\hp\Desktop\course app\.agents\teamwork\worker_m1_1\`

## Objectives & Scope Boundaries
You own exclusively:
- `c:\Users\hp\Desktop\course app\backend\` root configuration files:
  - `package.json`
  - `tsconfig.json`
  - `next.config.mjs`
  - `tailwind.config.ts`
  - `postcss.config.mjs`
  - `.env`
- `c:\Users\hp\Desktop\course app\backend\prisma\schema.prisma`
- `c:\Users\hp\Desktop\course app\backend\prisma\seed.ts`
- `c:\Users\hp\Desktop\course app\backend\src\lib\prisma.ts`

## Input Information
- Handoff from Explorer: `c:\Users\hp\Desktop\course app\.agents\teamwork\explorer_m1_1\handoff.md`
- Original Request: `c:\Users\hp\Desktop\course app\.agents\teamwork\ORIGINAL_REQUEST.md`
- Approved Plan: `C:\Users\hp\.gemini\antigravity\brain\d6671959-57c7-47b0-8ff4-b04cee2e7b23\create_backend_and_admin_plan.md`

## Instructions
1. Scaffold Next.js in `c:\Users\hp\Desktop\course app\backend`. Set up dependencies in `package.json`:
   - `next`, `react`, `react-dom`, `@types/react`, `@types/react-dom`, `typescript`, `tailwindcss`, `postcss`, `autoprefixer`, `lucide-react`, `prisma`, `@prisma/client`, `bcryptjs`, `@types/bcryptjs`, `jsonwebtoken`, `@types/jsonwebtoken`, `tsx`.
2. Configure `prisma/schema.prisma` using the exact 29-model SQLite schema from `explorer_m1_1/handoff.md § 3.1`.
3. Configure `src/lib/prisma.ts` as a singleton PrismaClient instance.
4. Run `npx prisma generate` and `npx prisma db push` to generate the client and SQLite database file `prisma/dev.db`.
5. Write `prisma/seed.ts` following `explorer_m1_1/handoff.md § 3.2`:
   - Admin: `neerajkumarmahato740@gmail.com` with password `123456!!` and role `owner` (store both hashed and plaintext or support bcrypt compare).
   - Student: Rahul Sharma (`id: 101`, phone `9876543210`, email `rahul.sharma@example.com`, token `mock_jwt_token_sample_user_123`).
   - Categories, Banners, Courses, Folders, Lessons, VideoComments, TestSeries, Quizzes, Questions (all 10 questions with options, positive marks +4, negative marks -1, correct options), Attempts, Doubts, DoubtReplies, CommunityPosts, Orders, Enrollments, Coupons, Ebooks, Resources, LiveClasses, AiConfig.
6. Run `npx tsx prisma/seed.ts` (or `npx prisma db seed`) and verify all records are inserted cleanly without errors.
7. Verify with a quick test script or query asserting the counts of seeded rows.
8. Document all commands run, build/seed results, and output paths in `c:\Users\hp\Desktop\course app\.agents\teamwork\worker_m1_1\handoff.md`.

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.


## 2026-11-01T17:41:16Z
From: a69b7b31-9839-48ab-8a6c-0734c00ac0c5
Message:
You are teamwork_worker (Fullstack Engineer).
Your working directory is: c:\Users\hp\Desktop\course app\.agents\teamwork\worker_m1_1\

Please read your instructions at:
- c:\Users\hp\Desktop\course app\.agents\teamwork\worker_m1_1\DISPATCH.md
- c:\Users\hp\Desktop\course app\.agents\teamwork\ORIGINAL_REQUEST.md
- c:\Users\hp\Desktop\course app\.agents\teamwork\explorer_m1_1\handoff.md
- C:\Users\hp\.gemini\antigravity\brain\d6671959-57c7-47b0-8ff4-b04cee2e7b23\create_backend_and_admin_plan.md

Implement Milestone 1 in c:\Users\hp\Desktop\course app\backend:
1. Scaffold package.json, tsconfig.json, next.config.mjs, tailwind.config.ts, postcss.config.mjs, .env.
2. Install dependencies (next, react, react-dom, @prisma/client, prisma, bcryptjs, jsonwebtoken, lucide-react, tsx, etc.).
3. Write prisma/schema.prisma (29 entities for SQLite per explorer handoff).
4. Run prisma generate and prisma db push.
5. Create src/lib/prisma.ts.
6. Write comprehensive prisma/seed.ts with default admin neerajkumarmahato740@gmail.com / 123456!! / owner, student Rahul Sharma, courses, quizzes, questions, etc.
7. Run the seed script and verify the SQLite database is populated.
8. Document all steps, commands, and verification in c:\Users\hp\Desktop\course app\.agents\teamwork\worker_m1_1\handoff.md.

MANDATORY INTEGRITY WARNING: DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

When finished, message me with your completion summary.
