# Mobile API Endpoint Audit Report (M5)

**Auditor:** explorer_m5_1 (Mobile API Endpoint Auditor)  
**Date:** 2026-11-01  
**Target Codebases:**
- Mobile Client: `c:\Users\hp\Desktop\course app\lib\core\api_service.dart`, `api_client.dart`, `models/models.dart`
- Backend API: `c:\Users\hp\Desktop\course app\backend\src\app\test-series\api\mobile`
- Database: `c:\Users\hp\Desktop\course app\backend\prisma\schema.prisma`

---

## 1. Observation

### 1.1 Complete Inventory of Mobile API Endpoints (36 Operations across 33 Routes)

The Flutter mobile application defines **36 distinct API client operations** in `lib/core/api_service.dart` corresponding to **33 route handlers** located under Next.js App Router directory `/test-series/api/mobile/`.

| # | `ApiService` Method | HTTP | Path (under `/test-series/api/mobile/`) | Request Headers & Params / Body | Expected Response Data Model | Backend File Status | Schema Parity Status |
|---|---|---|---|---|---|---|---|
| 1 | `login` | POST | `/auth/login` | None; Body: `phone_or_email`, `password` | `token`, `user`: `Student` | `auth/login/route.ts` | ✅ MATCH |
| 2 | `register` | POST | `/auth/register` | None; Body: `name`, `email`, `phone`, `password`, `class_id?` | `token`, `user`: `Student` | `auth/register/route.ts` | ✅ MATCH |
| 3 | `sendOtp` | POST | `/auth/signup/send-otp` | None; Body: `phone` | `{ status: 'success' }` | `auth/signup/send-otp/route.ts` | ✅ MATCH |
| 4 | `verifyOtp` | POST | `/auth/signup/verify` | None; Body: `phone`, `otp` | `verified`: bool, `token`: str, `user?`: `Student` | `auth/signup/verify/route.ts` | ✅ MATCH |
| 5 | `forgotPassword` | POST | `/auth/forgot-password` | None; Body: `phone_or_email` | `{ status: 'success' }` | `auth/forgot-password/route.ts` | ✅ MATCH |
| 6 | `resetPassword` | POST | `/auth/reset-password` | None; Body: `phone`, `otp`, `new_password` | `{ status: 'success' }` | `auth/reset-password/route.ts` | ✅ MATCH |
| 7 | `getProfile` | GET | `/profile` | Bearer Token | `data`: `Student` | `profile/route.ts` | ✅ MATCH |
| 8 | `updateProfile` | PUT | `/profile` | Bearer Token; Body: fields to update | `data`: `Student` | `profile/route.ts` | ✅ MATCH |
| 9 | `getBanners` | GET | `/banners` | None | `data`: `List<BannerItem>` | `banners/route.ts` | ❌ FIELD MISMATCH |
| 10 | `getCategories` | GET | `/categories` | None | `data`: `List<CategoryMap>` | `categories/route.ts` | ✅ MATCH |
| 11 | `getHomeFeed` | GET | `/home-feed` | Optional Bearer | `data`: `HomeFeed` (6 sub-models) | `home-feed/route.ts` | ❌ CRITICAL MISMATCH |
| 12 | `getCourses` | GET | `/courses` | Optional Bearer; Query: `category?`, `search?` | `data`: `List<Course>` | `courses/route.ts` | ⚠️ MINOR OMISSIONS |
| 13 | `getCourseDetail` | GET | `/courses/:id` | Optional Bearer | `data`: `Course` with `folders.lessons` | `courses/[id]/route.ts` | ❌ SEVERE MISMATCH |
| 14 | `getMyCourses` | GET | `/my-courses` | Bearer Token | `data`: `List<Course>` | `my-courses/route.ts` | ⚠️ MINOR OMISSIONS |
| 15 | `getTestSeries` | GET | `/test-series` | Optional Bearer; Query: `category?` | `data`: `List<TestSeriesSummary>` | `test-series/route.ts` | ⚠️ SCHEMA OMISSIONS |
| 16 | `getTestSeriesDetail` | GET | `/test-series/:id` | Optional Bearer | `data`: `TestSeriesDetail` (`quizzes`) | `test-series/[id]/route.ts` | ❌ SEVERE MISMATCH |
| 17 | `getFreeQuizzes` | GET | `/quizzes` | Query: `type=free` | `data`: `List<QuizSummary>` | `quizzes/route.ts` | ❌ FIELD MISMATCH |
| 18 | `getQuizPaper` | GET | `/quizzes/:id` | Optional Bearer | `data`: `QuizPaper` (`questions`) | `quizzes/[id]/route.ts` | ❌ SEVERE MISMATCH |
| 19 | `submitQuiz` | POST | `/quizzes/:id/submit` | Bearer Token; Body: `answers`, `time_taken_seconds` | `data`: `QuizResult` | `quizzes/[id]/submit/route.ts` | ❌ CRITICAL MISMATCH |
| 20 | `getQuizResult` | GET | `/quiz-attempts/:id` | Bearer Token | `data`: `{ result, questions: QuestionReview[] }` | `quiz-attempts/[id]/route.ts` | 🚨 CRASHING BUG |
| 21 | `getPreviousResults` | GET | `/quiz-attempts` | Bearer Token | `data`: `List<QuizAttemptSummary>` | `quiz-attempts/route.ts` | ❌ FIELD MISMATCH |
| 22 | `getMyPerformance` | GET | `/my-performance` | Bearer Token | `data`: `TestAnalytics` (`score_trend`, `focus_areas`) | `my-performance/route.ts` | ❌ SEVERE MISMATCH |
| 23 | `getDoubts` | GET | `/doubts` | Bearer Token; Query: `status?` | `data`: `List<Doubt>` (`replies`) | `doubts/route.ts` | ❌ FIELD MISMATCH |
| 24 | `getDoubtDetail` | GET | `/doubts/:id` | Bearer Token | `data`: `Doubt` (`replies`) | `doubts/[id]/route.ts` | ❌ FIELD MISMATCH |
| 25 | `submitDoubt` | POST | `/doubts` | Bearer Token; Multipart/JSON: `subject`, `question`, `image?` | `data`: `Doubt` | `doubts/route.ts` | ✅ MATCH |
| 26 | `replyDoubt` | POST | `/doubts/:id/reply` | Bearer Token; Multipart/JSON: `message`, `image?` | `data`: `DoubtReply` | `doubts/[id]/reply/route.ts` | ❌ FIELD MISMATCH |
| 27 | `getCommunityFeed` | GET | `/community` | Optional Bearer | `data`: `List<CommunityPost>` | `community/route.ts` | ❌ SEVERE MISMATCH |
| 28 | `createPost` | POST | `/community` | Bearer Token; Multipart/JSON: `content`, `image?` | `data`: `CommunityPost` | `community/route.ts` | ❌ SEVERE MISMATCH |
| 29 | `likePost` | POST | `/community/like` | Bearer Token; Body: `post_id` | `{ status: 'success' }` | `community/like/route.ts` | ✅ MATCH |
| 30 | `commentPost` | POST | `/community/:id/comment` | Bearer Token; Body: `comment` | `{ status: 'success' }` | `community/[id]/comment/route.ts` | ✅ MATCH |
| 31 | `askAiChat` | POST | `/ai/chat` | Optional Bearer; Body: `message`, `history?` | `data`: `AiReply` (`suggestions`) | `ai/chat/route.ts` | ⚠️ SCHEMA OMISSION |
| 32 | `getEbooks` | GET | `/ebooks` | None | `data`: `List<Ebook>` | `ebooks/route.ts` | ❌ FIELD MISMATCH |
| 33 | `getResources` | GET | `/resources` | None | `data`: `List<Resource>` | `resources/route.ts` | ❌ FIELD MISMATCH |
| 34 | `getLiveClasses` | GET | `/live` | None | `data`: `List<LiveClass>` | `live/route.ts` | ❌ FIELD MISMATCH |
| 35 | `createCheckoutSession`| POST | `/checkout` | Bearer Token; Body: `item_type`, `item_id` | `data`: `CheckoutSession` | `checkout/route.ts` | ❌ VALUE & FIELD MISMATCH |
| 36 | `verifyPayment` | POST | `/verify-payment` | Bearer Token; Body: `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature` | `{ status: 'success' }` | `verify-payment/route.ts` | ✅ MATCH |

