import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive database seeding...');

  // 1. Clear existing records in reverse dependency order
  console.log('🧹 Cleaning up old records...');
  await prisma.aiAuditLog.deleteMany();
  await prisma.aiConfig.deleteMany();
  await prisma.setting.deleteMany();
  await prisma.deletionRequest.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.liveClass.deleteMany();
  await prisma.resource.deleteMany();
  await prisma.ebook.deleteMany();
  await prisma.banner.deleteMany();
  await prisma.communityComment.deleteMany();
  await prisma.communityLike.deleteMany();
  await prisma.communityPost.deleteMany();
  await prisma.doubtReply.deleteMany();
  await prisma.doubt.deleteMany();
  await prisma.quizAttempt.deleteMany();
  await prisma.question.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.testSeries.deleteMany();
  await prisma.videoComment.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.courseFolder.deleteMany();
  await prisma.course.deleteMany();
  await prisma.category.deleteMany();
  await prisma.student.deleteMany();
  await prisma.admin.deleteMany();

  // 2. Seed Admin User
  console.log('👤 Seeding Admin user...');
  const adminHashedPassword = await bcrypt.hash('123456!!', 10);
  const admin = await prisma.admin.create({
    data: {
      email: 'neerajkumarmahato740@gmail.com',
      password: adminHashedPassword,
      name: 'Neeraj Kumar Mahato',
      role: 'owner',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    },
  });
  console.log(`✅ Admin created: ${admin.email} (${admin.role})`);

  // 3. Seed Students
  console.log('🎓 Seeding Students...');
  const studentPasswordHash = await bcrypt.hash('password123', 10);

  const studentRahul = await prisma.student.create({
    data: {
      id: 101,
      name: 'Rahul Sharma',
      email: 'rahul.sharma@example.com',
      phone: '9876543210',
      password: studentPasswordHash,
      classId: 'Class 12',
      targetExam: 'NEET 2026',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
      token: 'mock_jwt_token_sample_user_123',
    },
  });

  const studentPriya = await prisma.student.create({
    data: {
      id: 102,
      name: 'Priya Patel',
      email: 'priya.patel@example.com',
      phone: '9876543211',
      password: studentPasswordHash,
      classId: 'Class 12',
      targetExam: 'NEET 2026',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
      token: 'mock_jwt_token_sample_user_102',
    },
  });

  const studentAarav = await prisma.student.create({
    data: {
      id: 105,
      name: 'Aarav Gupta',
      email: 'aarav.gupta@example.com',
      phone: '9876543215',
      password: studentPasswordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    },
  });

  const studentSanya = await prisma.student.create({
    data: {
      id: 106,
      name: 'Sanya Verma',
      email: 'sanya.verma@example.com',
      phone: '9876543216',
      password: studentPasswordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    },
  });

  const studentDevansh = await prisma.student.create({
    data: {
      id: 107,
      name: 'Devansh Mukherjee',
      email: 'devansh.m@example.com',
      phone: '9876543217',
      password: studentPasswordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    },
  });

  const studentKavya = await prisma.student.create({
    data: {
      id: 108,
      name: 'Kavya Nair',
      email: 'kavya.nair@example.com',
      phone: '9876543218',
      password: studentPasswordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    },
  });

  const studentRohan = await prisma.student.create({
    data: {
      id: 109,
      name: 'Rohan Mehra',
      email: 'rohan.mehra@example.com',
      phone: '9876543219',
      password: studentPasswordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
    },
  });
  console.log('✅ Students seeded: Rahul Sharma, Priya Patel, Aarav, Sanya, Devansh, Kavya, Rohan');

  // 4. Seed Categories
  console.log('📁 Seeding Categories...');
  const catNeet = await prisma.category.create({
    data: { id: 1, name: 'NEET UG', icon: 'biotech', color: 10619899, order: 1 },
  });
  const catJeeMain = await prisma.category.create({
    data: { id: 2, name: 'JEE Main', icon: 'architecture', color: 1713022, order: 2 },
  });
  const catJeeAdv = await prisma.category.create({
    data: { id: 3, name: 'JEE Advanced', icon: 'functions', color: 870305, order: 3 },
  });
  const catFoundation = await prisma.category.create({
    data: { id: 4, name: 'Foundation (9-10)', icon: 'school', color: 3754411, order: 4 },
  });
  const catCuet = await prisma.category.create({
    data: { id: 5, name: 'CUET UG', icon: 'menu_book', color: 46296, order: 5 },
  });
  const catBoards = await prisma.category.create({
    data: { id: 6, name: 'Boards 12th', icon: 'assignment', color: 5025616, order: 6 },
  });
  console.log('✅ 6 Categories seeded');

  // 5. Seed Banners
  console.log('🖼️ Seeding Banners...');
  await prisma.banner.createMany({
    data: [
      {
        id: 1,
        title: 'All India NEET 2026 Mock Test Series - Live Now!',
        subtitle: 'Test your preparation against thousands of aspirants nationwide',
        imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800',
        actionType: 'test_series',
        actionValue: '1',
        order: 1,
        isActive: true,
      },
      {
        id: 2,
        title: 'Master Organic Chemistry with Video Lectures & Mindmaps',
        subtitle: 'Full syllabus covered with NCERT line-by-line breakdown',
        imageUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800',
        actionType: 'course',
        actionValue: '101',
        order: 2,
        isActive: true,
      },
      {
        id: 3,
        title: 'Ask Doubts 24/7 with our AI Academic Tutor',
        subtitle: 'Instant step-by-step conceptual guidance',
        imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
        actionType: 'ai_chat',
        actionValue: '',
        order: 3,
        isActive: true,
      },
    ],
  });
  console.log('✅ 3 Banners seeded');

  // 6. Seed Courses, Folders & Lessons
  console.log('📚 Seeding Courses & Curriculum...');
  const course101 = await prisma.course.create({
    data: {
      id: 101,
      title: 'Complete Biology Masterclass for NEET 2026',
      slug: 'complete-biology-neet-2026',
      description: 'Covering Botany and Zoology with NCERT line-by-line breakdown, mind maps, and chapterwise test papers.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=500',
      price: 2499.0,
      discountPrice: 999.0,
      instructorName: 'Dr. Ananya Sen (Ex-AIIMS)',
      categoryId: catNeet.id,
      validityDays: 365,
      isPublished: true,
    },
  });

  const folder1 = await prisma.courseFolder.create({
    data: {
      id: 1,
      courseId: course101.id,
      title: 'Module 1: Cell Structure and Function',
      order: 1,
    },
  });

  const lesson11 = await prisma.lesson.create({
    data: {
      id: 11,
      folderId: folder1.id,
      title: '1.1 Cell The Unit of Life: Overview & Organelles',
      description: 'Prokaryotic vs Eukaryotic cells, Endomembrane system, and Mitochondria.',
      videoId: 'M7lc1UVf-VE',
      durationMinutes: 35,
      isFreePreview: true,
      order: 1,
      pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    },
  });

  await prisma.lesson.create({
    data: {
      id: 12,
      folderId: folder1.id,
      title: '1.2 Cell Cycle and Cell Division: Mitosis vs Meiosis',
      description: 'Phases of cell cycle, checkpoints, and chromosomal alignment.',
      videoId: 'dQw4w9WgXcQ',
      durationMinutes: 40,
      isFreePreview: false,
      order: 2,
      pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    },
  });

  const folder2 = await prisma.courseFolder.create({
    data: {
      id: 2,
      courseId: course101.id,
      title: 'Module 2: Genetics and Molecular Biology',
      order: 2,
    },
  });

  await prisma.lesson.create({
    data: {
      id: 21,
      folderId: folder2.id,
      title: '2.1 Principles of Inheritance and Variation (Mendelian Genetics)',
      description: 'Monohybrid, Dihybrid crosses, and Law of Independent Assortment.',
      videoId: 'M7lc1UVf-VE',
      durationMinutes: 45,
      isFreePreview: false,
      order: 1,
      pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    },
  });

  await prisma.lesson.create({
    data: {
      id: 22,
      folderId: folder2.id,
      title: '2.2 Molecular Basis of Inheritance: DNA Replication & Transcription',
      description: 'Semi-conservative replication, RNA polymerase and processing.',
      videoId: 'M7lc1UVf-VE',
      durationMinutes: 50,
      isFreePreview: false,
      order: 2,
      pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    },
  });

  // Additional Courses
  await prisma.course.create({
    data: {
      id: 102,
      title: 'JEE Physics: Mechanics to Electrodynamics',
      slug: 'jee-physics-mastery',
      description: 'Master complex problem solving with visual animations and previous 15 years solved papers.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=500',
      price: 2999.0,
      discountPrice: 1199.0,
      instructorName: 'Prof. Rajesh Verma (IIT Delhi)',
      categoryId: catJeeMain.id,
      validityDays: 365,
      isPublished: true,
    },
  });

  await prisma.course.create({
    data: {
      id: 103,
      title: 'Organic Chemistry Reaction Mechanisms Simplified',
      slug: 'organic-chemistry-simplified',
      description: 'All named reactions, reagents, stereochemistry, and electrophilic aromatic substitutions decoded.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=500',
      price: 1799.0,
      discountPrice: 799.0,
      instructorName: 'Dr. Neeraj Singhania',
      categoryId: catNeet.id,
      validityDays: 365,
      isPublished: true,
    },
  });

  await prisma.course.create({
    data: {
      id: 104,
      title: 'Class 10 Foundation Math & Science Sprint',
      slug: 'class-10-foundation-sprint',
      description: 'Strengthen your core concepts for Olympiads, NTSE, and early JEE/NEET preparation.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=500',
      price: 1299.0,
      discountPrice: 499.0,
      instructorName: 'Meera Menon (Gold Medalist)',
      categoryId: catFoundation.id,
      validityDays: 365,
      isPublished: true,
    },
  });
  console.log('✅ 4 Courses and lessons seeded');

  // 7. Video Comments
  console.log('💬 Seeding Video Comments...');
  await prisma.videoComment.createMany({
    data: [
      {
        id: 1,
        lessonId: lesson11.id,
        studentId: studentRahul.id,
        studentName: 'Rahul Sharma',
        studentAvatar: studentRahul.avatarUrl,
        comment: 'The explanation of the fluid mosaic model was crystal clear! Thanks ma\'am.',
        likesCount: 4,
        isTeacherReply: false,
        videoId: 'M7lc1UVf-VE',
      },
      {
        id: 2,
        lessonId: lesson11.id,
        studentId: null,
        studentName: 'Dr. Ananya Sen (Faculty)',
        studentAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        comment: 'Glad you enjoyed it Rahul! Make sure to revise active transport next.',
        likesCount: 1,
        isTeacherReply: true,
        videoId: 'M7lc1UVf-VE',
      },
    ],
  });

  // 8. Test Series & Quizzes
  console.log('📝 Seeding Test Series & Quizzes...');
  const testSeriesNeet = await prisma.testSeries.create({
    data: {
      id: 1,
      title: 'NEET 2026 Target All India Test Series',
      description: 'Comprehensive NTA pattern exam series containing 25 part tests and 10 full length mock tests with video solutions, percentile analysis, and AIR prediction.',
      categoryId: catNeet.id,
      thumbnailUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=500',
      price: 1499.0,
      discountPrice: 699.0,
      validityDays: 365,
      isPublished: true,
    },
  });

  const testSeriesJee = await prisma.testSeries.create({
    data: {
      id: 2,
      title: 'JEE Main 2026 Speed & Accuracy Booster',
      description: 'Full syllabus CBT mock tests designed to build speed and avoid negative marks.',
      categoryId: catJeeMain.id,
      thumbnailUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=500',
      price: 1299.0,
      discountPrice: 599.0,
      validityDays: 365,
      isPublished: true,
    },
  });

  await prisma.testSeries.create({
    data: {
      id: 3,
      title: 'Class 12 Physics Chapterwise Drill Series',
      description: 'Targeted chapterwise testing for board excellence and competitive foundation.',
      categoryId: catBoards.id,
      thumbnailUrl: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=500',
      price: 799.0,
      discountPrice: 299.0,
      validityDays: 180,
      isPublished: true,
    },
  });

  await prisma.testSeries.create({
    data: {
      id: 4,
      title: 'CUET General Test & Domain Subjects 2026',
      description: 'Section IA, Section II and General test preparation bundle.',
      categoryId: catCuet.id,
      thumbnailUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=500',
      price: 999.0,
      discountPrice: 399.0,
      validityDays: 240,
      isPublished: true,
    },
  });

  // Quizzes for Test Series 1
  const quiz101Instructions = [
    'The test consists of 10 multiple choice questions.',
    'Each question carries 4 marks for the correct answer.',
    'For each incorrect answer, 1 mark will be deducted (-1 negative marking).',
    'No marks will be deducted for unattempted questions.',
    'You can mark questions for review and return to them anytime before time expires.',
  ];

  const quiz101 = await prisma.quiz.create({
    data: {
      id: 101,
      testSeriesId: testSeriesNeet.id,
      title: 'NEET Full Mock Test 01 (NTA Pattern)',
      subject: 'Biology',
      durationMinutes: 180,
      totalMarks: 40.0,
      negativeMarks: 1.0,
      passingMarks: 16.0,
      isFree: true,
      isLocked: false,
      maxAttempts: 3,
      instructions: JSON.stringify(quiz101Instructions),
      isPublished: true,
    },
  });

  await prisma.quiz.create({
    data: {
      id: 102,
      testSeriesId: testSeriesNeet.id,
      title: 'NEET Full Mock Test 02 (High Yield)',
      subject: 'Biology',
      durationMinutes: 180,
      totalMarks: 40.0,
      negativeMarks: 1.0,
      passingMarks: 16.0,
      isFree: false,
      isLocked: true,
      maxAttempts: 3,
      instructions: JSON.stringify(quiz101Instructions),
      isPublished: true,
    },
  });

  const quiz103 = await prisma.quiz.create({
    data: {
      id: 103,
      testSeriesId: testSeriesNeet.id,
      title: 'Physics: Mechanics & Thermodynamics',
      subject: 'Physics',
      durationMinutes: 60,
      totalMarks: 40.0,
      negativeMarks: 1.0,
      passingMarks: 16.0,
      isFree: true,
      isLocked: false,
      maxAttempts: 3,
      instructions: JSON.stringify(quiz101Instructions),
      isPublished: true,
    },
  });

  await prisma.quiz.create({
    data: {
      id: 104,
      testSeriesId: testSeriesNeet.id,
      title: 'Chemistry: Organic & Coordination Chemistry',
      subject: 'Chemistry',
      durationMinutes: 60,
      totalMarks: 40.0,
      negativeMarks: 1.0,
      passingMarks: 16.0,
      isFree: false,
      isLocked: true,
      maxAttempts: 3,
      instructions: JSON.stringify(quiz101Instructions),
      isPublished: true,
    },
  });

  await prisma.quiz.create({
    data: {
      id: 105,
      testSeriesId: testSeriesNeet.id,
      title: 'Biology: Genetics, Ecology & Biotechnology',
      subject: 'Biology',
      durationMinutes: 60,
      totalMarks: 40.0,
      negativeMarks: 1.0,
      passingMarks: 16.0,
      isFree: false,
      isLocked: true,
      maxAttempts: 3,
      instructions: JSON.stringify(quiz101Instructions),
      isPublished: true,
    },
  });

  // Standalone Free Quizzes
  await prisma.quiz.create({
    data: {
      id: 201,
      testSeriesId: null,
      title: 'Daily NEET Biology Booster Quiz',
      subject: 'Biology',
      durationMinutes: 15,
      totalMarks: 40.0,
      negativeMarks: 1.0,
      passingMarks: 16.0,
      isFree: true,
      isLocked: false,
      maxAttempts: 3,
      instructions: JSON.stringify(quiz101Instructions),
      isPublished: true,
    },
  });

  const quiz202 = await prisma.quiz.create({
    data: {
      id: 202,
      testSeriesId: null,
      title: 'JEE Physics: Laws of Motion Rapid Test',
      subject: 'Physics',
      durationMinutes: 20,
      totalMarks: 40.0,
      negativeMarks: 1.0,
      passingMarks: 16.0,
      isFree: true,
      isLocked: false,
      maxAttempts: 3,
      instructions: JSON.stringify(quiz101Instructions),
      isPublished: true,
    },
  });

  await prisma.quiz.create({
    data: {
      id: 203,
      testSeriesId: null,
      title: 'Chemistry: Periodic Table & Chemical Bonding',
      subject: 'Chemistry',
      durationMinutes: 15,
      totalMarks: 40.0,
      negativeMarks: 1.0,
      passingMarks: 16.0,
      isFree: true,
      isLocked: false,
      maxAttempts: 3,
      instructions: JSON.stringify(quiz101Instructions),
      isPublished: true,
    },
  });
  console.log('✅ 8 Quizzes created');

  // 9. CBT Questions for Quiz 101
  console.log('❓ Seeding CBT Questions with Options & Marking scheme...');
  const questionsData = [
    {
      id: 1,
      quizId: quiz101.id,
      questionNumber: 1,
      questionText: 'Which of the following cell organelles is responsible for cellular respiration and ATP synthesis?',
      questionImageUrl: null,
      options: JSON.stringify(['Endoplasmic Reticulum', 'Mitochondria', 'Golgi Apparatus', 'Lysosome']),
      correctOption: 1,
      explanation: 'Mitochondria are known as the powerhouses of the cell where aerobic respiration occurs through the Krebs cycle and oxidative phosphorylation to generate ATP.',
      subject: 'Biology',
      topic: 'Cell Biology',
      marks: 4.0,
      negativeMarks: 1.0,
    },
    {
      id: 2,
      quizId: quiz101.id,
      questionNumber: 2,
      questionText: 'What is the SI unit of electric flux?',
      questionImageUrl: null,
      options: JSON.stringify(['Volt · meter (V·m)', 'Newton / Coulomb (N/C)', 'Tesla · meter squared (T·m²)', 'Joule / second (J/s)']),
      correctOption: 0,
      explanation: 'Electric flux is defined as Φ = E · A. Unit of E is V/m or N/C, so Φ = (V/m) * m² = Volt · meter (V·m).',
      subject: 'Physics',
      topic: 'Electrostatics',
      marks: 4.0,
      negativeMarks: 1.0,
    },
    {
      id: 3,
      quizId: quiz101.id,
      questionNumber: 3,
      questionText: 'Which of the following compounds exhibits optical isomerism?',
      questionImageUrl: null,
      options: JSON.stringify(['Lactic acid', 'Acetic acid', 'Propanoic acid', 'Methanol']),
      correctOption: 0,
      explanation: 'Lactic acid (CH3-CH(OH)-COOH) contains a chiral carbon atom bonded to four different groups (-H, -CH3, -OH, -COOH), making it optically active.',
      subject: 'Chemistry',
      topic: 'Organic Chemistry',
      marks: 4.0,
      negativeMarks: 1.0,
    },
    {
      id: 4,
      quizId: quiz101.id,
      questionNumber: 4,
      questionText: 'In photosynthesis, the oxygen liberated comes from the splitting of which molecule?',
      questionImageUrl: null,
      options: JSON.stringify(['Carbon Dioxide (CO2)', 'Water (H2O)', 'Glucose (C6H12O6)', 'Chlorophyll']),
      correctOption: 1,
      explanation: 'During the light-dependent reactions of photosynthesis, photolysis of water in Photosystem II releases electrons, protons, and oxygen gas.',
      subject: 'Biology',
      topic: 'Plant Physiology',
      marks: 4.0,
      negativeMarks: 1.0,
    },
    {
      id: 5,
      quizId: quiz101.id,
      questionNumber: 5,
      questionText: 'A body starts from rest and moves with uniform acceleration of 2 m/s². What distance does it cover in 5 seconds?',
      questionImageUrl: null,
      options: JSON.stringify(['10 meters', '20 meters', '25 meters', '50 meters']),
      correctOption: 2,
      explanation: 'Using s = ut + 0.5*a*t² with u=0: s = 0.5 * 2 * (5)² = 25 meters.',
      subject: 'Physics',
      topic: 'Kinematics',
      marks: 4.0,
      negativeMarks: 1.0,
    },
    {
      id: 6,
      quizId: quiz101.id,
      questionNumber: 6,
      questionText: 'What is the hybridization of the central atom in Xenon tetrafluoride (XeF4)?',
      questionImageUrl: null,
      options: JSON.stringify(['sp³', 'sp³d', 'sp³d²', 'dsp²']),
      correctOption: 2,
      explanation: 'XeF4 has 4 bonding pairs and 2 lone pairs around Xenon (total steric number = 6), which corresponds to sp³d² hybridization with a square planar geometry.',
      subject: 'Chemistry',
      topic: 'Chemical Bonding',
      marks: 4.0,
      negativeMarks: 1.0,
    },
    {
      id: 7,
      quizId: quiz101.id,
      questionNumber: 7,
      questionText: 'Which hormone regulates blood sugar by facilitating the cellular uptake of glucose?',
      questionImageUrl: null,
      options: JSON.stringify(['Glucagon', 'Insulin', 'Thyroxine', 'Adrenaline']),
      correctOption: 1,
      explanation: 'Insulin, secreted by beta cells of the islets of Langerhans in the pancreas, lowers blood glucose levels by promoting glucose transport into muscle and adipose cells.',
      subject: 'Biology',
      topic: 'Human Physiology',
      marks: 4.0,
      negativeMarks: 1.0,
    },
    {
      id: 8,
      quizId: quiz101.id,
      questionNumber: 8,
      questionText: 'If the radius of the Earth shrinks by 1% while its mass remains constant, the acceleration due to gravity on its surface would:',
      questionImageUrl: null,
      options: JSON.stringify(['Decrease by 2%', 'Increase by 2%', 'Increase by 1%', 'Remain unchanged']),
      correctOption: 1,
      explanation: 'g = GM/R². For small fractional changes, Δg/g ≈ -2(ΔR/R). Since ΔR/R = -1%, Δg/g = +2%, so gravity increases by 2%.',
      subject: 'Physics',
      topic: 'Gravitation',
      marks: 4.0,
      negativeMarks: 1.0,
    },
    {
      id: 9,
      quizId: quiz101.id,
      questionNumber: 9,
      questionText: 'Which of the following noble gases is radioactive?',
      questionImageUrl: null,
      options: JSON.stringify(['Argon (Ar)', 'Krypton (Kr)', 'Radon (Rn)', 'Xenon (Xe)']),
      correctOption: 2,
      explanation: 'Radon is a radioactive noble gas formed as part of the uranium and thorium radioactive decay chains.',
      subject: 'Chemistry',
      topic: 'p-Block Elements',
      marks: 4.0,
      negativeMarks: 1.0,
    },
    {
      id: 10,
      quizId: quiz101.id,
      questionNumber: 10,
      questionText: 'In DNA, which nitrogenous base forms two hydrogen bonds with Adenine?',
      questionImageUrl: null,
      options: JSON.stringify(['Guanine', 'Cytosine', 'Thymine', 'Uracil']),
      correctOption: 2,
      explanation: 'According to Chargaff\'s base-pairing rules, Adenine pairs with Thymine via two hydrogen bonds in DNA (and Uracil in RNA).',
      subject: 'Biology',
      topic: 'Genetics',
      marks: 4.0,
      negativeMarks: 1.0,
    },
  ];

  for (const q of questionsData) {
    await prisma.question.create({ data: q });
  }
  console.log('✅ 10 CBT Questions created with options and explanations');

  // 10. Quiz Attempts
  console.log('📊 Seeding Quiz Attempts...');
  await prisma.quizAttempt.create({
    data: {
      id: 500,
      quizId: quiz103.id,
      studentId: studentRahul.id,
      score: 28.0,
      totalMarks: 40.0,
      correctAnswers: 7,
      incorrectAnswers: 0,
      unattempted: 3,
      accuracy: 75.0,
      timeTakenSeconds: 2700,
      rank: 35,
      totalParticipants: 1200,
      percentile: 97.0,
      isPassed: true,
      answers: JSON.stringify({ '1': 0, '2': 0 }),
    },
  });

  await prisma.quizAttempt.create({
    data: {
      id: 501,
      quizId: quiz202.id,
      studentId: studentRahul.id,
      score: 32.0,
      totalMarks: 40.0,
      correctAnswers: 8,
      incorrectAnswers: 0,
      unattempted: 2,
      accuracy: 80.0,
      timeTakenSeconds: 1100,
      rank: 21,
      totalParticipants: 950,
      percentile: 98.2,
      isPassed: true,
      answers: JSON.stringify({ '1': 1, '2': 0 }),
    },
  });

  await prisma.quizAttempt.create({
    data: {
      id: 502,
      quizId: quiz101.id,
      studentId: studentRahul.id,
      score: 34.0,
      totalMarks: 40.0,
      correctAnswers: 9,
      incorrectAnswers: 1,
      unattempted: 0,
      accuracy: 90.0,
      timeTakenSeconds: 3600,
      rank: 14,
      totalParticipants: 2840,
      percentile: 99.5,
      isPassed: true,
      certificateUrl: 'https://edu.d3vx.in/test-series/certificates/CERT-NEET-502.pdf',
      answers: JSON.stringify({
        '1': 1,
        '2': 0,
        '3': 0,
        '4': 1,
        '5': 1, // incorrect (selected 1, correct is 2)
        '6': 2,
        '7': 1,
        '8': 1,
        '9': 2,
        '10': 2,
      }),
    },
  });
  console.log('✅ 3 Quiz Attempts created for Rahul Sharma');

  // 11. Doubts & Replies
  console.log('🙋 Seeding Doubts & Faculty Replies...');
  const doubt1 = await prisma.doubt.create({
    data: {
      id: 1,
      studentId: studentRahul.id,
      studentName: 'Rahul Sharma',
      studentAvatar: studentRahul.avatarUrl,
      subject: 'Biology',
      question: 'How does ATP synthase use the proton gradient to convert ADP + Pi into ATP?',
      status: 'solved',
    },
  });

  await prisma.doubtReply.create({
    data: {
      id: 101,
      doubtId: doubt1.id,
      authorId: 99,
      authorName: 'Dr. Ananya Sen (Faculty)',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      authorType: 'teacher',
      message: 'According to Mitchell\'s chemiosmotic hypothesis, protons accumulate in the intermembrane space creating a proton motive force. As protons flow back through the F0 channel of ATP synthase, rotation of the F1 catalytic subunit induces conformational changes that synthesize ATP.',
    },
  });

  await prisma.doubt.create({
    data: {
      id: 2,
      studentId: studentRahul.id,
      studentName: 'Rahul Sharma',
      studentAvatar: studentRahul.avatarUrl,
      subject: 'Physics',
      question: 'Can a body have zero velocity but non-zero acceleration? Please provide a real-life example.',
      status: 'pending',
    },
  });

  const doubt3 = await prisma.doubt.create({
    data: {
      id: 3,
      studentId: studentPriya.id,
      studentName: 'Priya Patel',
      studentAvatar: studentPriya.avatarUrl,
      subject: 'Chemistry',
      question: 'Why is o-nitrophenol steam volatile while p-nitrophenol is not?',
      status: 'solved',
    },
  });

  await prisma.doubtReply.create({
    data: {
      id: 102,
      doubtId: doubt3.id,
      authorId: 98,
      authorName: 'Prof. Singhania',
      authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      authorType: 'teacher',
      message: 'o-Nitrophenol has intramolecular hydrogen bonding forming a chelate ring, which prevents intermolecular association. In contrast, p-nitrophenol forms intermolecular hydrogen bonds leading to higher boiling point and non-volatility.',
    },
  });
  console.log('✅ 3 Doubts & replies seeded');

  // 12. Community Feed
  console.log('👥 Seeding Community Posts, Likes & Comments...');
  const post1 = await prisma.communityPost.create({
    data: {
      id: 1,
      authorId: studentAarav.id,
      authorName: 'Aarav Gupta',
      authorAvatar: studentAarav.avatarUrl,
      content: 'Just scored 99.2 percentile in NEET Full Mock 01! The key was keeping cool during Physics calculations and managing time well. Consistency is key, guys!',
      likeCount: 54,
      replyCount: 12,
      isPinned: true,
    },
  });

  const post2 = await prisma.communityPost.create({
    data: {
      id: 2,
      authorId: studentSanya.id,
      authorName: 'Sanya Verma',
      authorAvatar: studentSanya.avatarUrl,
      content: 'Here is my 3-step revision routine for Organic Chemistry conversions:\n1. Write reaction maps on chart paper.\n2. Practice 10 conversions daily.\n3. Identify electrophile & nucleophile in every reaction.',
      imageUrl: 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=600',
      likeCount: 88,
      replyCount: 23,
    },
  });

  await prisma.communityPost.create({
    data: {
      id: 3,
      authorId: studentDevansh.id,
      authorName: 'Devansh Mukherjee',
      authorAvatar: studentDevansh.avatarUrl,
      content: 'Does anyone have short revision notes for Semiconductor Electronics (Logic Gates and Diodes)? Looking to revise before tomorrow\'s test.',
      likeCount: 19,
      replyCount: 7,
    },
  });

  await prisma.communityPost.create({
    data: {
      id: 4,
      authorId: studentKavya.id,
      authorName: 'Kavya Nair',
      authorAvatar: studentKavya.avatarUrl,
      content: 'Remember: Negative marking is where ranks are lost. If you cannot eliminate at least two options, it\'s wiser to skip and save your score!',
      likeCount: 62,
      replyCount: 9,
    },
  });

  const post5 = await prisma.communityPost.create({
    data: {
      id: 5,
      authorId: studentRohan.id,
      authorName: 'Rohan Mehra',
      authorAvatar: studentRohan.avatarUrl,
      content: 'Completed the entire Class 12 NCERT Biology exemplar today! Feeling super confident for upcoming tests.',
      likeCount: 41,
      replyCount: 5,
    },
  });

  // Likes from Rahul
  await prisma.communityLike.createMany({
    data: [
      { postId: post2.id, studentId: studentRahul.id },
      { postId: post5.id, studentId: studentRahul.id },
    ],
  });

  // Comments
  await prisma.communityComment.createMany({
    data: [
      {
        postId: post1.id,
        studentId: studentRahul.id,
        authorName: 'Rahul Sharma',
        authorAvatar: studentRahul.avatarUrl,
        comment: 'Great job Aarav! What was your strategy for Organic Chemistry section?',
      },
      {
        postId: post2.id,
        studentId: studentPriya.id,
        authorName: 'Priya Patel',
        authorAvatar: studentPriya.avatarUrl,
        comment: 'This flowchart method really works wonders, thank you Sanya!',
      },
    ],
  });
  console.log('✅ 5 Community posts with likes and comments seeded');

  // 13. Ebooks & Resources
  console.log('📖 Seeding Ebooks & Study Resources...');
  await prisma.ebook.createMany({
    data: [
      {
        id: 1,
        title: 'NCERT Biology Class 12 High-Yield Highlights',
        author: 'Academic Panel',
        description: 'Every line from NCERT annotated with past 10 years NEET questions and diagram breakdowns.',
        coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400',
        pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        pageCount: 180,
        fileSize: '14.2 MB',
        isFree: true,
      },
      {
        id: 2,
        title: 'Handbook of Physics Formulas & Key Derivations',
        author: 'Prof. R. Verma',
        description: 'Quick pocket formula book for Class 11 and 12 physics with dimensional formulas and SI units.',
        coverUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400',
        pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        pageCount: 120,
        fileSize: '8.5 MB',
        isFree: true,
      },
      {
        id: 3,
        title: 'Organic Chemistry Named Reactions & Reagents',
        author: 'Dr. N. Singhania',
        description: 'Comprehensive catalog of all 65 reaction mechanisms required for competitive exams.',
        coverUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400',
        pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        pageCount: 95,
        fileSize: '6.1 MB',
        isFree: false,
      },
      {
        id: 4,
        title: 'Previous 10 Years NEET Solved Question Papers',
        author: 'Editorial Board',
        description: 'Authentic questions with detailed analytical step-by-step solutions and trend analysis.',
        coverUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400',
        pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        pageCount: 320,
        fileSize: '28.4 MB',
        isFree: false,
      },
    ],
  });

  await prisma.resource.createMany({
    data: [
      {
        id: 1,
        title: 'NTA NEET 2026 Official Information Bulletin & Syllabus',
        type: 'pdf',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileSize: '4.8 MB',
      },
      {
        id: 2,
        title: 'Physics Mechanics Quick Formula Sheet (High-Res)',
        type: 'pdf',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileSize: '2.1 MB',
      },
      {
        id: 3,
        title: 'Inorganic Chemistry Periodic Table & Trends Map',
        type: 'pdf',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileSize: '3.4 MB',
      },
      {
        id: 4,
        title: 'Biology High-Frequency Diagrams for Quick Revision',
        type: 'pdf',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileSize: '5.6 MB',
      },
    ],
  });
  console.log('✅ 4 Ebooks & 4 Resources seeded');

  // 14. Live Classes
  console.log('📺 Seeding Live Classes...');
  await prisma.liveClass.createMany({
    data: [
      {
        id: 1,
        title: 'Live Doubt Clearing: Ray Optics & Wave Optics',
        subject: 'Physics',
        instructorName: 'Prof. Rajesh Verma',
        thumbnailUrl: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=500',
        scheduledAt: new Date(Date.now() + 86400000), // tomorrow
        durationMinutes: 90,
        status: 'upcoming',
        streamUrl: 'https://www.youtube.com/watch?v=M7lc1UVf-VE',
      },
      {
        id: 2,
        title: 'Mega Marathon: Complete Ecology in 3 Hours',
        subject: 'Biology',
        instructorName: 'Dr. Ananya Sen',
        thumbnailUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=500',
        scheduledAt: new Date(Date.now() + 172800000), // day after tomorrow
        durationMinutes: 180,
        status: 'upcoming',
        streamUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      },
      {
        id: 3,
        title: 'Chemical Kinetics & Surface Chemistry Rapid Fire',
        subject: 'Chemistry',
        instructorName: 'Dr. Neeraj Singhania',
        thumbnailUrl: 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=500',
        scheduledAt: new Date(Date.now() + 259200000),
        durationMinutes: 60,
        status: 'upcoming',
        streamUrl: 'https://www.youtube.com/watch?v=M7lc1UVf-VE',
      },
    ],
  });
  console.log('✅ 3 Live Classes seeded');

  // 15. Orders & Enrollments
  console.log('💳 Seeding Orders & Enrollments...');
  const order1 = await prisma.order.create({
    data: {
      id: 1,
      orderNumber: 'order_edu_1730000001',
      studentId: studentRahul.id,
      itemType: 'course',
      itemId: course101.id,
      courseId: course101.id,
      itemName: 'Complete Biology Masterclass for NEET 2026',
      amount: 999.0,
      currency: 'INR',
      razorpayOrderId: 'order_mock_edu_001',
      razorpayPaymentId: 'pay_mock_edu_001',
      razorpaySignature: 'sig_mock_edu_001',
      status: 'paid',
    },
  });

  const order2 = await prisma.order.create({
    data: {
      id: 2,
      orderNumber: 'order_edu_1730000002',
      studentId: studentRahul.id,
      itemType: 'test_series',
      itemId: testSeriesJee.id,
      testSeriesId: testSeriesJee.id,
      itemName: 'JEE Main 2026 Speed & Accuracy Booster',
      amount: 599.0,
      currency: 'INR',
      razorpayOrderId: 'order_mock_edu_002',
      razorpayPaymentId: 'pay_mock_edu_002',
      razorpaySignature: 'sig_mock_edu_002',
      status: 'paid',
    },
  });

  await prisma.order.create({
    data: {
      id: 3,
      orderNumber: 'order_edu_1730000003',
      studentId: studentPriya.id,
      itemType: 'test_series',
      itemId: testSeriesNeet.id,
      testSeriesId: testSeriesNeet.id,
      itemName: 'NEET 2026 Target All India Test Series',
      amount: 699.0,
      currency: 'INR',
      razorpayOrderId: 'order_mock_edu_003',
      razorpayPaymentId: 'pay_mock_edu_003',
      razorpaySignature: 'sig_mock_edu_003',
      status: 'paid',
    },
  });

  // Enrollments
  const oneYearExpiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
  await prisma.enrollment.createMany({
    data: [
      {
        id: 1,
        studentId: studentRahul.id,
        itemType: 'course',
        itemId: course101.id,
        courseId: course101.id,
        validUntil: oneYearExpiry,
        isActive: true,
      },
      {
        id: 2,
        studentId: studentRahul.id,
        itemType: 'test_series',
        itemId: testSeriesJee.id,
        testSeriesId: testSeriesJee.id,
        validUntil: oneYearExpiry,
        isActive: true,
      },
      {
        id: 3,
        studentId: studentPriya.id,
        itemType: 'test_series',
        itemId: testSeriesNeet.id,
        testSeriesId: testSeriesNeet.id,
        validUntil: oneYearExpiry,
        isActive: true,
      },
    ],
  });
  console.log('✅ Orders & Enrollments seeded');

  // 16. Coupons
  console.log('🎟️ Seeding Coupons...');
  await prisma.coupon.createMany({
    data: [
      {
        id: 1,
        code: 'FLAT50',
        discountType: 'percentage',
        discountValue: 50.0,
        minOrderAmount: 500.0,
        maxDiscount: 1000.0,
        validUntil: oneYearExpiry,
        usageLimit: 500,
        usedCount: 42,
        isActive: true,
      },
      {
        id: 2,
        code: 'EARLYBIRD',
        discountType: 'percentage',
        discountValue: 30.0,
        minOrderAmount: 300.0,
        maxDiscount: 500.0,
        validUntil: oneYearExpiry,
        usageLimit: 200,
        usedCount: 88,
        isActive: true,
      },
      {
        id: 3,
        code: 'WELCOME100',
        discountType: 'fixed',
        discountValue: 100.0,
        minOrderAmount: 400.0,
        validUntil: oneYearExpiry,
        usageLimit: 1000,
        usedCount: 154,
        isActive: true,
      },
    ],
  });
  console.log('✅ 3 Coupons seeded');

  // 17. Announcements & Notifications
  console.log('📢 Seeding Announcements & Notifications...');
  await prisma.announcement.createMany({
    data: [
      {
        id: 1,
        title: 'NEET 2026 All India Mock Test 01 is Now Live!',
        content: 'All enrolled students can take the exam between 9 AM and 9 PM. Instant detailed solutions and All India Rank will be released.',
        targetAudience: 'all',
        isPublished: true,
      },
      {
        id: 2,
        title: 'Scheduled Maintenance Window',
        content: 'Platform updates will occur this Sunday from 2:00 AM to 4:00 AM IST. All test sessions should be submitted prior.',
        targetAudience: 'all',
        isPublished: true,
      },
    ],
  });

  await prisma.notification.createMany({
    data: [
      {
        id: 1,
        studentId: studentRahul.id,
        title: 'Test Result Published',
        body: 'You scored 34/40 in NEET Full Mock Test 01. Click to view analysis.',
        actionUrl: '/quiz-attempts/502',
        isRead: true,
      },
      {
        id: 2,
        studentId: null, // Broadcast
        title: 'Live Class Tonight at 5:00 PM',
        body: 'Join Prof. Rajesh Verma for Ray Optics Doubt Clearing.',
        actionUrl: '/live',
        isRead: false,
      },
    ],
  });
  console.log('✅ Announcements & Notifications seeded');

  // 18. Deletion Requests
  console.log('🗑️ Seeding Deletion Request queue...');
  await prisma.deletionRequest.create({
    data: {
      id: 1,
      studentId: studentPriya.id,
      reason: 'Switching to offline coaching institute.',
      status: 'pending',
    },
  });

  // 19. Platform Settings
  console.log('⚙️ Seeding Platform Settings...');
  const settingsList = [
    { key: 'platform_name', value: 'Webphiser Education System', category: 'general' },
    { key: 'support_email', value: 'support@d3vx.in', category: 'general' },
    { key: 'support_phone', value: '+91 9876543210', category: 'general' },
    { key: 'currency', value: 'INR', category: 'general' },
    { key: 'razorpay_key_id', value: 'rzp_test_mock_edu9988', category: 'razorpay' },
    { key: 'razorpay_key_secret', value: 'mock_secret_key_edu_2026', category: 'razorpay' },
    { key: 'site_logo', value: 'https://edu.d3vx.in/assets/logo.png', category: 'branding' },
    { key: 'brand_color', value: '#09214b', category: 'branding' },
    { key: 'brand_accent', value: '#e0a028', category: 'branding' },
  ];

  for (const s of settingsList) {
    await prisma.setting.create({ data: s });
  }
  console.log('✅ Settings seeded');

  // 20. AI Academic Tutor Configuration & Logs
  console.log('🤖 Seeding AI Tutor Configuration & Logs...');
  await prisma.aiConfig.create({
    data: {
      id: 1,
      systemPrompt: 'You are an expert AI Academic Tutor for NEET & JEE competitive exams in India. Provide conceptual, encouraging, and step-by-step explanations for Physics, Chemistry, and Biology questions.',
      model: 'gpt-4o-mini',
      temperature: 0.7,
      maxTokens: 1000,
    },
  });

  await prisma.aiAuditLog.create({
    data: {
      id: 1,
      studentId: studentRahul.id,
      query: 'Can you explain Lenz\'s law with an example?',
      response: 'In physics, Lenz\'s law states that the direction of induced current opposes the change in magnetic flux that produces it. This is directly derived from the law of conservation of energy.',
      suggestions: JSON.stringify([
        'How is Lenz\'s law applied in transformers?',
        'Give an example problem on Faraday\'s Law.',
        'What are eddy currents?',
      ]),
    },
  });
  console.log('✅ AI Config & Audit Log seeded');

  console.log('🎉 Comprehensive database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeder encountered an error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
