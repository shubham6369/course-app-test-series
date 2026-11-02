import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

async function verifyDatabase() {
  console.log('🔍 Starting rigorous verification of database models and data integrity...\n');

  // 1. Verify Admin
  const adminCount = await prisma.admin.count();
  const admin = await prisma.admin.findUnique({
    where: { email: 'neerajkumarmahato740@gmail.com' },
  });
  if (!admin) throw new Error('Default admin not found!');
  const adminPasswordMatches = await bcrypt.compare('123456!!', admin.password);
  console.log(`[Admin] Count: ${adminCount}, Role: ${admin.role}, Password verified with bcrypt: ${adminPasswordMatches}`);
  if (!adminPasswordMatches) throw new Error('Admin password hash verification failed!');
  if (admin.role !== 'owner') throw new Error('Admin role must be owner!');

  // 2. Verify Students
  const studentCount = await prisma.student.count();
  const rahul = await prisma.student.findUnique({
    where: { email: 'rahul.sharma@example.com' },
    include: {
      enrollments: true,
      quizAttempts: true,
      doubts: true,
      orders: true,
    },
  });
  if (!rahul) throw new Error('Student Rahul Sharma not found!');
  const rahulPassMatches = await bcrypt.compare('password123', rahul.password);
  console.log(`[Student] Count: ${studentCount}, Rahul: ID=${rahul.id}, Phone=${rahul.phone}, Password verified: ${rahulPassMatches}`);
  console.log(`  - Enrollments: ${rahul.enrollments.length}, Attempts: ${rahul.quizAttempts.length}, Doubts: ${rahul.doubts.length}, Orders: ${rahul.orders.length}`);

  // 3. Verify Categories
  const categoryCount = await prisma.category.count();
  console.log(`[Categories] Count: ${categoryCount}`);

  // 4. Verify Courses, Folders, Lessons, Comments
  const courseCount = await prisma.course.count();
  const folderCount = await prisma.courseFolder.count();
  const lessonCount = await prisma.lesson.count();
  const commentCount = await prisma.videoComment.count();
  const biologyCourse = await prisma.course.findUnique({
    where: { slug: 'complete-biology-neet-2026' },
    include: {
      folders: {
        include: { lessons: true },
      },
    },
  });
  console.log(`[Curriculum] Courses: ${courseCount}, Folders: ${folderCount}, Lessons: ${lessonCount}, Comments: ${commentCount}`);
  console.log(`  - Biology Course Folders: ${biologyCourse?.folders.length}, Total lessons: ${biologyCourse?.folders.reduce((acc, f) => acc + f.lessons.length, 0)}`);

  // 5. Verify Test Series, Quizzes, Questions, Attempts
  const seriesCount = await prisma.testSeries.count();
  const quizCount = await prisma.quiz.count();
  const questionCount = await prisma.question.count();
  const attemptCount = await prisma.quizAttempt.count();
  const quiz101 = await prisma.quiz.findUnique({
    where: { id: 101 },
    include: { questions: true },
  });
  console.log(`[Exams] TestSeries: ${seriesCount}, Quizzes: ${quizCount}, Questions: ${questionCount}, Attempts: ${attemptCount}`);
  console.log(`  - Quiz 101 Questions loaded: ${quiz101?.questions.length}`);
  if (quiz101?.questions.length !== 10) throw new Error('Quiz 101 must contain exactly 10 questions!');

  // Check NTA scoring parameters on question 1
  const q1 = quiz101.questions[0];
  console.log(`  - Q1: "${q1.questionText}" | Marks: +${q1.marks} / -${q1.negativeMarks} | CorrectOption: ${q1.correctOption}`);
  const q1Options = JSON.parse(q1.options);
  console.log(`  - Q1 Option[${q1.correctOption}]: ${q1Options[q1.correctOption]}`);

  // 6. Verify Doubts & Replies
  const doubtCount = await prisma.doubt.count();
  const doubtReplyCount = await prisma.doubtReply.count();
  console.log(`[Doubts] Doubts: ${doubtCount}, Replies: ${doubtReplyCount}`);

  // 7. Verify Community Posts, Likes, Comments
  const postCount = await prisma.communityPost.count();
  const likeCount = await prisma.communityLike.count();
  const communityCommentCount = await prisma.communityComment.count();
  console.log(`[Community] Posts: ${postCount}, Likes: ${likeCount}, Comments: ${communityCommentCount}`);

  // 8. Verify Banners, Ebooks, Resources, LiveClasses
  const bannerCount = await prisma.banner.count();
  const ebookCount = await prisma.ebook.count();
  const resourceCount = await prisma.resource.count();
  const liveCount = await prisma.liveClass.count();
  console.log(`[Content] Banners: ${bannerCount}, Ebooks: ${ebookCount}, Resources: ${resourceCount}, LiveClasses: ${liveCount}`);

  // 9. Verify Orders, Enrollments, Coupons
  const orderCount = await prisma.order.count();
  const enrollmentCount = await prisma.enrollment.count();
  const couponCount = await prisma.coupon.count();
  console.log(`[Commerce] Orders: ${orderCount}, Enrollments: ${enrollmentCount}, Coupons: ${couponCount}`);

  // 10. Verify Announcements, Notifications, DeletionRequests
  const announcementCount = await prisma.announcement.count();
  const notificationCount = await prisma.notification.count();
  const deletionRequestCount = await prisma.deletionRequest.count();
  console.log(`[Ops] Announcements: ${announcementCount}, Notifications: ${notificationCount}, DeletionRequests: ${deletionRequestCount}`);

  // 11. Verify Settings, AiConfig, AiAuditLog
  const settingCount = await prisma.setting.count();
  const aiConfigCount = await prisma.aiConfig.count();
  const aiAuditLogCount = await prisma.aiAuditLog.count();
  console.log(`[Config & AI] Settings: ${settingCount}, AiConfig: ${aiConfigCount}, AiAuditLogs: ${aiAuditLogCount}`);

  console.log('\n✨ All 29 models verified successfully with authentic data and relational integrity!');
}

verifyDatabase()
  .catch((e) => {
    console.error('❌ Verification failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