---

### 1.2 Verbatim Code Evidence of Discrepancies

#### A. Fatal Crash in Quiz Result Review (`/quiz-attempts/:id`)
- **Flutter Client Expectation (`lib/core/api_service.dart:230-233` and `lib/models/models.dart:840-842`)**:
  ```dart
  // api_service.dart
  final result = QuizResult.fromJson(Map<String, dynamic>.from(resultPayload['result'] as Map));
  final questionsList = (resultPayload['questions'] as List? ?? []).map(
    (e) => QuestionReview.fromJson(Map<String, dynamic>.from(e as Map)),
  ).toList();

  // models.dart
  factory QuestionReview.fromJson(Map<String, dynamic> json) => QuestionReview(
    question: QuizQuestion.fromJson(Map<String, dynamic>.from(json['question'] as Map)),
    selectedOption: json['selected_option'] as int?,
    isCorrect: json['is_correct'] as bool? ?? false,
    ...
  );
  ```
- **Backend Current Implementation (`backend/src/app/test-series/api/mobile/quiz-attempts/[id]/route.ts:45-54`)**:
  ```typescript
  return {
    id: q.id,
    question_text: q.questionText,
    options: optionsArray,
    user_answer: userAnswer,
    correct_answer: q.correctOption,
    is_correct: isCorrect,
    marks_awarded: marks,
    explanation: q.explanation,
  };
  ```
  **Direct Conflict**: The backend flattens question fields into the review item rather than nesting them under `question: { ... }`. When Flutter executes `json['question'] as Map`, it receives `null as Map`, throwing an unhandled `TypeError` that crashes the entire exam review screen.

