# Milestone 5 Mobile API Integration & Architecture Blueprint

**Author**: `explorer_m5_3` (Mobile API Integration & Architecture Strategist)  
**Target Recipient**: `orchestrator_gen2` / `worker_m5`  
**Scope**: 31+ Mobile API Endpoints under Next.js 15 App Router (`/test-series/api/mobile/*`)  
**Reference Files**:
- Flutter Client: `c:\Users\hp\Desktop\course app\lib\core\api_service.dart`, `lib\core\api_client.dart`, `lib\models\models.dart`
- Backend Core: `c:\Users\hp\Desktop\course app\backend\src\lib\auth.ts`, `backend\src\lib\api-response.ts`, `backend\src\lib\prisma.ts`
- Middleware: `c:\Users\hp\Desktop\course app\backend\src\middleware.ts`
- Routes: `c:\Users\hp\Desktop\course app\backend\src\app\test-series\api\mobile\`

---

## 1. Observation

### 1.1 Backend Core Libraries (`backend/src/lib/`)
Direct observation of the backend libraries revealed the following structures:

1. **`backend/src/lib/prisma.ts` (lines 1-16)**:
   - Exports singleton `prisma` instance of `PrismaClient` with global caching in development.
   - Connected to SQLite at `prisma/dev.db`.
2. **`backend/src/lib/auth.ts` (lines 113-155)**:
   - Provides student token signing:
     ```ts
     export async function signStudentToken(payload: { id: number; phone: string; email?: string | null; name: string }): Promise<string>
     ```
     Generates HS256 signed JWT via `jose` library with 30-day expiration (`setExpirationTime('30d')`).
   - Provides student token verification:
     ```ts
     export async function verifyStudentToken(token: string): Promise<StudentJwtPayload | null>
     ```
   - Provides header extraction:
     ```ts
     export function extractBearerToken(request: Request | NextRequest): string | null
     ```
     Parses `Authorization: Bearer <token>`.
   - **Gap Observed**: There is currently no unified `getStudentFromBearer(req, options)` helper. Consequently, route handlers replicate token extraction manually, fail to look up student records from the database, and fall back to hardcoded `studentId = 1` when unauthenticated.
3. **`backend/src/lib/api-response.ts` (lines 1-22)**:
   - Provides `mobileSuccess(data, init?: { status?: number; extra?: Record<string, any> })` which wraps payloads into `{ status: 'success', data, ...(extra || {}) }`.
   - Provides `mobileError(message: string, status = 400, details?: any)`.
   - **Gap Observed**: Most route handlers do not import these functions and instead construct ad-hoc `NextResponse.json(...)`. Helper lacks standard shortcuts for `401 Unauthorized`, `404 Not Found`, and pagination wrappers.

### 1.2 Next.js 15 Middleware (`backend/src/middleware.ts`)
Direct observation of `backend/src/middleware.ts` lines 47-49:
```ts
export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
```
- The middleware explicitly matches **only** `/admin` and `/admin/:path*`.
- Routes under `/test-series/api/mobile/*` are completely bypassed by this middleware.
- **Architectural implication**: Next.js 15 Edge middleware is NOT intercepting mobile API requests, avoiding Edge runtime incompatibilities with Prisma ORM. Mobile Bearer authentication must be handled directly within Route Handlers via Node.js runtime helpers.

### 1.3 Discrepancies Between Existing Routes and Flutter Client Models (`models.dart`)
Comparing `c:\Users\hp\Desktop\course app\lib\models\models.dart` and `c:\Users\hp\Desktop\course app\lib\core\api_service.dart` against the current route files in `backend/src/app/test-series/api/mobile/` reveals critical contract mismatches:

| Endpoint | Current Route Implementation | Flutter `models.dart` Expectation | Severity / Bug Impact |
|---|---|---|---|
| **`/home-feed`** (`route.ts:56-64`) | Returns `{ featured_courses, popular_test_series }`. Omits `free_quizzes`, `recent_attempts`. Banner has `action_url`, `target_type`, `target_id`. | `HomeFeed.fromJson` expects `popular_courses`, `featured_test_series`, `free_quizzes`, `recent_attempts`. `BannerItem` expects `action_type`, `action_value`, `order`. | **Critical**: Flutter crashes or renders empty home sections. |
| **`/quizzes/:id`** (`route.ts:22-50`) | Returns questions with `correct_answer`, `positive_marks`, `question_image`, boolean `negative_marking`. Omits `question_number`, `instructions`. | `QuizPaper.fromJson` expects `negative_marks: double`, `instructions: List<String>`. `QuizQuestion` expects `correct_option`, `marks`, `negative_marks`, `question_image_url`, `question_number`. | **Critical**: Question options, marks, and question numbers load as 0/null in CBT runner. |
| **`/quizzes/:id/submit`** (`route.ts:68-80`) | Returns `{ id, score, wrong_answers, unanswered }`. | `QuizResult.fromJson` expects `{ attempt_id, quiz_title, total_marks, correct_answers, incorrect_answers, unattempted, accuracy, rank, total_participants, percentile, is_passed, certificate_url }`. | **Critical**: Quiz completion dialog throws TypeError on missing `attempt_id` and `quiz_title`. |
| **`/quiz-attempts/:id`** (`route.ts:57-76`) | Returns `{ result: { id, wrong_answers }, questions: [ { id, user_answer } ] }`. Flat question review. | Dart `getQuizResult` parses `result: QuizResult` and `questions: List<QuestionReview>` where each element expects `{ question: QuizQuestion, selected_option, is_correct, time_spent_seconds, marked_for_review }`. | **Critical**: Dart attempts `QuestionReview.fromJson(e)` which reads `e['question'] as Map` -> crashes with `TypeError: null is not a subtype of type Map`. |
| **`/my-performance`** (`route.ts:28-34`) | Returns `{ total_tests_attempted, average_score, accuracy_percentage, overall_rank, score_history }`. | `TestAnalytics.fromJson` expects `{ total_tests_attempted, total_questions_answered, overall_accuracy, overall_rank, score_trend: List<ScorePoint>, focus_areas: List<FocusArea> }`. | **Critical**: Dart crashes accessing `json['score_trend']` and `json['focus_areas']`. |
| **`/doubts` & `/doubts/:id/reply`** (`route.ts:32-38`, `reply/route.ts:53-60`) | Reply objects return `{ id, user_name, is_teacher, message }`. | `DoubtReply.fromJson` expects `{ id, doubt_id, author_id, author_name, author_avatar, author_type, message, image_url, created_at }`. | **High**: Faculty reply author names display empty string `""`. |
| **`/community`** (`route.ts:15-26`) | Returns `{ student_id, student_name, student_avatar, likes_count, comments_count }`. | `CommunityPost.fromJson` expects `{ author_id, author_name, author_avatar, like_count, reply_count, is_liked, content, image_url, created_at }`. | **High**: Author names and like counts show as 0/null. |
| **`/checkout`** (`route.ts:48-55`) | Omits `item_name`, `user_email`, `user_phone` from returned `data`. | `CheckoutSession.fromJson` expects `item_name`, `user_email`, `user_phone`. | **Medium**: Razorpay checkout modal opens with blank item description. |
| **`/ebooks`** (`route.ts:7-14`) | Returns `{ thumbnail_url, pages_count }`. Omits `cover_url`, `page_count`, `file_size`, `description`, `is_free`. | `Ebook.fromJson` expects `cover_url`, `page_count`, `file_size`, `description`, `is_free`. | **Medium**: Book cover images and page count not visible. |
| **`/resources`** (`route.ts:7-13`) | Returns `{ file_type }`. Omits `type`, `created_at`. | `Resource.fromJson` expects `type`, `created_at`. | **Low**: Resource file type filtering fails. |
| **`/live`** (`route.ts:9-16`) | Returns `{ instructor }`. Omits `subject`, `instructor_name`, `thumbnail_url`, `duration_minutes`. | `LiveClass.fromJson` expects `subject`, `instructor_name`, `thumbnail_url`, `duration_minutes`. | **Medium**: Instructor and duration missing on live schedule card. |
| **`/ai/chat`** (`route.ts:19-23`) | Returns `{ message, timestamp }`. Omits `suggestions`. | `AiReply.fromJson` expects `{ message, suggestions: List<String> }`. | **Low/Medium**: Suggestion chips absent in AI chat. |

### 1.4 Seeder & Test Data Coverage
Direct observation of `backend/prisma/seed.ts` (lines 56-141) and `backend/tests/verify-mobile-api.ts`:
- Seeded student exists: Rahul Sharma (id: `101`, phone: `'9876543210'`, email: `'rahul.sharma@example.com'`, password hash for `'password123'`, mock token: `'mock_jwt_token_sample_user_123'`).
- Seeded courses, syllabus folders, lessons, test series, CBT quizzes, questions with correct options and explanations, doubts with faculty replies, community posts, banners, categories, ebooks, resources, and live classes all exist in SQLite.

---

## 2. Logic Chain

### Step 1: Why a Dedicated Mobile Auth Helper (`getStudentFromBearer`) is Essential
- *Premise*: Next.js 15 route handlers execute in the Node.js runtime and receive `NextRequest`.
- *Observation*: Multiple routes (`/profile`, `/my-courses`, `/doubts`, `/quizzes/:id/submit`, `/checkout`, `/community`) require student authentication.
- *Issue*: Some routes require strict authentication (e.g. `/my-courses`, `/checkout`, `/profile` PUT), returning 401 if unauthenticated. Other routes allow optional authentication (e.g. `/courses`, `/home-feed`, `/doubts` GET), where knowing the student identity allows personalized flags like `is_enrolled` or `is_liked`, but unauthenticated guests may still view content.
- *Solution*: A centralized helper `getStudentFromBearer(req, options)` should support:
  1. Header extraction (`Authorization: Bearer <token>`).
  2. Real JWT verification via `verifyStudentToken(token)`.
  3. Seamless mock token fallback via `prisma.student.findFirst({ where: { token } })` to support Flutter offline mock tokens and test fixtures.
  4. Active status validation (`student.isActive`).
  5. Strict 401 generation when `options.required === true`.

### Step 2: Superset Response Envelope Strategy
- *Observation*: Some callers (and test scripts) look for `data.user` or `user`, while others look for `data` or `data.data`.
  For example, in `api_service.dart:28`: `final userJson = data['user'] ?? data['data'];`.
  In `api_service.dart:340`: `likePost` returns `data['status'] == 'success'`, while `api_client.dart:329` returns `{ liked: true, like_count: 43 }`.
- *Deduction*: By returning **superset envelopes** containing both camelCase/snake_case aliases and dual root keys:
  - Auth responses return: `{ status: 'success', token, user: studentObj, data: studentObj }`.
  - Like responses return: `{ status: 'success', liked, like_count, likes_count: like_count }`.
  - Model responses provide both primary keys (`author_id` and `student_id`, `author_name` and `student_name`, `like_count` and `likes_count`).
- *Result*: Zero breaking changes for existing code, while achieving 100% compliance with Flutter `models.dart`.

### Step 3: Exact Schema Transformations in CBT Quiz & Review
- *Observation*: `QuizPaper` and `QuestionReview` in `models.dart` have exact JSON typing:
  - `QuizPaper` requires `questions: List<QuizQuestion>` where each question has `question_number`, `question_text`, `options: List<String>`, `correct_option: int`, `marks: double`, `negative_marks: double`, `explanation: String`.
  - `quizzes/:id/submit` must return `QuizResult`: `{ attempt_id, quiz_id, quiz_title, score, total_marks, correct_answers, incorrect_answers, unattempted, accuracy, time_taken_seconds, rank, total_participants, percentile, is_passed, certificate_url }`.
  - `quiz-attempts/:id` must return `{ result: QuizResult, questions: List<QuestionReview> }` where each review item is `{ question: QuizQuestion, selected_option: int?, is_correct: bool, time_spent_seconds: int, marked_for_review: bool }`.
- *Action*: Route handlers must explicitly map database records into these exact shapes, parsing JSON strings for `question.options` and `attempt.answers`.

### Step 4: Verification Strategy
- *Observation*: `backend/tests/verify-mobile-api.ts` currently exists, but only checks 20 actions and skips strict field assertions. `backend/tests/verify-mobile.ts` is required by the project specifications to test all 31 endpoints.
- *Strategy*: Build `backend/tests/verify-mobile.ts` importing route handlers directly into a high-speed in-memory test runner. Test all 36 operations (covering all 31+ methods) across 9 test suites, validating HTTP status codes, error handling, Bearer auth, and strict model schema fields.

---

## 3. Architecture Blueprint for Milestone 5

### 3.1 Route Directory Layout
All mobile endpoints are situated under `c:\Users\hp\Desktop\course app\backend\src\app\test-series\api\mobile\`:

```
backend/src/app/test-series/api/mobile/
├── ai/
│   └── chat/
│       └── route.ts                      # POST /ai/chat
├── auth/
│   ├── forgot-password/
│   │   └── route.ts                      # POST /auth/forgot-password
│   ├── login/
│   │   └── route.ts                      # POST /auth/login
│   ├── register/
│   │   └── route.ts                      # POST /auth/register
│   ├── reset-password/
│   │   └── route.ts                      # POST /auth/reset-password
│   └── signup/
│       ├── send-otp/
│       │   └── route.ts                  # POST /auth/signup/send-otp
│       └── verify/
│           └── route.ts                  # POST /auth/signup/verify
├── banners/
│   └── route.ts                          # GET /banners
├── categories/
│   └── route.ts                          # GET /categories
├── checkout/
│   └── route.ts                          # POST /checkout
├── community/
│   ├── [id]/
│   │   └── comment/
│   │       └── route.ts                  # POST /community/[id]/comment
│   ├── like/
│   │   └── route.ts                      # POST /community/like
│   └── route.ts                          # GET, POST /community
├── courses/
│   ├── [id]/
│   │   └── route.ts                      # GET /courses/[id]
│   └── route.ts                          # GET /courses
├── doubts/
│   ├── [id]/
│   │   ├── reply/
│   │   │   └── route.ts                  # POST /doubts/[id]/reply
│   │   └── route.ts                      # GET /doubts/[id]
│   └── route.ts                          # GET, POST /doubts
├── ebooks/
│   └── route.ts                          # GET /ebooks
├── home-feed/
│   └── route.ts                          # GET /home-feed
├── live/
│   └── route.ts                          # GET /live
├── my-courses/
│   └── route.ts                          # GET /my-courses
├── my-performance/
│   └── route.ts                          # GET /my-performance
├── profile/
│   └── route.ts                          # GET, PUT /profile
├── quiz-attempts/
│   ├── [id]/
│   │   └── route.ts                      # GET /quiz-attempts/[id]
│   └── route.ts                          # GET /quiz-attempts
├── quizzes/
│   ├── [id]/
│   │   ├── submit/
│   │   │   └── route.ts                  # POST /quizzes/[id]/submit
│   │   └── route.ts                      # GET /quizzes/[id]
│   └── route.ts                          # GET /quizzes
├── resources/
│   └── route.ts                          # GET /resources
├── test-series/
│   ├── [id]/
│   │   └── route.ts                      # GET /test-series/[id]
│   └── route.ts                          # GET /test-series
└── verify-payment/
    └── route.ts                          # POST /verify-payment
```

### 3.2 Common Helper Specification: `src/lib/mobile-auth.ts`
Create `c:\Users\hp\Desktop\course app\backend\src\lib\mobile-auth.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { extractBearerToken, verifyStudentToken } from '@/lib/auth';
import { mobileError } from '@/lib/api-response';
import type { Student } from '@prisma/client';

export interface GetStudentOptions {
  required?: boolean;
  fallbackId?: number;
}

export interface StudentAuthResult {
  student: Student | null;
  errorResponse: NextResponse | null;
}

/**
 * Resolves authenticated student from Bearer JWT token or mock token string.
 * Enforces 401 Unauthorized if required=true and token is missing/invalid.
 */
