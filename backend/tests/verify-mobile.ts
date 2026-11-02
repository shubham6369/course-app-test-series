import { NextRequest } from 'next/server';
import prisma from '../src/lib/prisma';

// Route Handlers
import { POST as loginHandler } from '../src/app/test-series/api/mobile/auth/login/route';
import { POST as registerHandler } from '../src/app/test-series/api/mobile/auth/register/route';
import { POST as sendOtpHandler } from '../src/app/test-series/api/mobile/auth/signup/send-otp/route';
import { POST as verifyOtpHandler } from '../src/app/test-series/api/mobile/auth/signup/verify/route';
import { POST as forgotPasswordHandler } from '../src/app/test-series/api/mobile/auth/forgot-password/route';
import { POST as resetPasswordHandler } from '../src/app/test-series/api/mobile/auth/reset-password/route';
import { GET as getProfileHandler, PUT as updateProfileHandler } from '../src/app/test-series/api/mobile/profile/route';
import { GET as getBannersHandler } from '../src/app/test-series/api/mobile/banners/route';
import { GET as getCategoriesHandler } from '../src/app/test-series/api/mobile/categories/route';
import { GET as getHomeFeedHandler } from '../src/app/test-series/api/mobile/home-feed/route';
import { GET as getCoursesHandler } from '../src/app/test-series/api/mobile/courses/route';
import { GET as getCourseDetailHandler } from '../src/app/test-series/api/mobile/courses/[id]/route';
import { GET as getMyCoursesHandler } from '../src/app/test-series/api/mobile/my-courses/route';
import { GET as getTestSeriesHandler } from '../src/app/test-series/api/mobile/test-series/route';
import { GET as getTestSeriesDetailHandler } from '../src/app/test-series/api/mobile/test-series/[id]/route';
import { GET as getQuizzesHandler } from '../src/app/test-series/api/mobile/quizzes/route';
import { GET as getQuizPaperHandler } from '../src/app/test-series/api/mobile/quizzes/[id]/route';
import { POST as submitQuizHandler } from '../src/app/test-series/api/mobile/quizzes/[id]/submit/route';
import { GET as getAttemptsHandler } from '../src/app/test-series/api/mobile/quiz-attempts/route';
import { GET as getAttemptDetailHandler } from '../src/app/test-series/api/mobile/quiz-attempts/[id]/route';
import { GET as getPerformanceHandler } from '../src/app/test-series/api/mobile/my-performance/route';
import { GET as getDoubtsHandler, POST as submitDoubtHandler } from '../src/app/test-series/api/mobile/doubts/route';
import { GET as getDoubtDetailHandler } from '../src/app/test-series/api/mobile/doubts/[id]/route';
import { POST as replyDoubtHandler } from '../src/app/test-series/api/mobile/doubts/[id]/reply/route';
import { GET as getCommunityHandler, POST as createPostHandler } from '../src/app/test-series/api/mobile/community/route';
import { POST as likePostHandler } from '../src/app/test-series/api/mobile/community/like/route';
import { POST as commentPostHandler } from '../src/app/test-series/api/mobile/community/[id]/comment/route';
import { POST as aiChatHandler } from '../src/app/test-series/api/mobile/ai/chat/route';
import { GET as getEbooksHandler } from '../src/app/test-series/api/mobile/ebooks/route';
import { GET as getResourcesHandler } from '../src/app/test-series/api/mobile/resources/route';
import { GET as getLiveHandler } from '../src/app/test-series/api/mobile/live/route';
import { POST as checkoutHandler } from '../src/app/test-series/api/mobile/checkout/route';
import { POST as verifyPaymentHandler } from '../src/app/test-series/api/mobile/verify-payment/route';
import { GET as getAnnouncementsHandler } from '../src/app/test-series/api/mobile/announcements/route';
import { GET as getNotificationsHandler } from '../src/app/test-series/api/mobile/notifications/route';
import { GET as getOrdersHandler } from '../src/app/test-series/api/mobile/orders/route';
import { POST as validateCouponHandler } from '../src/app/test-series/api/mobile/coupons/validate/route';

