import { prisma } from '../../../backend/src/lib/prisma';
import bcrypt from '../../../backend/node_modules/bcryptjs';

async function runAdversarialAudit() {
  console.log('====================================================');
  console.log('🕵️  STARTING COMPREHENSIVE ADVERSARIAL INTEGRITY PROBE');
  console.log('====================================================\n');

  let passedTests = 0;
  let failedTests = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passedTests++;
    } else {
      console.error(`❌ [FAIL] ${testName}: ${detail ?? 'Assertion failed'}`);
      failedTests++;
    }
  }

  // TEST SUITE 1: SQLite Raw Pragma & Schema Engine Checks
  console.log('\n--- 1. SQLite Engine & Integrity Pragma Checks ---');
  try {
    const integrityCheck = await prisma.$queryRawUnsafe<any[]>('PRAGMA integrity_check;');
    const integrityResult = integrityCheck[0]?.integrity_check;
    assert(integrityResult === 'ok', 'SQLite PRAGMA integrity_check returns ok', `Got: ${integrityResult}`);

    const fkCheck = await prisma.$queryRawUnsafe<any[]>('PRAGMA foreign_key_check;');
    assert(fkCheck.length === 0, 'SQLite PRAGMA foreign_key_check has 0 violations', `Found ${fkCheck.length} violations: ${JSON.stringify(fkCheck)}`);

    const tables = await prisma.$queryRawUnsafe<{ name: string }[]>(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma_migrations';"
    );
    assert(tables.length === 29, `Exactly 29 entity tables created in SQLite`, `Found: ${tables.length} tables: ${tables.map(t => t.name).join(', ')}`);
  } catch (err: any) {
    assert(false, 'SQLite Pragma Checks', err.message);
  }

  // TEST SUITE 2: Credential & Real Hashing Checks (No Hardcoded Bypass)
  console.log('\n--- 2. Credential Hashing & Authentication Robustness ---');
  try {
    const admin = await prisma.admin.findUnique({
      where: { email: 'neerajkumarmahato740@gmail.com' },
    });
    assert(!!admin, 'Admin neerajkumarmahato740@gmail.com exists in database');
    assert(admin?.role === 'owner', `Admin role is strictly "owner" (found: ${admin?.role})`);
    
    // Hash format check
    const isBcryptFormat = admin?.password.startsWith('$2a$') || admin?.password.startsWith('$2b$');
    assert(isBcryptFormat, 'Admin password is stored as genuine bcrypt hash format ($2a$/$2b$)', `Hash was: ${admin?.password.substring(0, 7)}...`);

    // Authentic password comparison
    const validMatch = await bcrypt.compare('123456!!', admin?.password ?? '');
    assert(validMatch, 'Valid admin password ("123456!!") matches hash');

    // Negative password comparison
    const invalidMatch1 = await bcrypt.compare('123456', admin?.password ?? '');
    assert(!invalidMatch1, 'Wrong admin password ("123456") is REJECTED');

    const invalidMatch2 = await bcrypt.compare('', admin?.password ?? '');
    assert(!invalidMatch2, 'Empty admin password is REJECTED');

    // Student password verification
    const rahul = await prisma.student.findUnique({
      where: { phone: '9876543210' },
    });
    assert(!!rahul, 'Student Rahul Sharma (phone 9876543210) exists');
    const rahulPassMatch = await bcrypt.compare('password123', rahul?.password ?? '');
    assert(rahulPassMatch, 'Rahul Sharma password ("password123") matches hash');
    const rahulWrongPass = await bcrypt.compare('wrongpassword', rahul?.password ?? '');
    assert(!rahulWrongPass, 'Rahul Sharma wrong password is REJECTED');
  } catch (err: any) {
    assert(false, 'Credential Check', err.message);
  }

  // TEST SUITE 3: Unique Constraints & Duplicate Prevention
  console.log('\n--- 3. Database Constraints & Deduplication Enforcement ---');
  try {
    let duplicateAdminFailed = false;
    try {
      await prisma.admin.create({
        data: {
          email: 'neerajkumarmahato740@gmail.com',
          password: 'some_hash_123',
          name: 'Imposter',
        },
      });
    } catch (e: any) {
      duplicateAdminFailed = true;
    }
    assert(duplicateAdminFailed, 'Admin email unique constraint correctly blocks duplicates');

    let duplicateStudentPhoneFailed = false;
    try {
      await prisma.student.create({
        data: {
          email: 'another.unique@example.com',
          phone: '9876543210', // duplicate phone of Rahul
          password: 'hash',
          name: 'Duplicate Phone User',
        },
      });
    } catch (e: any) {
      duplicateStudentPhoneFailed = true;
    }
    assert(duplicateStudentPhoneFailed, 'Student phone unique constraint correctly blocks duplicates');

    let duplicateEnrollmentFailed = false;
    try {
      await prisma.enrollment.create({
        data: {
          studentId: 101,
          itemType: 'course',
          itemId: 101,
          courseId: 101,
          validUntil: new Date(),
        },
      });
    } catch (e: any) {
      duplicateEnrollmentFailed = true;
    }
    assert(duplicateEnrollmentFailed, 'Enrollment composite unique key [studentId, itemType, itemId] blocks duplicates');
  } catch (err: any) {
    assert(false, 'Constraint Check', err.message);
  }

  // TEST SUITE 4: Relational Foreign Key Cascades (Live Stress-Test)
  console.log('\n--- 4. Foreign Key Cascades & Referential Integrity Stress-Test ---');
  try {
    // Create temporary test hierarchy
    const tempCourse = await prisma.course.create({
      data: {
        title: '__TEST_PROBE_COURSE__',
        slug: '__test_probe_course__',
        folders: {
          create: {
            title: '__TEST_PROBE_FOLDER__',
            lessons: {
              create: {
                title: '__TEST_PROBE_LESSON__',
                videoId: 'temp_vid',
              },
            },
          },
        },
      },
      include: {
        folders: {
          include: { lessons: true },
        },
      },
    });

    const folderId = tempCourse.folders[0].id;
    const lessonId = tempCourse.folders[0].lessons[0].id;

    assert(!!folderId && !!lessonId, 'Successfully created test course hierarchy with folders and lessons');

    // Delete course and verify cascade
    await prisma.course.delete({ where: { id: tempCourse.id } });

    const orphanFolder = await prisma.courseFolder.findUnique({ where: { id: folderId } });
    const orphanLesson = await prisma.lesson.findUnique({ where: { id: lessonId } });

    assert(!orphanFolder, 'CourseFolder was CASCADE-deleted when parent Course was deleted');
    assert(!orphanLesson, 'Lesson was CASCADE-deleted when parent Course was deleted');
  } catch (err: any) {
    assert(false, 'Cascade Test', err.message);
  }

  // TEST SUITE 5: Table Population & Seed Depth Verification
  console.log('\n--- 5. All 29 Models Population & Seed Completeness ---');
  try {
    const counts = {
      Admin: await prisma.admin.count(),
      Student: await prisma.student.count(),
      Category: await prisma.category.count(),
      Course: await prisma.course.count(),
      CourseFolder: await prisma.courseFolder.count(),
      Lesson: await prisma.lesson.count(),
      VideoComment: await prisma.videoComment.count(),
      TestSeries: await prisma.testSeries.count(),
      Quiz: await prisma.quiz.count(),
      Question: await prisma.question.count(),
      QuizAttempt: await prisma.quizAttempt.count(),
      Doubt: await prisma.doubt.count(),
      DoubtReply: await prisma.doubtReply.count(),
      CommunityPost: await prisma.communityPost.count(),
      CommunityLike: await prisma.communityLike.count(),
      CommunityComment: await prisma.communityComment.count(),
      Banner: await prisma.banner.count(),
      Ebook: await prisma.ebook.count(),
      Resource: await prisma.resource.count(),
      LiveClass: await prisma.liveClass.count(),
      Order: await prisma.order.count(),
      Enrollment: await prisma.enrollment.count(),
      Coupon: await prisma.coupon.count(),
      Announcement: await prisma.announcement.count(),
      Notification: await prisma.notification.count(),
      DeletionRequest: await prisma.deletionRequest.count(),
      Setting: await prisma.setting.count(),
      AiConfig: await prisma.aiConfig.count(),
      AiAuditLog: await prisma.aiAuditLog.count(),
    };

    let allPopulated = true;
    for (const [modelName, count] of Object.entries(counts)) {
      if (count === 0) {
        allPopulated = false;
        console.error(`  ⚠️ Table ${modelName} has 0 rows!`);
      } else {
        console.log(`  Table ${modelName.padEnd(18)}: ${count} rows`);
      }
    }
    assert(allPopulated, 'All 29 models are non-empty and properly populated by seed.ts');
  } catch (err: any) {
    assert(false, 'Table Population Check', err.message);
  }

  // TEST SUITE 6: CBT Scoring & Question Parsing
  console.log('\n--- 6. CBT Question Data Fidelity ---');
  try {
    const questions = await prisma.question.findMany({ where: { quizId: 101 } });
    assert(questions.length === 10, 'Quiz 101 contains exactly 10 questions');

    let allOptionsValid = true;
    let allMarkingValid = true;
    for (const q of questions) {
      const opts = JSON.parse(q.options);
      if (!Array.isArray(opts) || opts.length < 2 || q.correctOption < 0 || q.correctOption >= opts.length) {
        allOptionsValid = false;
      }
      if (q.marks !== 4.0 || q.negativeMarks !== 1.0) {
        allMarkingValid = false;
      }
    }
    assert(allOptionsValid, 'All questions have valid JSON options array and valid correctOption index');
    assert(allMarkingValid, 'All questions use official NTA marking scheme (+4.0 / -1.0)');
  } catch (err: any) {
    assert(false, 'Question Data Check', err.message);
  }

  // SUMMARY
  console.log('\n====================================================');
  console.log(`PROBE SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log('====================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runAdversarialAudit()
  .catch((e) => {
    console.error('Fatal probe error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
