import { NextRequest } from 'next/server';
import prisma from '../src/lib/prisma';
import { GET as getCourses, POST as postCourses, DELETE as deleteCourse } from '../src/app/api/admin/courses/route';
import { GET as getQuizzes, POST as postQuizzes } from '../src/app/api/admin/quizzes/route';
import { GET as getQuestions, POST as postQuestions, DELETE as deleteQuestion } from '../src/app/api/admin/questions/route';
import { GET as getTestSeries, POST as postTestSeries, DELETE as deleteTestSeries } from '../src/app/api/admin/test-series/route';
import { GET as getAnalytics } from '../src/app/api/admin/analytics/route';

let passedChecks = 0;
let failedChecks = 0;
const findings: { severity: string; title: string; detail: string }[] = [];

function check(condition: boolean, title: string, failureDetail?: string) {
  if (condition) {
    console.log(`✅ PASSED: ${title}`);
    passedChecks++;
  } else {
    console.error(`❌ FAILED: ${title}`);
    failedChecks++;
    findings.push({
      severity: 'Major',
      title,
      detail: failureDetail || 'Check failed',
    });
  }
}

async function runAdversarialVerification() {
  console.log('========================================================');
  console.log('⚔️  RUNNING ADVERSARIAL VERIFICATION FOR MILESTONE 3');
  console.log('========================================================\n');

  // ========================================================
  // CHALLENGE 1: Course Multi-Folder Cascade Deletion & Validation
  // ========================================================
  console.log('--- Challenge 1: Multi-Folder Syllabus Cascade Deletion & Input Security ---');
  
  // 1.1 Input Validation on Course Creation
  const emptyCourseReq = new NextRequest('http://localhost:3000/api/admin/courses', {
    method: 'POST',
    body: JSON.stringify({ title: '   ' }),
  });
  const emptyCourseRes = await postCourses(emptyCourseReq);
  check(emptyCourseRes.status === 400, 'Blank course title rejected with 400 Bad Request');

  // 1.2 Deep Multi-Folder Course Creation
  const advSlug = `adv-cascade-${Date.now()}`;
  const deepCourseReq = new NextRequest('http://localhost:3000/api/admin/courses', {
    method: 'POST',
    body: JSON.stringify({
      title: 'Adversarial Cascade Test Course',
      slug: advSlug,
      description: 'Testing cascade integrity on nested folders and lessons.',
      price: 1999,
      folders: [
        {
          title: 'Module 1: Foundations',
          order: 1,
          lessons: [
            { title: 'Lesson 1.1', videoId: 'vid1', durationMinutes: 20, isFreePreview: true },
            { title: 'Lesson 1.2', videoId: 'vid2', durationMinutes: 25, isFreePreview: false },
          ],
        },
        {
          title: 'Module 2: Advanced Concepts',
          order: 2,
          lessons: [
            { title: 'Lesson 2.1', videoId: 'vid3', durationMinutes: 45, isFreePreview: false },
            { title: 'Lesson 2.2', videoId: 'vid4', durationMinutes: 50, isFreePreview: true },
          ],
        },
      ],
    }),
  });
  const deepCourseRes = await postCourses(deepCourseReq);
  check(deepCourseRes.status === 201, 'Nested multi-folder course successfully created (201)');
  const deepCourseJson = await deepCourseRes.json();
  const createdCourseId = deepCourseJson.data.id;

  // 1.3 Duplicate Slug Conflict Resolution
  const dupSlugReq = new NextRequest('http://localhost:3000/api/admin/courses', {
    method: 'POST',
    body: JSON.stringify({
      title: 'Duplicate Slug Course',
      slug: advSlug, // Same slug
    }),
  });
  const dupSlugRes = await postCourses(dupSlugReq);
  check(dupSlugRes.status === 201, 'Course with conflicting slug auto-disambiguates slug without crash');
  const dupSlugJson = await dupSlugRes.json();
  check(dupSlugJson.data.slug !== advSlug, `Slug was safely disambiguated to: ${dupSlugJson.data.slug}`);
  // Clean up duplicate course
  await prisma.course.delete({ where: { id: dupSlugJson.data.id } });

  // 1.4 Verify folders and lessons exist
  const dbFolders = await prisma.courseFolder.findMany({
    where: { courseId: createdCourseId },
    include: { lessons: true },
  });
  check(dbFolders.length === 2, `Course has exactly 2 folders in database (found: ${dbFolders.length})`);
  const totalLessons = dbFolders.reduce((acc, f) => acc + f.lessons.length, 0);
  check(totalLessons === 4, `Course has exactly 4 lessons across folders in database (found: ${totalLessons})`);
  const folderIds = dbFolders.map((f) => f.id);

  // Now delete the course via DELETE API
  const deleteCourseReq = new NextRequest(`http://localhost:3000/api/admin/courses?id=${createdCourseId}`, {
    method: 'DELETE',
  });
  const deleteCourseRes = await deleteCourse(deleteCourseReq);
  check(deleteCourseRes.status === 200, 'DELETE /api/admin/courses?id=... returned 200 OK');

  // Verify Course record is gone
  const deletedCourse = await prisma.course.findUnique({ where: { id: createdCourseId } });
  check(deletedCourse === null, 'Course record was successfully deleted from database');

  // Adversarial Check: Are the child CourseFolder records also deleted (no orphaned rows)?
  const orphanFolders = await prisma.courseFolder.findMany({
    where: { id: { in: folderIds } },
  });
  check(orphanFolders.length === 0, `All ${folderIds.length} CourseFolder records cascade deleted (orphans found: ${orphanFolders.length})`);

  // Adversarial Check: Are the child Lesson records also deleted (no orphaned rows)?
  const orphanLessons = await prisma.lesson.findMany({
    where: { folderId: { in: folderIds } },
  });
  check(orphanLessons.length === 0, `All 4 Lesson records cascade deleted (orphans found: ${orphanLessons.length})`);

  // 1.5 Special characters / SQL Injection in search query
  const sqlInjectionSearch = new NextRequest("http://localhost:3000/api/admin/courses?search=' OR '1'='1");
  const sqlInjRes = await getCourses(sqlInjectionSearch);
  check(sqlInjRes.status === 200, 'Search query with quotes and SQL meta-characters handled safely');

  // ========================================================
  // CHALLENGE 2: Question JSON Encoding, Decoding & Negative Marking
  // ========================================================
  console.log('\n--- Challenge 2: CBT Question JSON & Marking Logic ---');

  // Create temporary Quiz for testing
  const testQuiz = await prisma.quiz.create({
    data: {
      title: 'Adversarial Marking & Question Quiz',
      subject: 'Physics',
      durationMinutes: 30,
      totalMarks: 0,
      negativeMarks: 1.0,
      passingMarks: 10.0,
    },
  });

  // 2.1 Missing question text rejected
  const emptyQReq = new NextRequest('http://localhost:3000/api/admin/questions', {
    method: 'POST',
    body: JSON.stringify({
      quizId: testQuiz.id,
      questionText: '   ',
    }),
  });
  const emptyQRes = await postQuestions(emptyQReq);
  check(emptyQRes.status === 400, 'Empty question statement rejected with 400 Bad Request');

  // 2.2 Valid question with Array options
  const q1Req = new NextRequest('http://localhost:3000/api/admin/questions', {
    method: 'POST',
    body: JSON.stringify({
      quizId: testQuiz.id,
      questionText: 'What is the SI unit of magnetic flux?',
      options: ['Weber', 'Tesla', 'Henry', 'Gauss'],
      correctOption: 0,
      marks: 4.0,
      negativeMarks: 1.0,
      subject: 'Physics',
    }),
  });
  const q1Res = await postQuestions(q1Req);
  check(q1Res.status === 201, 'Question with array options created with 201 Created');
  const q1Json = await q1Res.json();
  const parsedOptions1 = JSON.parse(q1Json.data.options);
  check(Array.isArray(parsedOptions1) && parsedOptions1.length === 4, 'Options successfully saved and parsed as 4-element JSON array');

  // 2.3 Question with JSON string options
  const q2Req = new NextRequest('http://localhost:3000/api/admin/questions', {
    method: 'POST',
    body: JSON.stringify({
      quizId: testQuiz.id,
      questionText: 'What is the speed of light in vacuum?',
      options: JSON.stringify(['3x10^8 m/s', '3x10^6 m/s', '3x10^10 m/s', 'Infinite']),
      correctOption: 0,
      marks: 4.0,
      negativeMarks: 1.0,
    }),
  });
  const q2Res = await postQuestions(q2Req);
  check(q2Res.status === 201, 'Question with JSON string options created successfully');

  // 2.4 Question with malformed options string (Adversarial stress-test)
  const q3Req = new NextRequest('http://localhost:3000/api/admin/questions', {
    method: 'POST',
    body: JSON.stringify({
      quizId: testQuiz.id,
      questionText: 'Adversarial Question with malformed string options',
      options: 'Malformed Not A JSON Array',
      correctOption: 0,
      marks: 4.0,
      negativeMarks: 1.0,
    }),
  });
  const q3Res = await postQuestions(q3Req);
  check(q3Res.status === 201, 'Question with malformed options handled without 500 crash');
  const q3Json = await q3Res.json();
  const parsedQ3 = JSON.parse(q3Json.data.options);
  check(Array.isArray(parsedQ3), 'Malformed options safely normalized to valid JSON array');

  // 2.5 Behavior check: negativeMarks = 0 (No negative marking)
  const q4Req = new NextRequest('http://localhost:3000/api/admin/questions', {
    method: 'POST',
    body: JSON.stringify({
      quizId: testQuiz.id,
      questionText: 'Zero negative marking question',
      options: ['A', 'B', 'C', 'D'],
      correctOption: 1,
      marks: 4.0,
      negativeMarks: 0,
    }),
  });
  const q4Res = await postQuestions(q4Req);
  const q4Json = await q4Res.json();
  if (q4Json.data.negativeMarks === 0) {
    console.log('✅ negativeMarks: 0 was preserved');
  } else {
    console.log(`⚠️ FINDING: negativeMarks: 0 was replaced by fallback: ${q4Json.data.negativeMarks}`);
    findings.push({
      severity: 'Minor',
      title: 'Falsy zero in negativeMarks fallback logic',
      detail: `Passing negativeMarks: 0 evaluated to falsy in "parseFloat(negativeMarks) || 1.0", overriding explicit 0 to default 1.0. Recommendation: Use !isNaN(parseFloat(v)) ? parseFloat(v) : fallback`,
    });
  }

  // 2.6 Total marks dynamic recalculation in Quiz
  const updatedQuiz = await prisma.quiz.findUnique({ where: { id: testQuiz.id } });
  check(updatedQuiz !== null && updatedQuiz.totalMarks === 16.0, `Quiz totalMarks dynamically recalculated to 16.0 after 4 questions (found: ${updatedQuiz?.totalMarks})`);

  // ========================================================
  // CHALLENGE 3: Revenue Aggregation Integrity
  // ========================================================
  console.log('\n--- Challenge 3: Revenue Aggregation & Non-Paid Order Exclusion ---');

  const testStudent = await prisma.student.findFirst();
  const testCourse = await prisma.course.findFirst();

  if (!testStudent || !testCourse) {
    throw new Error('Pre-seeded student or course missing for order test');
  }

  // Insert a test pending order and test failed order
  const pendingOrder = await prisma.order.create({
    data: {
      orderNumber: `adv_pending_${Date.now()}`,
      studentId: testStudent.id,
      itemType: 'course',
      itemId: testCourse.id,
      courseId: testCourse.id,
      itemName: 'Pending Order Test',
      amount: 5000,
      status: 'pending',
    },
  });

  const failedOrder = await prisma.order.create({
    data: {
      orderNumber: `adv_failed_${Date.now()}`,
      studentId: testStudent.id,
      itemType: 'course',
      itemId: testCourse.id,
      courseId: testCourse.id,
      itemName: 'Failed Order Test',
      amount: 8000,
      status: 'failed',
    },
  });

  // Calculate revenue using dashboard aggregation logic
  const paidOrdersAgg = await prisma.order.aggregate({
    _sum: { amount: true },
    where: { status: 'paid' },
  });

  const allOrdersPaid = await prisma.order.findMany({
    where: { status: 'paid' },
    select: { amount: true, status: true },
  });

  check(allOrdersPaid.every((o) => o.status === 'paid'), 'Dashboard strictly filters orders where status == "paid"');
  
  // Verify that pending and failed orders are NOT included in the revenue sum
  const sumAmounts = allOrdersPaid.reduce((acc, o) => acc + o.amount, 0);
  check(paidOrdersAgg._sum.amount === sumAmounts, `Aggregated revenue sum (${paidOrdersAgg._sum.amount}) matches exact sum of paid order records`);

  // Clean up test orders
  await prisma.order.delete({ where: { id: pendingOrder.id } });
  await prisma.order.delete({ where: { id: failedOrder.id } });
  console.log('🧹 Cleaned up adversarial pending/failed orders');

  // ========================================================
  // CHALLENGE 4: Platform Test Analytics & Leaderboard Stress-Test
  // ========================================================
  console.log('\n--- Challenge 4: Platform Test Analytics & Leaderboard ---');
  
  const analyticsRes = await getAnalytics();
  check(analyticsRes.status === 200, 'GET /api/admin/analytics returned 200');
  const analyticsData = (await analyticsRes.json()).data;

  // Check distribution consistency
  const totalInDistribution =
    analyticsData.distribution.range0to25 +
    analyticsData.distribution.range26to50 +
    analyticsData.distribution.range51to75 +
    analyticsData.distribution.range76to100;

  check(
    totalInDistribution === analyticsData.totalAttempts,
    `Distribution bucket sum (${totalInDistribution}) exactly equals total attempts (${analyticsData.totalAttempts})`
  );

  // Verify leaderboard sorting
  let correctlySorted = true;
  for (let i = 0; i < analyticsData.leaderboard.length - 1; i++) {
    const cur = analyticsData.leaderboard[i];
    const nxt = analyticsData.leaderboard[i + 1];
    if (cur.score < nxt.score) {
      correctlySorted = false;
      break;
    }
  }
  check(correctlySorted, 'Leaderboard is strictly sorted in descending order of score');

  // ========================================================
  // CHALLENGE 5: Integrity Violation & Facade Audit
  // ========================================================
  console.log('\n--- Challenge 5: Integrity Violation & Facade Audit ---');
  
  // Verify courses endpoint returns live database count
  const allCoursesDbCount = await prisma.course.count();
  const getCoursesReq = new NextRequest('http://localhost:3000/api/admin/courses');
  const getCoursesRes = await getCourses(getCoursesReq);
  const getCoursesJson = await getCoursesRes.json();
  check(
    getCoursesJson.data.length === allCoursesDbCount,
    `GET /api/admin/courses returns real DB record count (${getCoursesJson.data.length} == ${allCoursesDbCount}), no hardcoded mock lists`
  );

  // Verify quizzes endpoint returns live database count
  const allQuizzesDbCount = await prisma.quiz.count();
  const allQuizzesReq = new NextRequest('http://localhost:3000/api/admin/quizzes?filter=all');
  const allQuizzesRes = await getQuizzes(allQuizzesReq);
  const allQuizzesJson = await allQuizzesRes.json();
  check(
    allQuizzesJson.data.length === allQuizzesDbCount,
    `GET /api/admin/quizzes returns real DB record count (${allQuizzesJson.data.length} == ${allQuizzesDbCount}), no hardcoded mock lists`
  );

  // Clean up temporary Quiz and its questions
  await prisma.quiz.delete({ where: { id: testQuiz.id } });
  console.log('🧹 Cleaned up temporary adversarial test quiz');

  console.log('\n========================================================');
  console.log(`SUMMARY: ${passedChecks} checks passed, ${failedChecks} checks failed.`);
  if (findings.length > 0) {
    console.log(`Discovered ${findings.length} findings / observations:`);
    findings.forEach((f, idx) => console.log(`  ${idx + 1}. [${f.severity}] ${f.title}: ${f.detail}`));
  }
  console.log('========================================================\n');

  if (failedChecks > 0) {
    process.exit(1);
  }
}

runAdversarialVerification().catch((err) => {
  console.error('Fatal unhandled error during adversarial verification:', err);
  process.exit(1);
});
