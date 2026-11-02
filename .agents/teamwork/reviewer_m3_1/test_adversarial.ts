import { NextRequest } from 'next/server';
import { POST as postCourses, DELETE as delCourses } from '../../../backend/src/app/api/admin/courses/route';
import { GET as getQuestions, POST as postQuestions, DELETE as delQuestions } from '../../../backend/src/app/api/admin/questions/route';
import { POST as postQuizzes } from '../../../backend/src/app/api/admin/quizzes/route';
import { POST as postSeries, DELETE as delSeries } from '../../../backend/src/app/api/admin/test-series/route';

async function testAdversarial() {
  console.log('Testing Edge Cases...');

  // 1. Missing title on course
  const r1 = await postCourses(new NextRequest('http://localhost/api', { method: 'POST', body: JSON.stringify({}) }));
  console.log('Course missing title status:', r1.status);
  if (r1.status !== 400) throw new Error('Expected 400 for course missing title');

  // 2. Missing quizId on questions GET
  const r2 = await getQuestions(new NextRequest('http://localhost/api'));
  console.log('Question missing quizId status:', r2.status);
  if (r2.status !== 400) throw new Error('Expected 400 for questions missing quizId');

  // 3. Missing questionText on question POST
  const r3 = await postQuestions(new NextRequest('http://localhost/api', { method: 'POST', body: JSON.stringify({ quizId: 1 }) }));
  console.log('Question missing text status:', r3.status);
  if (r3.status !== 400) throw new Error('Expected 400 for question missing text');

  // 4. Missing title on quiz POST
  const r4 = await postQuizzes(new NextRequest('http://localhost/api', { method: 'POST', body: JSON.stringify({}) }));
  console.log('Quiz missing title status:', r4.status);
  if (r4.status !== 400) throw new Error('Expected 400 for quiz missing title');

  // 5. Missing title on test series POST
  const r5 = await postSeries(new NextRequest('http://localhost/api', { method: 'POST', body: JSON.stringify({}) }));
  console.log('Test Series missing title status:', r5.status);
  if (r5.status !== 400) throw new Error('Expected 400 for series missing title');

  // 6. Delete without id
  const r6 = await delCourses(new NextRequest('http://localhost/api'));
  const r7 = await delQuestions(new NextRequest('http://localhost/api'));
  const r8 = await delSeries(new NextRequest('http://localhost/api'));
  console.log('DELETE without ID statuses:', r6.status, r7.status, r8.status);
  if (r6.status !== 400 || r7.status !== 400 || r8.status !== 400) {
    throw new Error('Expected 400 for DELETE without id');
  }

  console.log('ALL ADVERSARIAL EDGE CASE TESTS PASSED!');
}

testAdversarial().catch((err) => {
  console.error('Adversarial test error:', err);
  process.exit(1);
});