#### B. Broken Quiz Submission Flow (`/quizzes/:id/submit`)
- **Flutter Client Expectation (`lib/models/models.dart:709-725`)**:
  ```dart
  factory QuizResult.fromJson(Map<String, dynamic> json) => QuizResult(
    attemptId: json['attempt_id'] as int? ?? 0,
    quizId: json['quiz_id'] as int? ?? 0,
    quizTitle: json['quiz_title'] as String? ?? '',
    score: (json['score'] as num? ?? 0.0).toDouble(),
    totalMarks: (json['total_marks'] as num? ?? 0.0).toDouble(),
    correctAnswers: json['correct_answers'] as int? ?? 0,
    incorrectAnswers: json['incorrect_answers'] as int? ?? 0,
    unattempted: json['unattempted'] as int? ?? 0,
    accuracy: (json['accuracy'] as num? ?? 0.0).toDouble(),
    timeTakenSeconds: json['time_taken_seconds'] as int? ?? 0,
    rank: json['rank'] as int? ?? 1,
    totalParticipants: json['total_participants'] as int? ?? 1,
    percentile: (json['percentile'] as num? ?? 100.0).toDouble(),
    isPassed: json['is_passed'] as bool? ?? true,
    certificateUrl: json['certificate_url'] as String?,
  );
  ```
- **Backend Current Implementation (`backend/src/app/test-series/api/mobile/quizzes/[id]/submit/route.ts:68-80`)**:
  ```typescript
  const data = {
    id: attempt.id,                   // MISMATCH: expects attempt_id
    quiz_id: attempt.quizId,
    score: attempt.score,
    total_questions: totalQuestions,  // Unused by QuizResult
    correct_answers: attempt.correctAnswers,
    wrong_answers: attempt.incorrectAnswers,  // MISMATCH: expects incorrect_answers
    unanswered: attempt.unattempted,          // MISMATCH: expects unattempted
    accuracy: attempt.accuracy,
    percentile: attempt.percentile,
    time_taken_seconds: attempt.timeTakenSeconds,
    submitted_at: attempt.createdAt.toISOString(),
    // MISSING: quiz_title, total_marks, rank, total_participants, is_passed, certificate_url
  };
  ```
  **Direct Conflict**: `attemptId` is parsed as `0`. When the user is redirected to results/review, the app calls `GET /quiz-attempts/0` resulting in an immediate `404 Not Found`.

#### C. Home Feed Blank Sections (`/home-feed`)
- **Flutter Client Expectation (`lib/models/models.dart:148-155`)**:
  `HomeFeed.fromJson` reads 6 explicit keys:
  - `banners`: `List<BannerItem>`
  - `categories`: `List<Map<String, dynamic>>`
  - `featured_test_series`: `List<TestSeriesSummary>`
  - `popular_courses`: `List<Course>`
  - `free_quizzes`: `List<QuizSummary>`
  - `recent_attempts`: `List<AttemptSummary>`
- **Backend Current Implementation (`backend/src/app/test-series/api/mobile/home-feed/route.ts:58-64`)**:
  ```typescript
  data: {
    banners: formattedBanners,
    categories: formattedCategories,
    featured_courses: formattedCourses,    // MISMATCH: Flutter expects popular_courses
    popular_test_series: formattedSeries,  // MISMATCH: Flutter expects featured_test_series
    // MISSING free_quizzes and recent_attempts completely!
  }
  ```
  **Direct Conflict**: The home feed renders empty sections for Popular Courses, Featured Test Series, Free Quizzes, and Recent Attempts.