export async function getStudentFromBearer(
  req: NextRequest | Request,
  options: GetStudentOptions = {}
): Promise<StudentAuthResult> {
  const token = extractBearerToken(req);

  if (!token) {
    if (options.required) {
      return {
        student: null,
        errorResponse: mobileError('Authentication required. Missing Bearer token.', 401),
      };
    }
    if (options.fallbackId) {
      const fallback = await prisma.student.findUnique({ where: { id: options.fallbackId } });
      return { student: fallback, errorResponse: null };
    }
    return { student: null, errorResponse: null };
  }

  // 1. Attempt JWT verification
  let studentId: number | null = null;
  const payload = await verifyStudentToken(token);
  if (payload?.id) {
    studentId = payload.id;
  }

  // 2. Fetch student by verified JWT id
  if (studentId) {
    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (student && student.isActive !== false) {
      return { student, errorResponse: null };
    }
  }

  // 3. Fallback: check if token matches seeded mock token (e.g. mock_jwt_token_sample_user_123)
  const studentByToken = await prisma.student.findFirst({ where: { token } });
  if (studentByToken && studentByToken.isActive !== false) {
    return { student: studentByToken, errorResponse: null };
  }

  if (options.required) {
    return {
      student: null,
      errorResponse: mobileError('Invalid or expired authentication token.', 401),
    };
  }

  return { student: null, errorResponse: null };
}

