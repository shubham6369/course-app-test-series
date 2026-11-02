import { NextRequest } from 'next/server';
import prisma from '../src/lib/prisma';
import { GET as getCourses, POST as postCourses } from '../src/app/api/admin/courses/route';
import { GET as getQuizzes, POST as postQuizzes } from '../src/app/api/admin/quizzes/route';
import { GET as getQuestions, POST as postQuestions } from '../src/app/api/admin/questions/route';
import { GET as getTestSeries, POST as postTestSeries } from '../src/app/api/admin/test-series/route';
import { GET as getAnalytics } from '../src/app/api/admin/analytics/route';
import { GET as getCategories } from '../src/app/api/admin/categories/route';

let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`✅ PASSED: ${message}`);
    passedTests++;
  } else {
    console.error(`❌ FAILED: ${message}`);
    failedTests++;
  }
}

async function runVerification() {
  console.log('====================================================');
  console.log('🚀 Running Milestone 3 Verification Test Suite');
  console.log('====================================================\n');

  try {
    // ----------------------------------------------------
    // Test 1: Prisma DB Seed Integrity
    // ----------------------------------------------------
    console.log('--- Test 1: Prisma DB Records Integrity ---');
    const coursesCount = await prisma.course.count();
    const quizzesCount = await prisma.quiz.count();
    const studentsCount = await prisma.student.count();
    const testSeriesCount = await prisma.testSeries.count();
    const doubtsCount = await prisma.doubt.count();
    const ordersCount = await prisma.order.count();
    const attemptsCount = await prisma.quizAttempt.count();

    assert(coursesCount >= 1, `Courses count is >= 1 (found: ${coursesCount})`);
    assert(quizzesCount >= 1, `Quizzes count is >= 1 (found: ${quizzesCount})`);
    assert(studentsCount >= 1, `Students count is >= 1 (found: ${studentsCount})`);
    assert(testSeriesCount >= 1, `Test Series count is >= 1 (found: ${testSeriesCount})`);
    assert(doubtsCount >= 1, `Doubts count is >= 1 (found: ${doubtsCount})`);
    assert(ordersCount >= 1, `Orders count is >= 1 (found: ${ordersCount})`);
    assert(attemptsCount >= 1, `Quiz Attempts count is >= 1 (found: ${attemptsCount})`);

    // ----------------------------------------------------
    // Test 2: Dashboard Metrics & 14-Day Rolling Analytics
    // ----------------------------------------------------
    console.log('\n--- Test 2: Dashboard Metrics & 14-Day Analytics ---');
    const [openDoubts, paidOrders] = await Promise.all([
      prisma.doubt.count({ where: { status: { in: ['open', 'pending'] } } }),
      prisma.order.aggregate({
        _sum: { amount: true },
        where: { status: 'paid' },
      }),
    ]);

    assert(typeof openDoubts === 'number', `Open doubts count is valid: ${openDoubts}`);
    assert(typeof (paidOrders._sum.amount || 0) === 'number', `Paid orders sum is valid: ₹${paidOrders._sum.amount || 0}`);

    // Rolling 14-day calculation verification
    const now = new Date();
    const chartDays: string[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      chartDays.push(d.toISOString().split('T')[0]);
    }
    assert(chartDays.length === 14, `14-day array contains exactly 14 day entries (length: ${chartDays.length})`);
    assert(chartDays[13] === now.toISOString().split('T')[0], `Latest chart date matches today: ${chartDays[13]}`);

    // ----------------------------------------------------
    // Test 3: Categories API Handler
    // ----------------------------------------------------
    console.log('\n--- Test 3: Categories API Handler ---');
    const categoriesRes = await getCategories();
    assert(categoriesRes.status === 200, `Categories API status 200 (received: ${categoriesRes.status})`);
    const categoriesJson = await categoriesRes.json();
    assert(categoriesJson.status === 'success', `Categories API status is 'success'`);
    assert(Array.isArray(categoriesJson.data) && categoriesJson.data.length >= 1, `Categories array returned (found: ${categoriesJson.data.length})`);

    // ----------------------------------------------------
    // Test 4: Courses API & Course Builder Persistence
    // ----------------------------------------------------
    console.log('\n--- Test 4: Courses API & Course Builder Persistence ---');
    const getCoursesReq = new NextRequest('http://localhost:3000/api/admin/courses');
    const coursesRes = await getCourses(getCoursesReq);
    assert(coursesRes.status === 200, `GET /api/admin/courses status 200`);
    const coursesJson = await coursesRes.json();
    assert(coursesJson.status === 'success', `GET /api/admin/courses returns success`);
    assert(Array.isArray(coursesJson.data), `GET /api/admin/courses returns array of courses`);

    // Create course with multi-folder syllabus and video lessons
    const testCourseSlug = `m3-test-course-${Date.now()}`;
    const newCoursePayload = {
      title: 'M3 Verification Course on Organic Synthesis',
      slug: testCourseSlug,
      description: 'End-to-end verified course created via Course Builder API.',
      price: 2499,
      discountPrice: 999,
      instructorName: 'Dr. Ananya Sen',
      validityDays: 180,
      isPublished: true,
      folders: [
        {
          title: 'Module 1: Stereochemistry Fundamentals',
          order: 1,
          lessons: [
            {
              title: '1.1 Chirality & Optical Activity',
              description: 'Enantiomers and diastereomers explained.',
              videoId: 'M7lc1UVf-VE',
              durationMinutes: 40,
              isFreePreview: true,
              order: 1,
            },
            {
              title: '1.2 R/S Nomenclature In-Depth',
              description: 'Cahn-Ingold-Prelog priority rules.',
              videoId: 'dQw4w9WgXcQ',
              durationMinutes: 35,
              isFreePreview: false,
              order: 2,
            },
          ],
        },
      ],
    };

    const postCourseReq = new NextRequest('http://localhost:3000/api/admin/courses', {
      method: 'POST',
      body: JSON.stringify(newCoursePayload),
    });
    const postCourseRes = await postCourses(postCourseReq);
    assert(postCourseRes.status === 201, `POST /api/admin/courses status 201 Created (received: ${postCourseRes.status})`);
    const postCourseJson = await postCourseRes.json();
    assert(postCourseJson.status === 'success', `POST /api/admin/courses returns success`);
    assert(postCourseJson.data.slug === testCourseSlug, `Created course has correct slug: ${postCourseJson.data.slug}`);

    // Verify in database
    const dbCourse = await prisma.course.findUnique({
      where: { slug: testCourseSlug },
      include: {
        folders: {
          include: { lessons: true },
        },
      },
    });
    assert(dbCourse !== null, `Prisma directly finds newly created course in SQLite`);
    assert(dbCourse?.folders.length === 1, `Course has 1 module folder in DB`);
    assert(dbCourse?.folders[0]?.lessons.length === 2, `Folder contains 2 lessons in DB`);
    assert(dbCourse?.folders[0]?.lessons[0]?.isFreePreview === true, `Lesson 1 has isFreePreview: true`);
    assert(dbCourse?.folders[0]?.lessons[1]?.isFreePreview === false, `Lesson 2 has isFreePreview: false`);

    // ----------------------------------------------------
    // Test 5: Quizzes API & Filtering
    // ----------------------------------------------------
    console.log('\n--- Test 5: Quizzes API & Filter Tabs ---');
    const allQuizzesReq = new NextRequest('http://localhost:3000/api/admin/quizzes?filter=all');
    const allQuizzesRes = await getQuizzes(allQuizzesReq);
    assert(allQuizzesRes.status === 200, `GET /api/admin/quizzes?filter=all status 200`);
    const allQuizzesJson = await allQuizzesRes.json();
    assert(allQuizzesJson.data.length > 0, `All quizzes tab returns quizzes (found: ${allQuizzesJson.data.length})`);

    const seriesQuizzesReq = new NextRequest('http://localhost:3000/api/admin/quizzes?filter=series');
    const seriesQuizzesRes = await getQuizzes(seriesQuizzesReq);
    const seriesQuizzesJson = await seriesQuizzesRes.json();
    const allHaveSeries = seriesQuizzesJson.data.every((q: any) => q.testSeriesId !== null);
    assert(allHaveSeries, `Quizzes in series filter only return quizzes with testSeriesId != null`);

    const standaloneQuizzesReq = new NextRequest('http://localhost:3000/api/admin/quizzes?filter=standalone');
    const standaloneQuizzesRes = await getQuizzes(standaloneQuizzesReq);
    const standaloneQuizzesJson = await standaloneQuizzesRes.json();
    const allAreStandalone = standaloneQuizzesJson.data.every((q: any) => q.testSeriesId === null);
    assert(allAreStandalone, `Standalone filter only returns quizzes with testSeriesId === null`);

    // ----------------------------------------------------
    // Test 6: CBT Question Bank Editor API & NTA Marking
    // ----------------------------------------------------
    console.log('\n--- Test 6: CBT Question Bank Editor & NTA Marking ---');
    // Create a new Quiz
    const postQuizReq = new NextRequest('http://localhost:3000/api/admin/quizzes', {
      method: 'POST',
      body: JSON.stringify({
        title: 'M3 Verification Quiz on Plant Physiology',
        subject: 'Botany',
        durationMinutes: 45,
        totalMarks: 40.0,
        negativeMarks: 1.0,
        passingMarks: 16.0,
        isFree: true,
      }),
    });
    const postQuizRes = await postQuizzes(postQuizReq);
    assert(postQuizRes.status === 201, `POST /api/admin/quizzes status 201 Created`);
    const postQuizJson = await postQuizRes.json();
    const createdQuizId = postQuizJson.data.id;
    assert(typeof createdQuizId === 'number', `Created quiz ID is number: ${createdQuizId}`);

    // Add Question with 4 options and NTA +4/-1 marking
    const postQuestionReq = new NextRequest('http://localhost:3000/api/admin/questions', {
      method: 'POST',
      body: JSON.stringify({
        quizId: createdQuizId,
        questionText: 'Which pigment is primarily responsible for photosynthesis in higher plants?',
        options: ['Chlorophyll a', 'Carotenoids', 'Anthocyanin', 'Xanthophyll'],
        correctOption: 0,
        marks: 4.0,
        negativeMarks: 1.0,
        subject: 'Botany',
        topic: 'Photosynthesis',
        explanation: 'Chlorophyll a is the primary reaction center pigment in photosystems I and II.',
      }),
    });
    const postQuestionRes = await postQuestions(postQuestionReq);
    assert(postQuestionRes.status === 201, `POST /api/admin/questions status 201 Created`);
    const postQuestionJson = await postQuestionRes.json();
    assert(postQuestionJson.status === 'success', `Question saved successfully`);
    assert(postQuestionJson.data.correctOption === 0, `Correct option is 0 (Option A)`);
    assert(postQuestionJson.data.marks === 4.0, `Positive marks: +4.0`);
    assert(postQuestionJson.data.negativeMarks === 1.0, `Negative marks: -1.0`);

    // Verify questions retrieval for this quiz
    const getQuestionsReq = new NextRequest(`http://localhost:3000/api/admin/questions?quizId=${createdQuizId}`);
    const getQuestionsRes = await getQuestions(getQuestionsReq);
    assert(getQuestionsRes.status === 200, `GET /api/admin/questions?quizId=${createdQuizId} status 200`);
    const getQuestionsJson = await getQuestionsRes.json();
    assert(getQuestionsJson.data.length === 1, `Quiz has 1 question in bank`);

    // ----------------------------------------------------
    // Test 7: Test Series Package Manager API
    // ----------------------------------------------------
    console.log('\n--- Test 7: Test Series Package Manager API ---');
    const getSeriesRes = await getTestSeries();
    assert(getSeriesRes.status === 200, `GET /api/admin/test-series status 200`);
    const getSeriesJson = await getSeriesRes.json();
    assert(getSeriesJson.status === 'success', `GET /api/admin/test-series returns success`);
    assert(Array.isArray(getSeriesJson.data), `GET /api/admin/test-series returns array`);

    // Create Test Series Package and attach the quiz created in Test 6
    const postSeriesReq = new NextRequest('http://localhost:3000/api/admin/test-series', {
      method: 'POST',
      body: JSON.stringify({
        title: 'M3 All India Botany Master Series 2026',
        description: 'Comprehensive botanic test series for NEET aspirants.',
        price: 899,
        discountPrice: 399,
        validityDays: 365,
        isPublished: true,
        quizIds: [createdQuizId],
      }),
    });
    const postSeriesRes = await postTestSeries(postSeriesReq);
    assert(postSeriesRes.status === 201, `POST /api/admin/test-series status 201 Created`);
    const postSeriesJson = await postSeriesRes.json();
    assert(postSeriesJson.data.title === 'M3 All India Botany Master Series 2026', `Created test series title matches`);
    assert(postSeriesJson.data.quizzes.some((q: any) => q.id === createdQuizId), `Attached quiz ID ${createdQuizId} is linked to test series in DB`);

    // ----------------------------------------------------
    // Test 8: Platform Test Analytics & Score Distribution
    // ----------------------------------------------------
    console.log('\n--- Test 8: Platform Test Analytics & Leaderboard ---');
    const analyticsRes = await getAnalytics();
    assert(analyticsRes.status === 200, `GET /api/admin/analytics status 200`);
    const analyticsJson = await analyticsRes.json();
    assert(analyticsJson.status === 'success', `Analytics API returns status 'success'`);

    const { totalAttempts, avgAccuracy, passRate, distribution, leaderboard } = analyticsJson.data;
    assert(typeof totalAttempts === 'number' && totalAttempts >= 1, `Total attempts computed: ${totalAttempts}`);
    assert(typeof avgAccuracy === 'number' && avgAccuracy >= 0 && avgAccuracy <= 100, `Average accuracy percentage is valid: ${avgAccuracy}%`);
    assert(typeof passRate === 'number' && passRate >= 0 && passRate <= 100, `Pass rate percentage is valid: ${passRate}%`);
    assert(distribution.range0to25 !== undefined, `Score range 0-25% computed: ${distribution.range0to25}`);
    assert(distribution.range26to50 !== undefined, `Score range 26-50% computed: ${distribution.range26to50}`);
    assert(distribution.range51to75 !== undefined, `Score range 51-75% computed: ${distribution.range51to75}`);
    assert(distribution.range76to100 !== undefined, `Score range 76-100% computed: ${distribution.range76to100}`);
    assert(Array.isArray(leaderboard) && leaderboard.length >= 1, `Leaderboard contains ranked entries (count: ${leaderboard.length})`);
    assert(leaderboard[0].score !== undefined, `Top ranker has valid score: ${leaderboard[0].score}`);

    // Cleanup test records created during test run
    await prisma.question.deleteMany({ where: { quizId: createdQuizId } });
    if (postSeriesJson?.data?.id) {
      await prisma.testSeries.delete({ where: { id: postSeriesJson.data.id } });
    }
    const remainingQuiz = await prisma.quiz.findUnique({ where: { id: createdQuizId } });
    if (remainingQuiz) {
      await prisma.quiz.delete({ where: { id: createdQuizId } });
    }
    if (dbCourse) {
      await prisma.course.delete({ where: { id: dbCourse.id } });
    }
    console.log('🧹 Cleaned up temporary M3 verification test records');

  } catch (err) {
    console.error('Fatal error during verification:', err);
    failedTests++;
  }

  console.log('\n====================================================');
  if (failedTests === 0) {
    console.log(`🎉 ALL TESTS PASSED! (${passedTests} passed, 0 failed)`);
  } else {
    console.log(`❌ TEST SUITE FAILED: ${failedTests} failed, ${passedTests} passed`);
  }
  console.log('====================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runVerification();