#### D. Community Post Author and Engagement Blanking (`/community`)
- **Flutter Client Expectation (`lib/models/models.dart:1125-1136`)**:
  ```dart
  authorId: json['author_id'] as int? ?? 0,
  authorName: json['author_name'] as String? ?? '',
  authorAvatar: json['author_avatar'] as String?,
  content: json['content'] as String? ?? '',
  imageUrl: json['image_url'] as String?,
  likeCount: json['like_count'] as int? ?? 0,
  replyCount: json['reply_count'] as int? ?? 0,
  isLiked: json['is_liked'] as bool? ?? false,
  ```
- **Backend Current Implementation (`backend/src/app/test-series/api/mobile/community/route.ts:16-26`)**:
  ```typescript
  const data = posts.map((p) => ({
    id: p.id,
    student_id: p.authorId,       // MISMATCH: expects author_id
    student_name: p.authorName,   // MISMATCH: expects author_name
    student_avatar: p.authorAvatar,// MISMATCH: expects author_avatar
    content: p.content,
    image_url: p.imageUrl,
    likes_count: p.likeCount,     // MISMATCH: expects like_count
    comments_count: p.replyCount, // MISMATCH: expects reply_count
    is_liked: false,
    created_at: p.createdAt.toISOString(),
  }));
  ```
  **Direct Conflict**: Every community post in the mobile UI shows an anonymous author, 0 likes, and 0 comments.

#### E. Banner Navigation Failure (`/banners`)
- **Flutter Client Expectation (`lib/models/models.dart:100-108`)**:
  `imageUrl: json['image_url']`, `actionType: json['action_type']`, `actionValue: json['action_value']`, `order: json['order']`.
- **Backend Current Implementation (`backend/src/app/test-series/api/mobile/banners/route.ts:11-19`)**:
  Returns `target_type` instead of `action_type`, `action_url` / `target_id` instead of `action_value`, and `sort_order` instead of `order`.
  **Direct Conflict**: When a mobile user clicks a banner, the tap listener finds `actionType == null`, failing to navigate.

#### F. Video Lesson Playback Invalidation (`/courses/:id`)
- **Flutter Client Expectation (`lib/models/models.dart:285-296`)**:
  `Lesson.fromJson` expects:
  `folder_id`: int, `video_id`: String, `duration_minutes`: int, `order`: int, `pdf_url`: String?.
- **Backend Current Implementation (`backend/src/app/test-series/api/mobile/courses/[id]/route.ts:44-50`)**:
  Returns `"video_url": l.videoId` instead of `"video_id"`, and `"duration": "${l.durationMinutes}m"` (string) instead of `"duration_minutes": int`.
  **Direct Conflict**: `videoId` parses as `""` (empty string). The video player fails to load any video.

#### G. Checkout Unit & Field Discrepancies (`/checkout`)
- **Flutter Client Expectation (`lib/core/payment_service.dart:113`, `lib/models/models.dart:1357-1365`)**:
  `CheckoutSession.fromJson` expects:
  `order_id`: String, `amount`: double in **Rupees**, `currency`: String, `key_id`: String, `item_name`: String, `user_email`: String?, `user_phone`: String?.
  In `payment_service.dart:113`: `amount: (session.amount * 100).toInt()`.
- **Backend Current Implementation (`backend/src/app/test-series/api/mobile/checkout/route.ts:48-55`)**:
  Backend computes `amount = Math.round(price * 100)` (paise, e.g. 99900) and returns that directly in `data.amount`, omitting `item_name`, `user_email`, and `user_phone`.
  **Direct Conflict**: The Flutter UI displays `Amount: ₹99900.00` instead of `₹999.00`, and passes `9990000` paise to the Razorpay SDK.

---

## 2. Logic Chain

1. **Architecture Requirement (Observation 1.1)**:
   The user request mandates full parity for 31 mobile API endpoints under `/test-series/api/mobile/*` matching the mobile app contract in `lib/core/api_service.dart`.
2. **Current Route Footprint (Observation 1.1)**:
   The backend repository already has 33 Next.js App Router route handlers implemented under `backend/src/app/test-series/api/mobile`.
3. **Database Relational Fidelity (Prisma Verification)**:
   Running `backend/prisma/verify.ts` demonstrates that Prisma ORM has 29 models with 100% of the required properties (e.g. `QuizAttempt.correctAnswers`, `QuizAttempt.incorrectAnswers`, `Question.marks`, `CommunityPost.authorName`, `Banner.actionType`). The database schema is already complete and aligned with the Flutter domain models.