/**
 * Serializes Prisma student record to standard JSON matching Student.fromJson in Flutter.
 */
export function formatStudentResponse(student: Student, token?: string | null) {
  return {
    id: student.id,
    name: student.name,
    email: student.email,
    phone: student.phone,
    avatar_url: student.avatarUrl,
    class_id: student.classId,
    target_exam: student.targetExam,
    token: token ?? student.token ?? null,
    created_at: student.createdAt.toISOString(),
  };
}
```

### 3.3 Enhanced Response Wrappers: `src/lib/api-response.ts`
Update `c:\Users\hp\Desktop\course app\backend\src\lib\api-response.ts`:

```typescript
import { NextResponse } from 'next/server';

export function mobileSuccess<T = any>(data: T, init?: { status?: number; extra?: Record<string, any> }) {
  const payload: Record<string, any> = {
    status: 'success',
    data,
    ...(init?.extra || {}),
  };
  return NextResponse.json(payload, { status: init?.status ?? 200 });
}

export function mobileError(message: string, status = 400, details?: any) {
  return NextResponse.json(
    {
      status: 'error',
      message,
      ...(details ? { details } : {}),
    },
    { status }
  );
}

export function mobileUnauthorized(message = 'Authentication required') {
  return mobileError(message, 401);
}

export function mobileNotFound(message = 'Resource not found') {
  return mobileError(message, 404);
}
```

---

## 4. Complete 36-Endpoint Route Inventory & Contract Specifications

Below is the definitive reference for worker_m5 implementing and standardizing each endpoint:

### Group 1: Authentication & Profile (8 Endpoints)
1. **`POST /test-series/api/mobile/auth/login`**
   - Body: `{ phone_or_email: string, password: string }`
   - Lookup: `prisma.student.findFirst` matching email OR phone.
   - Verify: `bcrypt.compare` (or direct match for plaintext seeds).
   - Response: `{ status: 'success', token, user: StudentJson, data: StudentJson }`
2. **`POST /test-series/api/mobile/auth/register`**
   - Body: `{ name, email, phone, password, class_id? }`
   - Validate: all 4 fields required; check unique email and phone.
   - Response: 201 Created with `{ status: 'success', token, user: StudentJson, data: StudentJson }`
3. **`POST /test-series/api/mobile/auth/signup/send-otp`**
   - Body: `{ phone: string }`
   - Response: `{ status: 'success', message: 'OTP sent successfully', otp: '123456' }`
4. **`POST /test-series/api/mobile/auth/signup/verify`**
   - Body: `{ phone: string, otp: string }`
   - Response: `{ status: 'success', verified: true, token, user: StudentJson }`
5. **`POST /test-series/api/mobile/auth/forgot-password`**
   - Body: `{ phone_or_email: string }`
   - Response: `{ status: 'success', message: 'Password reset instructions sent' }`
6. **`POST /test-series/api/mobile/auth/reset-password`**
   - Body: `{ phone: string, otp: string, new_password: string }`
   - Action: Hash password and update student record.
   - Response: `{ status: 'success', message: 'Password updated successfully' }`
7. **`GET /test-series/api/mobile/profile`**
   - Auth: Bearer Token REQUIRED (`getStudentFromBearer(req, { required: true })`).
   - Response: `{ status: 'success', data: StudentJson, user: StudentJson }`
8. **`PUT /test-series/api/mobile/profile`**
   - Auth: Bearer Token REQUIRED.
   - Body: `{ name?, email?, phone?, avatar_url?, class_id?, target_exam? }`
   - Response: `{ status: 'success', data: UpdatedStudentJson, user: UpdatedStudentJson }`

### Group 2: Home, Catalog & Feeds (3 Endpoints)
9. **`GET /test-series/api/mobile/banners`**
   - Response: `{ status: 'success', data: BannerItem[] }`
   - Serialization: Each item contains:
     `{ id, title, subtitle, image_url, action_type, action_value, order, target_type, target_id, action_url }`
10. **`GET /test-series/api/mobile/categories`**
    - Response: `{ status: 'success', data: Category[] }`
    - Serialization: `{ id, name, icon, color, order }`
11. **`GET /test-series/api/mobile/home-feed`**
    - Auth: Optional (if Bearer provided, populates `recent_attempts` and `is_enrolled`).
    - Response:
      ```json
      {
        "status": "success",
        "data": {
          "banners": [ BannerItem ],
          "categories": [ Category ],
          "featured_test_series": [ TestSeriesSummary ],
          "popular_courses": [ Course ],
          "free_quizzes": [ QuizSummary ],
          "recent_attempts": [ AttemptSummary ],
          "featured_courses": [ Course ],
          "popular_test_series": [ TestSeriesSummary ]
        }
      }
      ```

### Group 3: Courses (3 Endpoints)
12. **`GET /test-series/api/mobile/courses`**
    - Query: `?category=...&search=...`
    - Response: `{ status: 'success', data: Course[] }`
    - Field verification: Each item includes `id, title, slug, description, thumbnail_url, price, discount_price, is_enrolled, total_lessons, total_duration_minutes, instructor_name`.
13. **`GET /test-series/api/mobile/courses/[id]`**
    - Params: `id` (supports numeric ID or string slug).
    - Response: `{ status: 'success', data: CourseDetail }`
    - Hierarchy: Includes `folders: CourseFolder[]` and `lessons: Lesson[]`.
    - Lesson fields: `{ id, folder_id, title, description, video_id, duration_minutes, is_free_preview, order, pdf_url }`.
14. **`GET /test-series/api/mobile/my-courses`**
    - Auth: Bearer Token REQUIRED.
    - Query: `prisma.enrollment.findMany({ where: { studentId, itemType: 'course', isActive: true } })`.
    - Response: `{ status: 'success', data: Course[] }` with `is_enrolled: true`. (Empty array if no enrollments).

### Group 4: Test Series & CBT Quizzes (8 Endpoints)
15. **`GET /test-series/api/mobile/test-series`**
    - Query: `?category=...`
    - Response: `{ status: 'success', data: TestSeriesSummary[] }`
    - Fields: `{ id, title, category, thumbnail_url, total_tests, free_tests, price, discount_price, is_purchased, validity_days }`.
16. **`GET /test-series/api/mobile/test-series/[id]`**
    - Response: `{ status: 'success', data: TestSeriesDetail }`
    - Includes `quizzes: SeriesQuiz[]` with:
      `{ id, test_series_id, title, duration_minutes, total_questions, total_marks, is_free, is_locked, is_attempted, best_score, max_attempts, attempts_taken }`.
17. **`GET /test-series/api/mobile/quizzes`**
    - Query: `?type=free` (or all)
    - Response: `{ status: 'success', data: QuizSummary[] }`
    - Fields: `{ id, title, subject, duration_minutes, total_questions, total_marks, is_attempted }`.
18. **`GET /test-series/api/mobile/quizzes/[id]`**
    - Response: `{ status: 'success', data: QuizPaper }`
    - Paper fields: `{ id, title, duration_minutes, total_marks, negative_marks, instructions: string[], questions: QuizQuestion[] }`.
    - Question fields: `{ id, question_number, question_text, question_image_url, options: string[], option_images, correct_option, explanation, subject, topic, marks, negative_marks }`.
19. **`POST /test-series/api/mobile/quizzes/[id]/submit`**
    - Auth: Bearer Token REQUIRED.
    - Body: `{ answers: Record<string, any>, time_taken_seconds: number }`.
    - Evaluates scoring: `correct * marks - incorrect * negativeMarks`.
    - Saves `QuizAttempt` to database.
    - Response: `{ status: 'success', data: QuizResult }`
    - Fields: `{ attempt_id, quiz_id, quiz_title, score, total_marks, correct_answers, incorrect_answers, unattempted, accuracy, time_taken_seconds, rank, total_participants, percentile, is_passed, certificate_url }`.
20. **`GET /test-series/api/mobile/quiz-attempts/[id]`**
    - Response:
      ```json
      {
        "status": "success",
        "data": {
          "result": QuizResult,
          "questions": [ QuestionReview ]
        }
      }
      ```
    - Each `QuestionReview`: `{ question: QuizQuestion, selected_option: int?, is_correct: bool, time_spent_seconds: int, marked_for_review: bool }`.
21. **`GET /test-series/api/mobile/quiz-attempts`**
    - Auth: Bearer Token REQUIRED.
    - Response: `{ status: 'success', data: QuizAttemptSummary[] }`
    - Fields: `{ id, quiz_id, quiz_title, score, total_marks, accuracy, completed_at, date }`.
22. **`GET /test-series/api/mobile/my-performance`**
    - Auth: Bearer Token REQUIRED.
    - Response: `{ status: 'success', data: TestAnalytics }`
    - Fields:
      ```json
      {
        "total_tests_attempted": 14,
        "total_questions_answered": 140,
        "overall_accuracy": 85.7,
        "overall_rank": 42,
        "score_trend": [ { "label": "Mock 1", "score": 28.0, "accuracy": 75.0 } ],
        "focus_areas": [
          { "topic": "Cell Biology", "subject": "Biology", "accuracy_percentage": 92.5, "questions_attempted": 40, "status": "strong" }
        ]
      }
      ```

### Group 5: Doubts & Faculty Q&A (4 Endpoints)
23. **`GET /test-series/api/mobile/doubts`**
    - Query: `?status=all|open|solved`
    - Response: `{ status: 'success', data: Doubt[] }`
24. **`GET /test-series/api/mobile/doubts/[id]`**
    - Response: `{ status: 'success', data: DoubtDetail }`
    - Doubt fields: `{ id, student_id, student_name, student_avatar, subject, question, image_url, status, created_at, replies: DoubtReply[] }`.
    - Reply fields: `{ id, doubt_id, author_id, author_name, author_avatar, author_type, message, image_url, created_at }`.
25. **`POST /test-series/api/mobile/doubts`**
    - Auth: Bearer Token REQUIRED.
    - Accepts: JSON or Multipart form data (`subject`, `question`, `image`).
    - Response: `{ status: 'success', data: Doubt }`
26. **`POST /test-series/api/mobile/doubts/[id]/reply`**
    - Auth: Bearer Token REQUIRED.
    - Accepts: JSON or Multipart form data (`message`, `image`).
    - Response: `{ status: 'success', data: DoubtReply }`

### Group 6: Community Feed (4 Endpoints)
27. **`GET /test-series/api/mobile/community`**
    - Response: `{ status: 'success', data: CommunityPost[] }`
    - Fields: `{ id, author_id, author_name, author_avatar, content, image_url, like_count, reply_count, is_liked, created_at, student_id, student_name, student_avatar, likes_count, comments_count }`.
28. **`POST /test-series/api/mobile/community`**
    - Auth: Bearer Token REQUIRED.
    - Accepts: JSON or Multipart (`content`, `image`).
    - Response: `{ status: 'success', data: CommunityPost }`
29. **`POST /test-series/api/mobile/community/like`**
    - Auth: Bearer Token REQUIRED.
    - Body: `{ post_id: number }`
    - Logic: Toggles like in `prisma.communityLike`. Increments or decrements `likeCount` in `CommunityPost`.
    - Response: `{ status: 'success', liked: boolean, like_count: number, likes_count: number }`
30. **`POST /test-series/api/mobile/community/[id]/comment`**
    - Auth: Bearer Token REQUIRED.
    - Body: `{ comment: string }`
    - Logic: Creates `CommunityComment`, increments `replyCount`.
    - Response: `{ status: 'success', message: 'Comment posted successfully' }`

### Group 7: AI Academic Tutor (1 Endpoint)
31. **`POST /test-series/api/mobile/ai/chat`**
    - Body: `{ message: string, history?: Array<{ role: string, content: string }> }`
    - Logic: Academic contextual solver (Physics, Chemistry, Biology, Math).
    - Response:
      ```json
      {
        "status": "success",
        "data": {
          "message": "Detailed academic explanation...",
          "suggestions": [
            "What is the mathematical formulation?",
            "Provide a worked example problem",
            "Related NCERT textbook questions"
          ]
        }
      }
      ```

### Group 8: Resources, E-Books & Live Classes (3 Endpoints)
32. **`GET /test-series/api/mobile/ebooks`**
    - Response: `{ status: 'success', data: Ebook[] }`
    - Fields: `{ id, title, author, description, cover_url, pdf_url, page_count, file_size, is_free, thumbnail_url, pages_count }`.
33. **`GET /test-series/api/mobile/resources`**
    - Response: `{ status: 'success', data: Resource[] }`
    - Fields: `{ id, title, type, file_type: type, file_url, file_size, created_at }`.
34. **`GET /test-series/api/mobile/live`**
    - Response: `{ status: 'success', data: LiveClass[] }`
    - Fields: `{ id, title, subject, instructor_name, instructor: instructor_name, thumbnail_url, scheduled_at, duration_minutes, status, stream_url }`.

### Group 9: Checkout & Razorpay Order Verification (2 Endpoints)
35. **`POST /test-series/api/mobile/checkout`**
    - Auth: Bearer Token REQUIRED.
    - Body: `{ item_type: 'course' | 'test_series', item_id: number }`
    - Logic: Fetches price, creates pending `Order` record with unique order number.
    - Response:
      ```json
      {
        "status": "success",
        "data": {
          "order_id": "order_1730000000_123",
          "amount": 999.0,
          "currency": "INR",
          "key_id": "rzp_test_mock_key",
          "item_name": "NEET 2026 Target All India Test Series",
          "user_email": "rahul.sharma@example.com",
          "user_phone": "9876543210"
        }
      }
      ```
36. **`POST /test-series/api/mobile/verify-payment`**
    - Auth: Bearer Token REQUIRED.
    - Body: `{ razorpay_order_id, razorpay_payment_id, razorpay_signature }`
    - Logic: Marks order as `paid`, upserts `Enrollment` granting 365-day access to course/test-series.
    - Response: `{ status: 'success', message: 'Payment verified and access activated' }`

---

## 5. Step-by-Step Implementation Plan for Worker M5

Worker M5 should execute the implementation in 4 distinct phases:

### Phase 1: Shared Infrastructure & Helper Utilities
1. Create `backend/src/lib/mobile-auth.ts`:
   - Implement `getStudentFromBearer(req, options)` with JWT + mock token support.
   - Implement `formatStudentResponse(student, token)`.
2. Enhance `backend/src/lib/api-response.ts`:
   - Add `mobileUnauthorized`, `mobileNotFound`, and verify `mobileSuccess` / `mobileError`.

### Phase 2: Route Standardization & Schema Alignment (All 36 Routes)
Update each route file under `src/app/test-series/api/mobile/` to import `getStudentFromBearer` and `mobileSuccess`:
1. `auth/*` (login, register, send-otp, verify, forgot-password, reset-password): ensure dual `user` & `data` keys.
2. `profile/*`: enforce Bearer token, return full student schema on GET and PUT.
3. `banners`, `categories`, `home-feed`: return complete nested objects with exact keys expected by `HomeFeed.fromJson`.
4. `courses/*` & `my-courses`: ensure `slug`, `instructor_name`, `total_lessons`, folder `lessons` hierarchy with `video_id`, `duration_minutes`. Return empty array when un-enrolled.
5. `test-series/*`: add `quizzes: SeriesQuiz[]` with `test_series_id`, `total_questions`, `is_free`, `is_locked`.
6. `quizzes/*`: align question keys (`correct_option`, `marks`, `negative_marks`, `question_number`, `instructions`).
7. `quizzes/[id]/submit`: return full `QuizResult` (`attempt_id`, `quiz_title`, `score`, `total_marks`, `correct_answers`, `incorrect_answers`, `unattempted`, `rank`, `certificate_url`).
8. `quiz-attempts/[id]`: return nested `{ result: QuizResult, questions: QuestionReview[] }`.
9. `my-performance`: return `{ total_tests_attempted, total_questions_answered, overall_accuracy, overall_rank, score_trend, focus_areas }`.
10. `doubts/*`: align reply objects (`author_id`, `author_name`, `author_type`).
11. `community/*`: align post objects (`author_id`, `author_name`, `like_count`, `reply_count`, `is_liked`). Update like toggle logic to mutate `likeCount`.
12. `ai/chat`: provide `suggestions` array.
13. `ebooks`, `resources`, `live`: align keys (`cover_url`, `page_count`, `file_size`, `instructor_name`, `subject`).
14. `checkout` & `verify-payment`: include `item_name`, `user_email`, `user_phone`.

### Phase 3: Automated Verification Suite (`tests/verify-mobile.ts`)
Create `backend/tests/verify-mobile.ts`:
- Import all route handlers directly (`POST as loginHandler`, etc.).
- Structure into 9 test suites covering all 36 endpoints.
- Include deep field assertion functions verifying every property from `models.dart`.
- Include security validation verifying 401 Unauthorized when Bearer token is omitted on protected endpoints.
- Add npm script in `package.json`: `"test:mobile": "tsx tests/verify-mobile.ts"`.

### Phase 4: Full Build & Typecheck Validation
1. Run `npx tsx tests/verify-mobile.ts` -> all 36 endpoints must pass with 0 failures.
2. Run `npm run build` inside `backend/` -> ensure clean production build with 0 TypeScript/ESLint errors.

---

## 6. Strategy for the Automated Verification Script (`tests/verify-mobile.ts`)

The verification script must test all 36 operations with deep contract verification. Below is the structural strategy:

### Architecture of `tests/verify-mobile.ts`
1. **Direct In-Process Execution**:
   Imports route handlers directly from `src/app/test-series/api/mobile/.../route.ts`.
   Calls them with `new NextRequest('http://localhost:3000/...', { method, headers, body })`.
   Executes in under 2 seconds without requiring external background server processes.
2. **Deterministic Test State**:
   - Uses seeded student (phone: `'9876543210'`, password: `'password123'`).
   - Retrieves real Bearer token from `/auth/login`.
   - Passes token to protected endpoints.
3. **Deep Schema Validation Checks**:
   - Checks not just `status === 'success'`, but asserts every critical field name and type:
     ```ts
     // Example CBT submission assertion
     assert(typeof json.data.attempt_id === 'number', 'QuizResult includes attempt_id');
     assert(typeof json.data.quiz_title === 'string', 'QuizResult includes quiz_title');
     assert(typeof json.data.correct_answers === 'number', 'QuizResult includes correct_answers');
     assert(typeof json.data.incorrect_answers === 'number', 'QuizResult includes incorrect_answers');
     assert(typeof json.data.unattempted === 'number', 'QuizResult includes unattempted');
     assert(typeof json.data.accuracy === 'number', 'QuizResult includes accuracy');
     ```
4. **Security & Boundary Tests**:
   - Calls `/profile`, `/my-courses`, `/checkout` with NO token -> asserts HTTP 401 Unauthorized.
   - Calls `/quizzes/999999` with non-existent ID -> asserts HTTP 404 Not Found.
5. **Output & Exit Codes**:
   - Formatted console output with `[PASS]`, `[FAIL]`, execution duration.
   - Summary statistics: `36 / 36 endpoints passed (100% pass rate)`.
   - `process.exit(0)` on pass; `process.exit(1)` on any failure.

---

## 7. Caveats

1. **Prisma SQLite vs Postgres**:
   The current local database is SQLite (`prisma/dev.db`). JSON columns (e.g. `quiz.instructions`, `question.options`, `quizAttempt.answers`) are stored as serialized JSON strings. Route handlers must parse these with `JSON.parse()` before returning them in JSON arrays.
2. **Razorpay Mock Integration**:
   In development/test mode, Razorpay payments do not contact external bank gateways. `POST /checkout` generates a deterministic mock order, and `POST /verify-payment` validates the payload and activates access in the `Enrollment` table immediately.
3. **Multipart Form Uploads**:
   For routes accepting optional image uploads (`/doubts`, `/community`), the handler must check `req.headers.get('content-type')`. If `multipart/form-data`, read via `req.formData()`. If `application/json`, read via `req.json()`. This allows seamless operation for both mobile binary uploads and JSON-based API calls.

---

## 8. Conclusion

Milestone 5 is in an advantageous position:
1. 33 route files already exist under `backend/src/app/test-series/api/mobile/`, providing substantial foundation.
2. However, multiple endpoints suffer from property naming divergences against Flutter's `models.dart` (such as flat question reviews, omitted attempt IDs, missing home feed collections, and un-validated Bearer tokens).
3. By introducing `src/lib/mobile-auth.ts` (`getStudentFromBearer`) and standardizing route handlers to return superset envelopes aligned with `models.dart`, all 36 endpoint operations will achieve 100% fidelity.
4. Implementing `tests/verify-mobile.ts` provides instant, repeatable, deterministic verification across all 31+ endpoints.

Worker M5 has a complete, unambiguous, and step-by-step roadmap to implement and verify Milestone 5 to total perfection.

---

## 9. Verification Method

To verify this architecture and the resulting worker implementation:

1. **Verify Backend Build**:
   ```pwsh
   cd "c:\Users\hp\Desktop\course app\backend"
   npm run build
   ```
   *Expected*: Next.js App Router builds successfully with 0 TypeScript/ESLint errors.

2. **Execute Full Mobile API Test Suite**:
   ```pwsh
   cd "c:\Users\hp\Desktop\course app\backend"
   npx tsx tests/verify-mobile.ts
   ```
   *Expected*: All 36 endpoint operations pass with 0 failures:
   ```
   ====================================================
   🚀 Running Mobile API 31-Endpoint Verification Suite
   ====================================================
   ...
   ====================================================
   Summary: 36 passed, 0 failed (100% pass rate)
   ====================================================
   ```

3. **Verify Security Gate**:
   Inspect that sending a request to `/profile` or `/my-courses` without Authorization header returns HTTP 401:
   ```json
   { "status": "error", "message": "Authentication required. Missing Bearer token." }
   ```