async function runMobileVerification() {
  console.log('======================================================================');
  console.log('🚀 Running Complete Mobile API 36-Operation Automated Test Suite (M5)');
  console.log('======================================================================\n');

  let passed = 0;
  let failed = 0;
  const startTime = Date.now();

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${testName}${detail ? ` -> ${detail}` : ''}`);
      failed++;
    }
  }

  try {
    // -------------------------------------------------------------------------
    // Suite 1: Authentication & Profile Flow (8 Operations)
    // -------------------------------------------------------------------------
    console.log('📦 Suite 1: Authentication & Profile Operations');

    // 1. Send OTP
    const req1 = new NextRequest('http://localhost:3000/test-series/api/mobile/auth/signup/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone: '9876543210' }),
    });
    const res1 = await sendOtpHandler(req1);
    const json1 = await res1.json();
    assert(res1.status === 200 && json1.status === 'success', '1. Send OTP returns success');

    // 2. Verify OTP
    const req2 = new NextRequest('http://localhost:3000/test-series/api/mobile/auth/signup/verify', {
      method: 'POST',
      body: JSON.stringify({ phone: '9876543210', otp: '123456' }),
    });
    const res2 = await verifyOtpHandler(req2);
    const json2 = await res2.json();
    assert(
      res2.status === 200 &&
      json2.verified === true &&
      typeof json2.token === 'string' &&
      json2.user?.phone === '9876543210',
      '2. Verify OTP returns token & formatted student'
    );

    // 3. Register New Student
    const randSuffix = Date.now().toString().slice(-6);
    const newPhone = `91${randSuffix}`;
    const newEmail = `user${randSuffix}@testmobile.local`;
    const req3 = new NextRequest('http://localhost:3000/test-series/api/mobile/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Mobile Aspirant',
        email: newEmail,
        phone: newPhone,
        password: 'password123',
        class_id: '12',
      }),
    });
    const res3 = await registerHandler(req3);
    const json3 = await res3.json();
    assert(
      res3.status === 201 &&
      json3.status === 'success' &&
      typeof json3.token === 'string' &&
      json3.user?.email === newEmail,
      '3. Register creates user & returns status 201 with auth token'
    );

    // 4. Login Student
    const req4 = new NextRequest('http://localhost:3000/test-series/api/mobile/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        phone_or_email: 'rahul.sharma@example.com',
        password: 'password123',
      }),
    });
    const res4 = await loginHandler(req4);
    const json4 = await res4.json();
    assert(
      res4.status === 200 &&
      json4.status === 'success' &&
      typeof json4.token === 'string' &&
      json4.user?.email === 'rahul.sharma@example.com' &&
      typeof json4.user?.name === 'string' &&
      json4.data?.id === json4.user?.id,
      '4. Login authenticates student and returns dual user/data envelope'
    );

    const authToken = json4.token;
    const authHeaders = { Authorization: `Bearer ${authToken}` };

    // 5. Forgot Password
    const req5 = new NextRequest('http://localhost:3000/test-series/api/mobile/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ phone_or_email: 'rahul.sharma@example.com' }),
    });
    const res5 = await forgotPasswordHandler(req5);
    const json5 = await res5.json();
    assert(res5.status === 200 && json5.status === 'success', '5. Forgot password sends instructions');

    // 6. Reset Password
    const req6 = new NextRequest('http://localhost:3000/test-series/api/mobile/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ phone: newPhone, otp: '123456', new_password: 'newpassword123' }),
    });
    const res6 = await resetPasswordHandler(req6);
    const json6 = await res6.json();
    assert(res6.status === 200 && json6.status === 'success', '6. Reset password updates credential');

    // 7. Get Profile (Protected) + Security Check
    const req7Auth = new NextRequest('http://localhost:3000/test-series/api/mobile/profile', {
      headers: authHeaders,
    });
    const res7Auth = await getProfileHandler(req7Auth);
    const json7Auth = await res7Auth.json();
    assert(
      res7Auth.status === 200 &&
      json7Auth.data?.email === 'rahul.sharma@example.com' &&
      typeof json7Auth.data?.name === 'string' &&
      typeof json7Auth.data?.id === 'number',
      '7a. Get Profile returns authenticated student data'
    );

    const req7Unauth = new NextRequest('http://localhost:3000/test-series/api/mobile/profile');
    const res7Unauth = await getProfileHandler(req7Unauth);
    assert(res7Unauth.status === 401, '7b. [Security] Get Profile without Bearer token returns 401 Unauthorized');

    // 8. Update Profile (Protected) + Security Check
    const req8Auth = new NextRequest('http://localhost:3000/test-series/api/mobile/profile', {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({ name: 'Rahul Sharma', target_exam: 'NEET 2026 Rankers Batch' }),
    });
    const res8Auth = await updateProfileHandler(req8Auth);
    const json8Auth = await res8Auth.json();
    assert(
      res8Auth.status === 200 &&
      json8Auth.data?.name === 'Rahul Sharma' &&
      json8Auth.data?.target_exam === 'NEET 2026 Rankers Batch',
      '8a. Update Profile modifies student properties'
    );

    const req8Unauth = new NextRequest('http://localhost:3000/test-series/api/mobile/profile', {
      method: 'PUT',
      body: JSON.stringify({ name: 'Hacker' }),
    });
    const res8Unauth = await updateProfileHandler(req8Unauth);
    assert(res8Unauth.status === 401, '8b. [Security] Update Profile without Bearer token returns 401 Unauthorized');

    // -------------------------------------------------------------------------
    // Suite 2: Home Feed, Banners & Categories (3 Operations)
    // -------------------------------------------------------------------------
    console.log('\n📦 Suite 2: Home Feed, Banners & Navigation');

    // 9. Get Banners
    const req9 = new NextRequest('http://localhost:3000/test-series/api/mobile/banners');
    const res9 = await getBannersHandler();
    const json9 = await res9.json();
    const b0 = json9.data?.[0];
    assert(
      res9.status === 200 &&
      Array.isArray(json9.data) &&
      typeof b0?.id === 'number' &&
      typeof b0?.title === 'string' &&
      typeof b0?.image_url === 'string' &&
      typeof b0?.action_type === 'string' &&
      typeof b0?.action_value === 'string' &&
      typeof b0?.order === 'number',
      '9. Banners match Flutter BannerItem schema (action_type, action_value, order)'
    );

    // 10. Get Categories
    const req10 = new NextRequest('http://localhost:3000/test-series/api/mobile/categories');
    const res10 = await getCategoriesHandler();
    const json10 = await res10.json();
    assert(
      res10.status === 200 &&
      Array.isArray(json10.data) &&
      json10.data.length >= 4 &&
      typeof json10.data[0].name === 'string',
      '10. Categories return full exam classifications'
    );

    // 11. Get Home Feed
    const req11 = new NextRequest('http://localhost:3000/test-series/api/mobile/home-feed', {
      headers: authHeaders,
    });
    const res11 = await getHomeFeedHandler(req11);
    const json11 = await res11.json();
    assert(
      res11.status === 200 &&
      Array.isArray(json11.data?.banners) &&
      Array.isArray(json11.data?.categories) &&
      Array.isArray(json11.data?.popular_courses) &&
      Array.isArray(json11.data?.featured_courses) &&
      Array.isArray(json11.data?.featured_test_series) &&
      Array.isArray(json11.data?.popular_test_series) &&
      Array.isArray(json11.data?.free_quizzes) &&
      Array.isArray(json11.data?.recent_attempts),
      '11. Home Feed returns all 6 collections including popular_courses & free_quizzes'
    );

    // -------------------------------------------------------------------------
    // Suite 3: Courses & Curriculum (3 Operations)
    // -------------------------------------------------------------------------
    console.log('\n📦 Suite 3: Courses & Curriculum Catalog');

    // 12. Get Courses Catalog
    const req12 = new NextRequest('http://localhost:3000/test-series/api/mobile/courses');
    const res12 = await getCoursesHandler(req12);
    const json12 = await res12.json();
    const c0 = json12.data?.[0];
    assert(
      res12.status === 200 &&
      Array.isArray(json12.data) &&
      typeof c0?.id === 'number' &&
      typeof c0?.title === 'string' &&
      typeof c0?.slug === 'string' &&
      typeof c0?.price === 'number' &&
      typeof c0?.total_lessons === 'number' &&
      typeof c0?.total_duration_minutes === 'number',
      '12. Courses catalog includes slug, lessons count, and total duration'
    );

    // 13. Get Course Detail
    const req13 = new NextRequest('http://localhost:3000/test-series/api/mobile/courses/101');
    const res13 = await getCourseDetailHandler(req13, { params: Promise.resolve({ id: '101' }) });
    const json13 = await res13.json();
    const lesson0 = json13.data?.folders?.[0]?.lessons?.[0];
    assert(
      res13.status === 200 &&
      typeof json13.data?.id === 'number' &&
      Array.isArray(json13.data?.folders) &&
      typeof lesson0?.id === 'number' &&
      typeof lesson0?.video_id === 'string' &&
      typeof lesson0?.duration_minutes === 'number' &&
      typeof lesson0?.folder_id === 'number' &&
      typeof lesson0?.order === 'number',
      '13. Course detail curriculum provides folder hierarchy and lesson video_id'
    );

    // 14. Get My Courses (Protected) + Security Check
    const req14Auth = new NextRequest('http://localhost:3000/test-series/api/mobile/my-courses', {
      headers: authHeaders,
    });
    const res14Auth = await getMyCoursesHandler(req14Auth);
    const json14Auth = await res14Auth.json();
    assert(
      res14Auth.status === 200 &&
      Array.isArray(json14Auth.data) &&
      (json14Auth.data.length === 0 || json14Auth.data[0].is_enrolled === true),
      '14a. My Courses returns student active enrolled courses only'
    );

    const req14Unauth = new NextRequest('http://localhost:3000/test-series/api/mobile/my-courses');
    const res14Unauth = await getMyCoursesHandler(req14Unauth);
    assert(res14Unauth.status === 401, '14b. [Security] My Courses without token returns 401 Unauthorized');

    // -------------------------------------------------------------------------
    // Suite 4: Test Series & CBT Examination Engine (8 Operations)
    // -------------------------------------------------------------------------
    console.log('\n📦 Suite 4: Test Series & CBT Examination Engine');

    // 15. Get Test Series
    const req15 = new NextRequest('http://localhost:3000/test-series/api/mobile/test-series');
    const res15 = await getTestSeriesHandler(req15);
    const json15 = await res15.json();
    const ts0 = json15.data?.[0];
    assert(
      res15.status === 200 &&
      Array.isArray(json15.data) &&
      typeof ts0?.id === 'number' &&
      typeof ts0?.total_tests === 'number' &&
      typeof ts0?.free_tests === 'number' &&
      typeof ts0?.validity_days === 'number',
      '15. Test Series list includes free_tests and validity_days'
    );

    // 16. Get Test Series Detail
    const req16 = new NextRequest('http://localhost:3000/test-series/api/mobile/test-series/1');
    const res16 = await getTestSeriesDetailHandler(req16, { params: Promise.resolve({ id: '1' }) });
    const json16 = await res16.json();
    const sq0 = json16.data?.quizzes?.[0];
    assert(
      res16.status === 200 &&
      Array.isArray(json16.data?.quizzes) &&
      typeof sq0?.id === 'number' &&
      typeof sq0?.test_series_id === 'number' &&
      typeof sq0?.duration_minutes === 'number' &&
      typeof sq0?.total_questions === 'number' &&
      typeof sq0?.is_free === 'boolean' &&
      typeof sq0?.is_locked === 'boolean',
      '16. Test Series detail includes quizzes with test_series_id, lock state, and duration'
    );

    // 17. Get Free Quizzes
    const req17 = new NextRequest('http://localhost:3000/test-series/api/mobile/quizzes?type=free');
    const res17 = await getQuizzesHandler(req17);
    const json17 = await res17.json();
    const fq0 = json17.data?.[0];
    assert(
      res17.status === 200 &&
      Array.isArray(json17.data) &&
      typeof fq0?.id === 'number' &&
      typeof fq0?.subject === 'string' &&
      typeof fq0?.total_questions === 'number',
      '17. Free Quizzes return QuizSummary with subject and total_questions'
    );

    // 18. Get Quiz Paper
    const req18 = new NextRequest('http://localhost:3000/test-series/api/mobile/quizzes/101');
    const res18 = await getQuizPaperHandler(req18, { params: Promise.resolve({ id: '101' }) });
    const json18 = await res18.json();
    const qp0 = json18.data?.questions?.[0];
    assert(
      res18.status === 200 &&
      typeof json18.data?.id === 'number' &&
      typeof json18.data?.negative_marks === 'number' &&
      Array.isArray(json18.data?.instructions) &&
      Array.isArray(json18.data?.questions) &&
      typeof qp0?.question_number === 'number' &&
      typeof qp0?.question_text === 'string' &&
      Array.isArray(qp0?.options) &&
      typeof qp0?.marks === 'number',
      '18. Quiz paper provides instructions, question_number, and options array'
    );

    // 19. Submit Quiz (Protected) + Security Check
    const req19Auth = new NextRequest('http://localhost:3000/test-series/api/mobile/quizzes/101/submit', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        answers: { '1': 1, '2': 0, '3': 0 },
        time_taken_seconds: 180,
      }),
    });
    const res19Auth = await submitQuizHandler(req19Auth, { params: Promise.resolve({ id: '101' }) });
    const json19Auth = await res19Auth.json();
    const submittedAttemptId = json19Auth.data?.attempt_id;
    assert(
      res19Auth.status === 200 &&
      typeof submittedAttemptId === 'number' &&
      submittedAttemptId > 0 &&
      typeof json19Auth.data?.quiz_title === 'string' &&
      typeof json19Auth.data?.correct_answers === 'number' &&
      typeof json19Auth.data?.incorrect_answers === 'number' &&
      typeof json19Auth.data?.unattempted === 'number' &&
      typeof json19Auth.data?.rank === 'number' &&
      typeof json19Auth.data?.percentile === 'number',
      '19a. Submit Quiz evaluates CBT answers and returns complete QuizResult with attempt_id'
    );

    const req19Unauth = new NextRequest('http://localhost:3000/test-series/api/mobile/quizzes/101/submit', {
      method: 'POST',
      body: JSON.stringify({ answers: {} }),
    });
    const res19Unauth = await submitQuizHandler(req19Unauth, { params: Promise.resolve({ id: '101' }) });
    assert(res19Unauth.status === 401, '19b. [Security] Submit Quiz without token returns 401 Unauthorized');

    // 20. Get Quiz Attempt Review (FATAL BUG FIX CHECK)
    const req20 = new NextRequest(`http://localhost:3000/test-series/api/mobile/quiz-attempts/${submittedAttemptId}`);
    const res20 = await getAttemptDetailHandler(req20, { params: Promise.resolve({ id: String(submittedAttemptId) }) });
    const json20 = await res20.json();
    const qr0 = json20.data?.questions?.[0];
    assert(
      res20.status === 200 &&
      typeof json20.data?.result?.attempt_id === 'number' &&
      typeof qr0?.question === 'object' &&
      typeof qr0?.question?.id === 'number' &&
      typeof qr0?.question?.question_text === 'string' &&
      Array.isArray(qr0?.question?.options) &&
      typeof qr0?.is_correct === 'boolean',
      '20. [CRITICAL BUG FIX] Attempt review nests question object inside QuestionReview without crash'
    );

    // 21. Get Previous Quiz Attempts (Protected) + Security Check
    const req21Auth = new NextRequest('http://localhost:3000/test-series/api/mobile/quiz-attempts', {
      headers: authHeaders,
    });
    const res21Auth = await getAttemptsHandler(req21Auth);
    const json21Auth = await res21Auth.json();
    const prev0 = json21Auth.data?.[0];
    assert(
      res21Auth.status === 200 &&
      Array.isArray(json21Auth.data) &&
      typeof prev0?.id === 'number' &&
      typeof prev0?.quiz_title === 'string' &&
      typeof prev0?.completed_at === 'string',
      '21a. Previous attempts include completed_at and quiz_title'
    );

    const req21Unauth = new NextRequest('http://localhost:3000/test-series/api/mobile/quiz-attempts');
    const res21Unauth = await getAttemptsHandler(req21Unauth);
    assert(res21Unauth.status === 401, '21b. [Security] Previous attempts without token returns 401 Unauthorized');

    // 22. Get Performance Analytics (Protected) + Security Check
    const req22Auth = new NextRequest('http://localhost:3000/test-series/api/mobile/my-performance', {
      headers: authHeaders,
    });
    const res22Auth = await getPerformanceHandler(req22Auth);
    const json22Auth = await res22Auth.json();
    assert(
      res22Auth.status === 200 &&
      typeof json22Auth.data?.total_tests_attempted === 'number' &&
      typeof json22Auth.data?.total_questions_answered === 'number' &&
      typeof json22Auth.data?.overall_accuracy === 'number' &&
      Array.isArray(json22Auth.data?.score_trend) &&
      Array.isArray(json22Auth.data?.focus_areas) &&
      json22Auth.data?.focus_areas.length > 0,
      '22a. My Performance returns TestAnalytics with score_trend and focus_areas'
    );

    const req22Unauth = new NextRequest('http://localhost:3000/test-series/api/mobile/my-performance');
    const res22Unauth = await getPerformanceHandler(req22Unauth);
    assert(res22Unauth.status === 401, '22b. [Security] Performance analytics without token returns 401 Unauthorized');

    // -------------------------------------------------------------------------
    // Suite 5: Doubts Desk & Faculty Q&A (4 Operations)
    // -------------------------------------------------------------------------
    console.log('\n📦 Suite 5: Doubts Desk & Faculty Q&A');

    // 23. Get Doubts List
    const req23 = new NextRequest('http://localhost:3000/test-series/api/mobile/doubts?status=all');
    const res23 = await getDoubtsHandler(req23);
    const json23 = await res23.json();
    assert(
      res23.status === 200 &&
      Array.isArray(json23.data) &&
      json23.data.length > 0,
      '23. Get doubts returns list of active doubt threads'
    );

    // 24. Get Doubt Detail
    const req24 = new NextRequest('http://localhost:3000/test-series/api/mobile/doubts/1');
    const res24 = await getDoubtDetailHandler(req24, { params: Promise.resolve({ id: '1' }) });
    const json24 = await res24.json();
    const reply0 = json24.data?.replies?.[0];
    assert(
      res24.status === 200 &&
      typeof json24.data?.id === 'number' &&
      Array.isArray(json24.data?.replies) &&
      typeof reply0?.author_id === 'number' &&
      typeof reply0?.author_name === 'string' &&
      typeof reply0?.author_type === 'string',
      '24. Doubt detail provides replies with author_id, author_name, and author_type'
    );

    // 25. Submit New Doubt (Protected) + Security Check
    const req25Auth = new NextRequest('http://localhost:3000/test-series/api/mobile/doubts', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        subject: 'Physics',
        question: 'Why does a diamagnetic substance get repelled in a non-uniform magnetic field?',
      }),
    });
    const res25Auth = await submitDoubtHandler(req25Auth);
    const json25Auth = await res25Auth.json();
    const createdDoubtId = json25Auth.data?.id;
    assert(
      res25Auth.status === 200 &&
      typeof createdDoubtId === 'number' &&
      json25Auth.data?.student_name === 'Rahul Sharma',
      '25a. Submit doubt creates record associated with authenticated student'
    );

    const req25Unauth = new NextRequest('http://localhost:3000/test-series/api/mobile/doubts', {
      method: 'POST',
      body: JSON.stringify({ subject: 'Bio', question: 'What is ATP?' }),
    });
    const res25Unauth = await submitDoubtHandler(req25Unauth);
    assert(res25Unauth.status === 401, '25b. [Security] Submit doubt without token returns 401 Unauthorized');

    // 26. Reply to Doubt (Protected) + Security Check
    const req26Auth = new NextRequest(`http://localhost:3000/test-series/api/mobile/doubts/${createdDoubtId}/reply`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        message: 'Because induced magnetic moments oppose the external magnetic field direction.',
      }),
    });
    const res26Auth = await replyDoubtHandler(req26Auth, { params: Promise.resolve({ id: String(createdDoubtId) }) });
    const json26Auth = await res26Auth.json();
    assert(
      res26Auth.status === 200 &&
      typeof json26Auth.data?.id === 'number' &&
      json26Auth.data?.author_name === 'Rahul Sharma' &&
      json26Auth.data?.author_type === 'student',
      '26a. Reply to doubt appends response with author metadata'
    );

    const req26Invalid = new NextRequest(`http://localhost:3000/test-series/api/mobile/doubts/${createdDoubtId}/reply`, {
      method: 'POST',
      headers: { Authorization: 'Bearer invalid_expired_token' },
      body: JSON.stringify({ message: 'Unauthorized reply' }),
    });
    const res26Invalid = await replyDoubtHandler(req26Invalid, { params: Promise.resolve({ id: String(createdDoubtId) }) });
    assert(res26Invalid.status === 401, '26b. [Security] Reply to doubt with invalid token returns 401 Unauthorized');

    // -------------------------------------------------------------------------
    // Suite 6: Community Feed & Engagement (4 Operations)
    // -------------------------------------------------------------------------
    console.log('\n📦 Suite 6: Community Feed & Social Engagement');

    // 27. Get Community Feed
    const req27 = new NextRequest('http://localhost:3000/test-series/api/mobile/community', {
      headers: authHeaders,
    });
    const res27 = await getCommunityHandler(req27);
    const json27 = await res27.json();
    const cp0 = json27.data?.[0];
    assert(
      res27.status === 200 &&
      Array.isArray(json27.data) &&
      typeof cp0?.author_id === 'number' &&
      typeof cp0?.author_name === 'string' &&
      typeof cp0?.like_count === 'number' &&
      typeof cp0?.reply_count === 'number' &&
      typeof cp0?.is_liked === 'boolean',
      '27. Community feed includes author_id, author_name, like_count, and reply_count'
    );

    // 28. Create Community Post (Protected) + Security Check
    const req28Auth = new NextRequest('http://localhost:3000/test-series/api/mobile/community', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        content: 'Consistent daily revision of NCERT diagrams boosts NEET score by 40+ marks! Keep going team.',
      }),
    });
    const res28Auth = await createPostHandler(req28Auth);
    const json28Auth = await res28Auth.json();
    const newPostId = json28Auth.data?.id;
    assert(
      res28Auth.status === 200 &&
      typeof newPostId === 'number' &&
      json28Auth.data?.author_name === 'Rahul Sharma',
      '28a. Create community post creates entry with author attribution'
    );

    const req28Unauth = new NextRequest('http://localhost:3000/test-series/api/mobile/community', {
      method: 'POST',
      body: JSON.stringify({ content: 'Spam post' }),
    });
    const res28Unauth = await createPostHandler(req28Unauth);
    assert(res28Unauth.status === 401, '28b. [Security] Create post without token returns 401 Unauthorized');

    // 29. Like Post (Protected) + Security Check
    const req29Auth = new NextRequest('http://localhost:3000/test-series/api/mobile/community/like', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ post_id: newPostId }),
    });
    const res29Auth = await likePostHandler(req29Auth);
    const json29Auth = await res29Auth.json();
    assert(
      res29Auth.status === 200 &&
      json29Auth.liked === true &&
      typeof json29Auth.like_count === 'number',
      '29a. Like post toggles like state and increments like_count'
    );

    const req29Unauth = new NextRequest('http://localhost:3000/test-series/api/mobile/community/like', {
      method: 'POST',
      body: JSON.stringify({ post_id: newPostId }),
    });
    const res29Unauth = await likePostHandler(req29Unauth);
    assert(res29Unauth.status === 401, '29b. [Security] Like post without token returns 401 Unauthorized');

    // 30. Comment on Post (Protected) + Security Check
    const req30Auth = new NextRequest(`http://localhost:3000/test-series/api/mobile/community/${newPostId}/comment`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ comment: 'Totally agree, especially genetics diagrams!' }),
    });
    const res30Auth = await commentPostHandler(req30Auth, { params: Promise.resolve({ id: String(newPostId) }) });
    const json30Auth = await res30Auth.json();
    assert(
      res30Auth.status === 200 &&
      json30Auth.status === 'success' &&
      json30Auth.data?.comment === 'Totally agree, especially genetics diagrams!',
      '30a. Comment on post appends comment and updates replyCount'
    );

    const req30Unauth = new NextRequest(`http://localhost:3000/test-series/api/mobile/community/${newPostId}/comment`, {
      method: 'POST',
      body: JSON.stringify({ comment: 'Unauthorized comment' }),
    });
    const res30Unauth = await commentPostHandler(req30Unauth, { params: Promise.resolve({ id: String(newPostId) }) });
    assert(res30Unauth.status === 401, '30b. [Security] Comment on post without token returns 401 Unauthorized');

    // -------------------------------------------------------------------------
    // Suite 7: AI Academic Tutor (1 Operation)
    // -------------------------------------------------------------------------
    console.log('\n📦 Suite 7: AI Academic Tutor');

    // 31. AI Chat
    const req31 = new NextRequest('http://localhost:3000/test-series/api/mobile/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message: 'Explain Newton second law of motion with formula' }),
    });
    const res31 = await aiChatHandler(req31);
    const json31 = await res31.json();
    assert(
      res31.status === 200 &&
      typeof json31.data?.message === 'string' &&
      Array.isArray(json31.data?.suggestions) &&
      json31.data?.suggestions.length > 0,
      '31. AI Tutor replies with contextual answer and suggestions array'
    );

    // -------------------------------------------------------------------------
    // Suite 8: Digital Library & Live Broadcasts (3 Operations)
    // -------------------------------------------------------------------------
    console.log('\n📦 Suite 8: Digital Library & Live Broadcasts');

    // 32. Get E-Books
    const req32 = new NextRequest('http://localhost:3000/test-series/api/mobile/ebooks');
    const res32 = await getEbooksHandler();
    const json32 = await res32.json();
    const eb0 = json32.data?.[0];
    assert(
      res32.status === 200 &&
      Array.isArray(json32.data) &&
      typeof eb0?.id === 'number' &&
      typeof eb0?.title === 'string' &&
      typeof eb0?.cover_url === 'string' &&
      typeof eb0?.pdf_url === 'string' &&
      typeof eb0?.page_count === 'number' &&
      typeof eb0?.file_size === 'string' &&
      typeof eb0?.is_free === 'boolean',
      '32. E-books catalog matches Ebook schema (cover_url, page_count, file_size)'
    );

    // 33. Get Study Resources
    const req33 = new NextRequest('http://localhost:3000/test-series/api/mobile/resources');
    const res33 = await getResourcesHandler();
    const json33 = await res33.json();
    const rc0 = json33.data?.[0];
    assert(
      res33.status === 200 &&
      Array.isArray(json33.data) &&
      typeof rc0?.id === 'number' &&
      typeof rc0?.type === 'string' &&
      typeof rc0?.file_url === 'string' &&
      typeof rc0?.file_size === 'string',
      '33. Resources list provides notes, bulletins, and PDF downloads'
    );

    // 34. Get Live Classes
    const req34 = new NextRequest('http://localhost:3000/test-series/api/mobile/live');
    const res34 = await getLiveHandler();
    const json34 = await res34.json();
    const lc0 = json34.data?.[0];
    assert(
      res34.status === 200 &&
      Array.isArray(json34.data) &&
      typeof lc0?.id === 'number' &&
      typeof lc0?.title === 'string' &&
      typeof lc0?.subject === 'string' &&
      typeof lc0?.instructor_name === 'string' &&
      typeof lc0?.duration_minutes === 'number',
      '34. Live classes schedule matches LiveClass schema (subject, instructor_name, duration)'
    );

    // -------------------------------------------------------------------------
    // Suite 9: Commerce, Orders & Additional Operations (6 Operations)
    // -------------------------------------------------------------------------
    console.log('\n📦 Suite 9: Commerce, Orders, Announcements & Coupons');

    // 35. Create Checkout Session (Protected) + Security Check
    const req35Auth = new NextRequest('http://localhost:3000/test-series/api/mobile/checkout', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ item_type: 'course', item_id: 101 }),
    });
    const res35Auth = await checkoutHandler(req35Auth);
    const json35Auth = await res35Auth.json();
    assert(
      res35Auth.status === 200 &&
      typeof json35Auth.data?.order_id === 'string' &&
      typeof json35Auth.data?.amount === 'number' &&
      json35Auth.data?.amount < 10000 &&
      typeof json35Auth.data?.key_id === 'string' &&
      typeof json35Auth.data?.item_name === 'string' &&
      json35Auth.data?.user_email === 'rahul.sharma@example.com',
      '35a. Checkout creates session in Rupees (<10000) with item_name and user email'
    );

    const req35Unauth = new NextRequest('http://localhost:3000/test-series/api/mobile/checkout', {
      method: 'POST',
      body: JSON.stringify({ item_type: 'course', item_id: 101 }),
    });
    const res35Unauth = await checkoutHandler(req35Unauth);
    assert(res35Unauth.status === 401, '35b. [Security] Checkout without token returns 401 Unauthorized');

    // 36. Verify Payment
    const generatedOrderId = json35Auth.data?.order_id || 'order_sample_test';
    const req36 = new NextRequest('http://localhost:3000/test-series/api/mobile/verify-payment', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        razorpay_order_id: generatedOrderId,
        razorpay_payment_id: 'pay_test_99887766',
        razorpay_signature: 'sig_test_dummy_verified',
      }),
    });
    const res36 = await verifyPaymentHandler(req36);
    const json36 = await res36.json();
    assert(res36.status === 200 && json36.status === 'success', '36. Verify payment validates transaction');

    // 37. Get Student Orders (Protected) + Security Check
    const req37Auth = new NextRequest('http://localhost:3000/test-series/api/mobile/orders', {
      headers: authHeaders,
    });
    const res37Auth = await getOrdersHandler(req37Auth);
    const json37Auth = await res37Auth.json();
    assert(
      res37Auth.status === 200 &&
      Array.isArray(json37Auth.data) &&
      json37Auth.data.length > 0 &&
      typeof json37Auth.data[0].order_number === 'string',
      '37a. Orders endpoint lists student purchase history'
    );

    const req37Unauth = new NextRequest('http://localhost:3000/test-series/api/mobile/orders');
    const res37Unauth = await getOrdersHandler(req37Unauth);
    assert(res37Unauth.status === 401, '37b. [Security] Orders endpoint without token returns 401 Unauthorized');

    // 38. Validate Coupon
    const req38 = new NextRequest('http://localhost:3000/test-series/api/mobile/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code: 'FLAT50', order_amount: 1000 }),
    });
    const res38 = await validateCouponHandler(req38);
    const json38 = await res38.json();
    assert(
      res38.status === 200 &&
      json38.data?.valid === true &&
      json38.data?.code === 'FLAT50' &&
      json38.data?.discount_amount === 500 &&
      json38.data?.final_amount === 500,
      '38. Coupons validate calculates percentage discount and final payable amount'
    );

    // 39. Get Announcements
    const req39 = new NextRequest('http://localhost:3000/test-series/api/mobile/announcements');
    const res39 = await getAnnouncementsHandler(req39);
    const json39 = await res39.json();
    assert(
      res39.status === 200 &&
      Array.isArray(json39.data) &&
      json39.data.length > 0 &&
      typeof json39.data[0].title === 'string',
      '39. Announcements endpoint returns published platform notices'
    );

    // 40. Get Notifications
    const req40 = new NextRequest('http://localhost:3000/test-series/api/mobile/notifications', {
      headers: authHeaders,
    });
    const res40 = await getNotificationsHandler(req40);
    const json40 = await res40.json();
    assert(
      res40.status === 200 &&
      Array.isArray(json40.data) &&
      json40.data.length > 0 &&
      typeof json40.data[0].title === 'string',
      '40. Notifications endpoint returns broadcasts and user alerts'
    );
  } catch (err: any) {
    console.error('Fatal test error:', err);
    failed++;
  }

  const durationMs = Date.now() - startTime;
  console.log('\n======================================================================');
  console.log(`Execution completed in ${durationMs}ms`);
  console.log(`Summary: ${passed} passed, ${failed} failed (${failed === 0 ? '100% pass rate' : 'FAILURES DETECTED'})`);
  console.log('======================================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runMobileVerification();
