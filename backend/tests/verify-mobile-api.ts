import { NextRequest } from 'next/server';
import prisma from '../src/lib/prisma';

// Import route handlers
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

async function runTests() {
  console.log('====================================================');
  console.log('🚀 Running Mobile API 31-Endpoint Verification Suite');
  console.log('====================================================');
  let passed = 0;
  let failed = 0;

  function assert(cond: boolean, msg: string) {
    if (cond) {
      console.log(`✅ PASSED: ${msg}`);
      passed++;
    } else {
      console.error(`❌ FAILED: ${msg}`);
      failed++;
    }
  }

  try {
    // 1. Auth Flow: Send OTP
    const otpReq = new NextRequest('http://localhost:3000/test-series/api/mobile/auth/signup/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone: '9876543210' }),
    });
    const otpRes = await sendOtpHandler(otpReq);
    const otpJson = await otpRes.json();
    assert(otpJson.status === 'success', 'Send OTP returns success');

    // 2. Verify OTP
    const verifyReq = new NextRequest('http://localhost:3000/test-series/api/mobile/auth/signup/verify', {
      method: 'POST',
      body: JSON.stringify({ phone: '9876543210', otp: '123456' }),
    });
    const verifyRes = await verifyOtpHandler(verifyReq);
    const verifyJson = await verifyRes.json();
    assert(verifyJson.status === 'success' && verifyJson.token, 'Verify OTP returns auth token');

    const authToken = verifyJson.token;
    const authHeaders = { Authorization: `Bearer ${authToken}` };

    // 3. Register Student with Unique Phone/Email
    const uniqueNum = Date.now().toString().slice(-6);
    const regReq = new NextRequest('http://localhost:3000/test-series/api/mobile/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test Mobile User',
        email: `student_${uniqueNum}@example.com`,
        phone: `91${uniqueNum}01`,
        password: 'Password123!',
      }),
    });
    const regRes = await registerHandler(regReq);
    const regJson = await regRes.json();
    assert(regJson.status === 'success' && regJson.user.name === 'Test Mobile User', 'Register new student creates user & token');

    // 4. Login Student
    const loginReq = new NextRequest('http://localhost:3000/test-series/api/mobile/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        phone_or_email: `student_${uniqueNum}@example.com`,
        password: 'Password123!',
      }),
    });
    const loginRes = await loginHandler(loginReq);
    const loginJson = await loginRes.json();
    assert(loginJson.status === 'success' && loginJson.user.email === `student_${uniqueNum}@example.com`, 'Login with email returns token');

    // 5. Get & Update Profile
    const profReq = new NextRequest('http://localhost:3000/test-series/api/mobile/profile', { headers: authHeaders });
    const profRes = await getProfileHandler(profReq);
    const profJson = await profRes.json();
    assert(profJson.status === 'success' && profJson.data.id, 'Get Profile returns current student');

    const updateProfReq = new NextRequest('http://localhost:3000/test-series/api/mobile/profile', {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({ target_exam: 'NEET 2027', name: 'Updated Student Name' }),
    });
    const updateProfRes = await updateProfileHandler(updateProfReq);
    const updateProfJson = await updateProfRes.json();
    assert(updateProfJson.status === 'success' && updateProfJson.data.target_exam === 'NEET 2027', 'Update profile updates student properties');

    // 6. Banners
    const bannersRes = await getBannersHandler();
    const bannersJson = await bannersRes.json();
    assert(bannersJson.status === 'success' && Array.isArray(bannersJson.data), 'Get Banners returns array');

    // 7. Categories
    const catRes = await getCategoriesHandler();
    const catJson = await catRes.json();
    assert(catJson.status === 'success' && Array.isArray(catJson.data), 'Get Categories returns array');

    // 8. Home Feed
    const homeReq = new NextRequest('http://localhost:3000/test-series/api/mobile/home-feed', {
      headers: authHeaders,
    });
    const homeRes = await getHomeFeedHandler(homeReq);
    const homeJson = await homeRes.json();
    assert(
      homeJson.status === 'success' &&
        Array.isArray(homeJson.data.banners) &&
        Array.isArray(homeJson.data.featured_courses),
      'Get Home Feed returns aggregated dashboard data'
    );

    // 9. Courses & Course Detail
    const coursesReq = new NextRequest('http://localhost:3000/test-series/api/mobile/courses');
    const coursesRes = await getCoursesHandler(coursesReq);
    const coursesJson = await coursesRes.json();
    assert(coursesJson.status === 'success' && coursesJson.data.length > 0, 'Get Courses returns catalog');

    const firstCourse = coursesJson.data[0];
    const courseDetailReq = new NextRequest(`http://localhost:3000/test-series/api/mobile/courses/${firstCourse.id}`);
    const courseDetailRes = await getCourseDetailHandler(courseDetailReq, {
      params: Promise.resolve({ id: String(firstCourse.id) }),
    });
    const courseDetailJson = await courseDetailRes.json();
    assert(courseDetailJson.status === 'success' && Array.isArray(courseDetailJson.data.folders), 'Course detail includes curriculum folders');

    // 10. My Courses
    const myCoursesReq = new NextRequest('http://localhost:3000/test-series/api/mobile/my-courses', { headers: authHeaders });
    const myCoursesRes = await getMyCoursesHandler(myCoursesReq);
    const myCoursesJson = await myCoursesRes.json();
    assert(myCoursesJson.status === 'success' && Array.isArray(myCoursesJson.data), 'My Courses returns student course roster');

    // 11. Test Series List & Detail
    const tsReq = new NextRequest('http://localhost:3000/test-series/api/mobile/test-series');
    const tsRes = await getTestSeriesHandler(tsReq);
    const tsJson = await tsRes.json();
    assert(tsJson.status === 'success' && tsJson.data.length > 0, 'Get Test Series returns list');

    const firstSeries = tsJson.data[0];
    const tsDetailReq = new NextRequest(`http://localhost:3000/test-series/api/mobile/test-series/${firstSeries.id}`);
    const tsDetailRes = await getTestSeriesDetailHandler(tsDetailReq, {
      params: Promise.resolve({ id: String(firstSeries.id) }),
    });
    const tsDetailJson = await tsDetailRes.json();
    assert(tsDetailJson.status === 'success' && Array.isArray(tsDetailJson.data.quizzes), 'Test Series detail includes quizzes');

    // 12. Quizzes & Quiz Paper
    const quizReq = new NextRequest('http://localhost:3000/test-series/api/mobile/quizzes?type=free');
    const quizRes = await getQuizzesHandler(quizReq);
    const quizJson = await quizRes.json();
    assert(quizJson.status === 'success' && quizJson.data.length > 0, 'Get Quizzes returns free quizzes');

    const quizItem = quizJson.data[0];
    const paperReq = new NextRequest(`http://localhost:3000/test-series/api/mobile/quizzes/${quizItem.id}`);
    const paperRes = await getQuizPaperHandler(paperReq, {
      params: Promise.resolve({ id: String(quizItem.id) }),
    });
    const paperJson = await paperRes.json();
    assert(paperJson.status === 'success' && Array.isArray(paperJson.data.questions), 'Quiz paper includes questions with choices');

    // 13. Submit Quiz & Score Calculation
    const questions = paperJson.data.questions;
    const answers: Record<string, string> = {};
    if (questions.length > 0) {
      answers[String(questions[0].id)] = questions[0].correct_answer || 'A';
    }
    const submitReq = new NextRequest(`http://localhost:3000/test-series/api/mobile/quizzes/${quizItem.id}/submit`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        answers,
        time_taken_seconds: 125,
      }),
    });
    const submitRes = await submitQuizHandler(submitReq, {
      params: Promise.resolve({ id: String(quizItem.id) }),
    });
    const submitJson = await submitRes.json();
    assert(submitJson.status === 'success' && submitJson.data.score !== undefined, 'Submit quiz calculates instant NTA score');

    const attemptId = submitJson.data.id;

    // 14. Quiz Attempts & Review
    const attemptsReq = new NextRequest('http://localhost:3000/test-series/api/mobile/quiz-attempts', { headers: authHeaders });
    const attemptsRes = await getAttemptsHandler(attemptsReq);
    const attemptsJson = await attemptsRes.json();
    assert(attemptsJson.status === 'success' && attemptsJson.data.length > 0, 'Get Quiz Attempts returns attempt history');

    const attemptDetailReq = new NextRequest(`http://localhost:3000/test-series/api/mobile/quiz-attempts/${attemptId}`);
    const attemptDetailRes = await getAttemptDetailHandler(attemptDetailReq, {
      params: Promise.resolve({ id: String(attemptId) }),
    });
    const attemptDetailJson = await attemptDetailRes.json();
    assert(
      attemptDetailJson.status === 'success' &&
        attemptDetailJson.data.result &&
        Array.isArray(attemptDetailJson.data.questions),
      'Attempt detail returns score result and question review breakdown'
    );

    // 15. My Performance Analytics
    const perfReq = new NextRequest('http://localhost:3000/test-series/api/mobile/my-performance', { headers: authHeaders });
    const perfRes = await getPerformanceHandler(perfReq);
    const perfJson = await perfRes.json();
    assert(perfJson.status === 'success' && perfJson.data.total_tests_attempted > 0, 'My Performance returns accuracy and test counts');

    // 16. Doubts Desk: Post Doubt, List, Detail, Reply
    const postDoubtReq = new NextRequest('http://localhost:3000/test-series/api/mobile/doubts', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        subject: 'Electromagnetism',
        question: 'What is the direction of magnetic force on a moving charge?',
      }),
    });
    const postDoubtRes = await submitDoubtHandler(postDoubtReq);
    const postDoubtJson = await postDoubtRes.json();
    assert(postDoubtJson.status === 'success' && postDoubtJson.data.id, 'Post doubt creates doubt record');

    const doubtId = postDoubtJson.data.id;
    const replyDoubtReq = new NextRequest(`http://localhost:3000/test-series/api/mobile/doubts/${doubtId}/reply`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ message: 'Use Fleming Left Hand Rule or Right-Hand Palm Rule!' }),
    });
    const replyDoubtRes = await replyDoubtHandler(replyDoubtReq, {
      params: Promise.resolve({ id: String(doubtId) }),
    });
    const replyDoubtJson = await replyDoubtRes.json();
    assert(replyDoubtJson.status === 'success' && replyDoubtJson.data.message, 'Reply to doubt appends reply');

    // 17. Community Feed, Like & Comment
    const createPostReq = new NextRequest('http://localhost:3000/test-series/api/mobile/community', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ content: 'Best strategy for revision before mock tests?' }),
    });
    const createPostRes = await createPostHandler(createPostReq);
    const createPostJson = await createPostRes.json();
    assert(createPostJson.status === 'success' && createPostJson.data.id, 'Create community post creates post');

    const postId = createPostJson.data.id;
    const likeReq = new NextRequest('http://localhost:3000/test-series/api/mobile/community/like', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ post_id: postId }),
    });
    const likeRes = await likePostHandler(likeReq);
    const likeJson = await likeRes.json();
    assert(likeJson.status === 'success', 'Like post toggles like state');

    const commentReq = new NextRequest(`http://localhost:3000/test-series/api/mobile/community/${postId}/comment`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ comment: 'Solve formula sheets daily in the morning!' }),
    });
    const commentRes = await commentPostHandler(commentReq, {
      params: Promise.resolve({ id: String(postId) }),
    });
    const commentJson = await commentRes.json();
    assert(commentJson.status === 'success', 'Comment post creates comment');

    // 18. AI Tutor Chat
    const aiReq = new NextRequest('http://localhost:3000/test-series/api/mobile/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message: 'Explain Newton third law of motion' }),
    });
    const aiRes = await aiChatHandler(aiReq);
    const aiJson = await aiRes.json();
    assert(aiJson.status === 'success' && aiJson.data.message.length > 10, 'AI Tutor responds with academic guidance');

    // 19. Ebooks, Resources & Live
    const ebooksRes = await getEbooksHandler();
    const ebooksJson = await ebooksRes.json();
    assert(ebooksJson.status === 'success' && Array.isArray(ebooksJson.data), 'Get Ebooks returns library');

    const resRes = await getResourcesHandler();
    const resJson = await resRes.json();
    assert(resJson.status === 'success' && Array.isArray(resJson.data), 'Get Resources returns notes & PDFs');

    const liveRes = await getLiveHandler();
    const liveJson = await liveRes.json();
    assert(liveJson.status === 'success' && Array.isArray(liveJson.data), 'Get Live Classes returns live sessions');

    // 20. Checkout & Verify Payment
    const checkoutReq = new NextRequest('http://localhost:3000/test-series/api/mobile/checkout', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ item_type: 'course', item_id: firstCourse.id }),
    });
    const checkoutRes = await checkoutHandler(checkoutReq);
    const checkoutJson = await checkoutRes.json();
    assert(checkoutJson.status === 'success' && checkoutJson.data.order_id, 'Create checkout session returns order ID');

    const verifyPayReq = new NextRequest('http://localhost:3000/test-series/api/mobile/verify-payment', {
      method: 'POST',
      body: JSON.stringify({
        razorpay_order_id: checkoutJson.data.order_id,
        razorpay_payment_id: 'pay_test_payment_998811',
        razorpay_signature: 'sig_mock_signature_abc123',
      }),
    });
    const verifyPayRes = await verifyPaymentHandler(verifyPayReq);
    const verifyPayJson = await verifyPayRes.json();
    assert(verifyPayJson.status === 'success', 'Verify payment activates enrollment');
  } catch (err: any) {
    console.error('Fatal test execution error:', err);
    failed++;
  }

  console.log('====================================================');
  console.log(`Summary: ${passed} passed, ${failed} failed`);
  console.log('====================================================');
  if (failed > 0) process.exit(1);
}

runTests();