4. **Origin of Discrepancies**:
   The route generation script (`backend/scratch/generate_mobile_routes.py`) that created the route handlers introduced ad-hoc renamings (e.g., `user_name` instead of `author_name`, `student_id` instead of `author_id`, `positive_marks` instead of `marks`, `duration: "35m"` instead of `duration_minutes: 35`, and flattened `questionsReview` instead of nesting `{ question, selected_option }`).
5. **Impact on Production**:
   Because Dart is strongly typed and uses explicit map lookups (`json['...']`), these naming mismatches do not just cause cosmetic differences; they cause:
   - **Fatal TypeErrors** (crashing the app on attempt review `GET /quiz-attempts/:id`).
   - **404 Route Loops** (submitting a quiz returns `id` instead of `attempt_id`, sending the app to `/quiz-attempts/0`).
   - **Empty Screens** (home feed, community posts, banners).
   - **Zeroed Playback** (lessons lack `video_id`).

---

## 3. Caveats

1. **Endpoint Count Semantics**:
   The prompt and plan describe "31 mobile API endpoints". Our audit reveals that `ApiService` contains 36 methods across 33 unique route paths. The difference is due to multi-method endpoints (e.g. `GET` and `PUT` on `/profile`, `GET` and `POST` on `/doubts`, `GET` and `POST` on `/community`). All 36 methods and 33 routes are catalogued.
2. **Otp Route Fallbacks**:
   `MockDataGenerator` in `api_client.dart` contains fallbacks for `/auth/send-otp` and `/auth/verify-otp` in addition to `/auth/signup/send-otp` and `/auth/signup/verify`. Adding rewrite/alias routes ensures total compatibility regardless of client version.
3. **Admin Dashboard Routes**:
   Admin dashboard routes under `/api/admin/*` are outside the scope of this audit, which is exclusively focused on `/test-series/api/mobile/*`.

---

## 4. Conclusion

1. **Implementation Coverage**:
   All 33 unique route files exist in `backend/src/app/test-series/api/mobile/`. There are **0 missing route files**.
2. **Schema Alignment Status**:
   Out of 33 routes:
   - **12 routes** have perfect schema parity (Auth login, register, send/verify OTP, forgot/reset password, profile GET/PUT, categories, doubts POST, community like/comment, verify-payment).
   - **19 routes** require schema corrections to match the exact keys expected by `lib/models/models.dart`.
   - **2 routes** possess critical application-breaking bugs (`quiz-attempts/[id]` and `quizzes/[id]/submit`).
3. **Clear Path to 100% Parity in Milestone M5**:
   Because the Prisma schema and database seeder already store every required field with matching types, resolving all discrepancies only requires updating the serialization logic inside the route handlers in `backend/src/app/test-series/api/mobile/` to match the exact keys documented in Section 1.2.

---

## 5. Verification Method

### 5.1 Automated Typecheck
Verify the Next.js TypeScript build compiles cleanly:
```powershell
cd "c:\Users\hp\Desktop\course app\backend"
npx tsc --noEmit
```
*Expected Result*: Exit code 0, 0 type errors.

### 5.2 Seeder & Database Verification
Confirm Prisma SQLite database is healthy and fully seeded:
```powershell
cd "c:\Users\hp\Desktop\course app\backend"
npx tsx prisma/verify.ts
```
*Expected Result*: "All 29 models verified successfully with authentic data and relational integrity!"

### 5.3 Automated Schema Parity Validation Script
To verify the fixes independently once applied in M5, execute the following Node/TS verification test against the live Next.js server or via route unit tests (`tests/verify-mobile.ts`):
1. **`GET /test-series/api/mobile/banners`**: Assert `data[0].action_type !== undefined` and `data[0].action_value !== undefined`.
2. **`GET /test-series/api/mobile/home-feed`**: Assert `data.featured_test_series`, `data.popular_courses`, `data.free_quizzes`, and `data.recent_attempts` exist as arrays.
3. **`GET /test-series/api/mobile/courses/101`**: Assert `data.folders[0].lessons[0].video_id !== undefined` and `typeof data.folders[0].lessons[0].duration_minutes === 'number'`.
4. **`POST /test-series/api/mobile/quizzes/101/submit`**: Submit answers `{ "1": 1 }`, assert response contains `data.attempt_id` (number > 0) and `data.incorrect_answers` (number).
5. **`GET /test-series/api/mobile/quiz-attempts/:id`**: Assert `data.questions[0].question` is an object containing `id`, `question_text`, `options`, `correct_option`.
6. **`POST /test-series/api/mobile/checkout`**: Assert `data.amount` is in Rupees (`< 10000`) and `data.item_name` is non-empty.
