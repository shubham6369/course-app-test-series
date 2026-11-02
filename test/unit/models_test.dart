import 'package:flutter_test/flutter_test.dart';
import 'package:test_series/models/models.dart';

void main() {
  group('Domain Models Serialization Tests', () {
    test('Student round-trip serialization and copyWith', () {
      final now = DateTime.now();
      final original = Student(
        id: 1001,
        name: 'Aarav Sharma',
        email: 'aarav@example.com',
        phone: '9876543210',
        avatarUrl: 'https://example.com/avatar.jpg',
        classId: '12',
        targetExam: 'NEET 2026',
        token: 'token_abc123',
        createdAt: now,
      );

      final json = original.toJson();
      final deserialized = Student.fromJson(json);

      expect(deserialized.id, equals(original.id));
      expect(deserialized.name, equals(original.name));
      expect(deserialized.email, equals(original.email));
      expect(deserialized.phone, equals(original.phone));
      expect(deserialized.avatarUrl, equals(original.avatarUrl));
      expect(deserialized.classId, equals(original.classId));
      expect(deserialized.targetExam, equals(original.targetExam));
      expect(deserialized.token, equals(original.token));
      expect(deserialized.createdAt?.toIso8601String(), equals(now.toIso8601String()));

      // Test string id fallback
      final withStringId = Student.fromJson({'id': '2002', 'name': 'Priya'});
      expect(withStringId.id, equals(2002));
      expect(withStringId.name, equals('Priya'));

      // Test copyWith
      final updated = original.copyWith(name: 'Aarav Kumar', targetExam: 'JEE Advanced');
      expect(updated.name, equals('Aarav Kumar'));
      expect(updated.targetExam, equals('JEE Advanced'));
      expect(updated.phone, equals(original.phone));
      expect(updated.id, equals(original.id));
      expect(updated.toString(), contains('Aarav Kumar'));
    });

    test('BannerItem round-trip serialization', () {
      final banner = BannerItem(
        id: 1,
        title: 'Crash Course NEET 2026',
        imageUrl: 'https://example.com/banner1.jpg',
        actionType: 'course',
        actionValue: '101',
        order: 1,
      );

      final json = banner.toJson();
      final fromJson = BannerItem.fromJson(json);

      expect(fromJson.id, equals(1));
      expect(fromJson.title, equals('Crash Course NEET 2026'));
      expect(fromJson.imageUrl, equals('https://example.com/banner1.jpg'));
      expect(fromJson.actionType, equals('course'));
      expect(fromJson.actionValue, equals('101'));
      expect(fromJson.order, equals(1));
    });

    test('HomeFeed round-trip serialization and empty factory', () {
      final empty = HomeFeed.empty();
      expect(empty.banners, isEmpty);
      expect(empty.categories, isEmpty);
      expect(empty.popularCourses, isEmpty);
      expect(empty.featuredTestSeries, isEmpty);
      expect(empty.freeQuizzes, isEmpty);

      final homeFeed = HomeFeed(
        banners: [
          BannerItem(id: 1, title: 'B1', imageUrl: 'img1.png'),
        ],
        categories: [
          {'id': 1, 'name': 'Physics'},
          {'id': 2, 'name': 'Chemistry'},
        ],
        featuredTestSeries: [
          TestSeriesSummary(id: 1, title: 'All India Test Series', price: 999.0),
        ],
        popularCourses: [
          Course(id: 10, title: 'Master Organic Chemistry', slug: 'organic-chem', price: 499.0),
        ],
        freeQuizzes: [
          QuizSummary(id: 50, title: 'Daily Physics Booster', durationMinutes: 15, totalQuestions: 10, totalMarks: 40.0),
        ],
        recentAttempts: [
          AttemptSummary(attemptId: 99, quizId: 50, title: 'Daily Physics Booster', score: 36.0, totalMarks: 40.0, date: DateTime(2026, 10, 30)),
        ],
      );

      final json = homeFeed.toJson();
      final parsed = HomeFeed.fromJson(json);

      expect(parsed.banners.length, equals(1));
      expect(parsed.categories.length, equals(2));
      expect(parsed.featuredTestSeries.first.title, equals('All India Test Series'));
      expect(parsed.popularCourses.first.slug, equals('organic-chem'));
      expect(parsed.freeQuizzes.first.durationMinutes, equals(15));
      expect(parsed.recentAttempts.first.score, equals(36.0));
    });

    test('CourseFolder and Lesson round-trip serialization', () {
      final lesson1 = Lesson(
        id: 11,
        folderId: 101,
        title: 'Introduction to Kinematics',
        description: 'Basics of velocity and acceleration',
        videoId: 'dQw4w9WgXcQ',
        durationMinutes: 45,
        isFreePreview: true,
        order: 1,
        pdfUrl: 'https://example.com/notes.pdf',
      );

      final folder = CourseFolder(
        id: 101,
        courseId: 5,
        title: 'Mechanics Module 1',
        order: 1,
        lessons: [lesson1],
      );

      final json = folder.toJson();
      final parsedFolder = CourseFolder.fromJson(json);

      expect(parsedFolder.id, equals(101));
      expect(parsedFolder.courseId, equals(5));
      expect(parsedFolder.title, equals('Mechanics Module 1'));
      expect(parsedFolder.lessons.length, equals(1));

      final parsedLesson = parsedFolder.lessons.first;
      expect(parsedLesson.id, equals(11));
      expect(parsedLesson.title, equals('Introduction to Kinematics'));
      expect(parsedLesson.videoId, equals('dQw4w9WgXcQ'));
      expect(parsedLesson.durationMinutes, equals(45));
      expect(parsedLesson.isFreePreview, isTrue);
      expect(parsedLesson.pdfUrl, equals('https://example.com/notes.pdf'));
    });

    test('Course with folders round-trip serialization', () {
      final course = Course(
        id: 1,
        title: 'NEET Complete Physics Masterclass',
        slug: 'neet-complete-physics',
        description: 'Comprehensive physics curriculum for NEET 2026',
        thumbnailUrl: 'https://example.com/physics.png',
        price: 1999.0,
        discountPrice: 1499.0,
        isEnrolled: true,
        totalLessons: 120,
        totalDurationMinutes: 5400,
        instructorName: 'Dr. H. C. Verma',
        folders: [
          CourseFolder(
            id: 1,
            courseId: 1,
            title: 'Electrostatics',
            lessons: [
              Lesson(
                id: 101,
                folderId: 1,
                title: 'Coulomb\'s Law',
                videoId: 'vid123',
                durationMinutes: 30,
              ),
            ],
          ),
        ],
      );

      final json = course.toJson();
      final parsed = Course.fromJson(json);

      expect(parsed.id, equals(1));
      expect(parsed.title, equals('NEET Complete Physics Masterclass'));
      expect(parsed.isEnrolled, isTrue);
      expect(parsed.price, equals(1999.0));
      expect(parsed.discountPrice, equals(1499.0));
      expect(parsed.folders, isNotNull);
      expect(parsed.folders!.first.lessons.first.videoId, equals('vid123'));
    });

    test('VideoComment round-trip serialization', () {
      final now = DateTime.now();
      final comment = VideoComment(
        id: 201,
        lessonId: 101,
        studentId: 5,
        studentName: 'Rohan Gupta',
        studentAvatar: 'https://example.com/rohan.jpg',
        comment: 'Great explanation of electric flux!',
        createdAt: now,
      );

      final json = comment.toJson();
      final parsed = VideoComment.fromJson(json);

      expect(parsed.id, equals(201));
      expect(parsed.studentName, equals('Rohan Gupta'));
      expect(parsed.comment, equals('Great explanation of electric flux!'));
      expect(parsed.createdAt.toIso8601String(), equals(now.toIso8601String()));
    });

    test('TestSeriesSummary and TestSeriesDetail round-trip serialization', () {
      final summary = TestSeriesSummary(
        id: 10,
        title: 'NEET Grand Mock Test Series 2026',
        category: 'Medical',
        thumbnailUrl: 'https://example.com/neet.png',
        totalTests: 25,
        freeTests: 3,
        price: 1499.0,
        discountPrice: 999.0,
        isPurchased: true,
        validityDays: 180,
      );

      final summaryJson = summary.toJson();
      final parsedSummary = TestSeriesSummary.fromJson(summaryJson);
      expect(parsedSummary.id, equals(10));
      expect(parsedSummary.totalTests, equals(25));
      expect(parsedSummary.freeTests, equals(3));
      expect(parsedSummary.isPurchased, isTrue);

      final detail = TestSeriesDetail(
        id: 10,
        title: 'NEET Grand Mock Test Series 2026',
        description: 'Complete mock tests with CBT engine & All India ranking',
        category: 'Medical',
        price: 1499.0,
        discountPrice: 999.0,
        isPurchased: true,
        validityDays: 180,
        quizzes: [
          SeriesQuiz(
            id: 101,
            testSeriesId: 10,
            title: 'NEET Full Mock 1',
            durationMinutes: 180,
            totalQuestions: 180,
            totalMarks: 720.0,
            isFree: true,
            isLocked: false,
            isAttempted: true,
            bestScore: 650,
            maxAttempts: 3,
            attemptsTaken: 1,
          ),
        ],
      );

      final detailJson = detail.toJson();
      final parsedDetail = TestSeriesDetail.fromJson(detailJson);

      expect(parsedDetail.id, equals(10));
      expect(parsedDetail.quizzes.length, equals(1));
      expect(parsedDetail.quizzes.first.totalQuestions, equals(180));
      expect(parsedDetail.quizzes.first.totalMarks, equals(720.0));
      expect(parsedDetail.quizzes.first.bestScore, equals(650));
    });

    test('QuizPaper and QuizQuestion round-trip serialization', () {
      final question = QuizQuestion(
        id: 1,
        questionNumber: 1,
        questionText: 'What is the SI unit of electric field?',
        questionImageUrl: null,
        options: ['N/C', 'J/C', 'V·m', 'Tesla'],
        optionImages: null,
        correctOption: 0,
        explanation: 'Electric field is defined as force per unit charge (E = F/q), hence N/C or V/m.',
        subject: 'Physics',
        topic: 'Electrostatics',
        marks: 4.0,
        negativeMarks: 1.0,
      );

      final paper = QuizPaper(
        id: 501,
        title: 'Physics Mini Mock Test',
        durationMinutes: 60,
        totalMarks: 40.0,
        negativeMarks: 1.0,
        instructions: ['Each correct question gives 4 marks', 'Incorrect answer deducts 1 mark'],
        questions: [question],
      );

      final json = paper.toJson();
      final parsed = QuizPaper.fromJson(json);

      expect(parsed.id, equals(501));
      expect(parsed.durationMinutes, equals(60));
      expect(parsed.instructions.length, equals(2));
      expect(parsed.questions.length, equals(1));

      final q = parsed.questions.first;
      expect(q.id, equals(1));
      expect(q.questionNumber, equals(1));
      expect(q.options.length, equals(4));
      expect(q.correctOption, equals(0));
      expect(q.marks, equals(4.0));
      expect(q.negativeMarks, equals(1.0));
    });

    test('QuizResult, QuizAttemptSummary, and AttemptSummary round-trip serialization', () {
      final now = DateTime.now();

      final result = QuizResult(
        attemptId: 888,
        quizId: 501,
        quizTitle: 'Physics Mini Mock Test',
        score: 36.0,
        totalMarks: 40.0,
        correctAnswers: 9,
        incorrectAnswers: 1,
        unattempted: 0,
        accuracy: 90.0,
        timeTakenSeconds: 1800,
        rank: 4,
        totalParticipants: 250,
        percentile: 98.4,
        isPassed: true,
        certificateUrl: 'https://example.com/cert/888.pdf',
      );

      final rJson = result.toJson();
      final parsedResult = QuizResult.fromJson(rJson);

      expect(parsedResult.attemptId, equals(888));
      expect(parsedResult.score, equals(36.0));
      expect(parsedResult.rank, equals(4));
      expect(parsedResult.percentile, equals(98.4));
      expect(parsedResult.certificateUrl, isNotNull);

      final attemptSummary = AttemptSummary(
        attemptId: 888,
        quizId: 501,
        title: 'Physics Mini Mock Test',
        score: 36.0,
        totalMarks: 40.0,
        date: now,
      );
      final asJson = attemptSummary.toJson();
      final parsedAttempt = AttemptSummary.fromJson(asJson);
      expect(parsedAttempt.attemptId, equals(888));
      expect(parsedAttempt.title, equals('Physics Mini Mock Test'));

      final quizAttemptSummary = QuizAttemptSummary(
        id: 1,
        quizId: 501,
        quizTitle: 'Physics Mini Mock Test',
        score: 36.0,
        totalMarks: 40.0,
        accuracy: 90.0,
        completedAt: now,
      );
      final qasJson = quizAttemptSummary.toJson();
      final parsedQas = QuizAttemptSummary.fromJson(qasJson);
      expect(parsedQas.id, equals(1));
      expect(parsedQas.accuracy, equals(90.0));
    });

    test('QuestionReview round-trip serialization', () {
      final question = QuizQuestion(
        id: 1,
        questionNumber: 1,
        questionText: 'Light year is a unit of?',
        options: ['Time', 'Distance', 'Intensity', 'Mass'],
        correctOption: 1,
      );

      final review = QuestionReview(
        question: question,
        selectedOption: 1,
        isCorrect: true,
        timeSpentSeconds: 45,
        markedForReview: false,
      );

      final json = review.toJson();
      final parsed = QuestionReview.fromJson(json);

      expect(parsed.question.id, equals(1));
      expect(parsed.selectedOption, equals(1));
      expect(parsed.isCorrect, isTrue);
      expect(parsed.timeSpentSeconds, equals(45));
    });

    test('FocusArea, ScorePoint, SeriesPerformance, and TestAnalytics round-trip serialization', () {
      final focus = FocusArea(
        topic: 'Optics',
        subject: 'Physics',
        accuracyPercentage: 88.5,
        questionsAttempted: 40,
        status: 'strong',
      );
      final fJson = focus.toJson();
      final parsedFocus = FocusArea.fromJson(fJson);
      expect(parsedFocus.topic, equals('Optics'));
      expect(parsedFocus.accuracyPercentage, equals(88.5));
      expect(parsedFocus.status, equals('strong'));

      final point = ScorePoint(label: 'Test 1', score: 85.0, accuracy: 92.0);
      final pJson = point.toJson();
      final parsedPoint = ScorePoint.fromJson(pJson);
      expect(parsedPoint.label, equals('Test 1'));
      expect(parsedPoint.score, equals(85.0));

      final performance = SeriesPerformance(
        testSeriesId: 10,
        seriesTitle: 'NEET Grand Series',
        testsCompleted: 5,
        totalTests: 25,
        avgScore: 580.0,
        bestScore: 640.0,
        avgAccuracy: 84.5,
        history: [point],
      );
      final perfJson = performance.toJson();
      final parsedPerf = SeriesPerformance.fromJson(perfJson);
      expect(parsedPerf.testSeriesId, equals(10));
      expect(parsedPerf.history.length, equals(1));

      final analytics = TestAnalytics(
        totalTestsAttempted: 12,
        totalQuestionsAnswered: 720,
        overallAccuracy: 86.4,
        overallRank: 15,
        scoreTrend: [point],
        focusAreas: [focus],
      );
      final anJson = analytics.toJson();
      final parsedAnalytics = TestAnalytics.fromJson(anJson);
      expect(parsedAnalytics.totalTestsAttempted, equals(12));
      expect(parsedAnalytics.focusAreas.first.topic, equals('Optics'));
    });

    test('Doubt and DoubtReply round-trip serialization', () {
      final now = DateTime.now();
      final reply = DoubtReply(
        id: 1,
        doubtId: 44,
        authorId: 10,
        authorName: 'Prof. Sharma',
        authorAvatar: 'https://example.com/prof.jpg',
        authorType: 'teacher',
        message: 'Recall that work done by a conservative force along a closed path is zero.',
        createdAt: now,
      );

      final doubt = Doubt(
        id: 44,
        studentId: 1001,
        studentName: 'Aarav Sharma',
        subject: 'Physics',
        question: 'Why is gravitational potential energy always negative?',
        status: 'answered',
        createdAt: now,
        replies: [reply],
      );

      final json = doubt.toJson();
      final parsedDoubt = Doubt.fromJson(json);

      expect(parsedDoubt.id, equals(44));
      expect(parsedDoubt.studentName, equals('Aarav Sharma'));
      expect(parsedDoubt.subject, equals('Physics'));
      expect(parsedDoubt.status, equals('answered'));
      expect(parsedDoubt.replies, isNotNull);
      expect(parsedDoubt.replies!.length, equals(1));
      expect(parsedDoubt.replies!.first.authorType, equals('teacher'));
    });

    test('CommunityPost round-trip serialization', () {
      final now = DateTime.now();
      final post = CommunityPost(
        id: 701,
        authorId: 1001,
        authorName: 'Sneha Patel',
        authorAvatar: 'https://example.com/sneha.png',
        content: 'Anyone having tips for organic reaction mechanisms?',
        imageUrl: 'https://example.com/reactions.jpg',
        likeCount: 24,
        replyCount: 8,
        isLiked: true,
        createdAt: now,
      );

      final json = post.toJson();
      final parsed = CommunityPost.fromJson(json);

      expect(parsed.id, equals(701));
      expect(parsed.authorName, equals('Sneha Patel'));
      expect(parsed.likeCount, equals(24));
      expect(parsed.isLiked, isTrue);
    });

    test('LiveClass, Ebook, and Resource round-trip serialization', () {
      final now = DateTime.now();

      final live = LiveClass(
        id: 301,
        title: 'Masterclass: Wave Optics High-Yield Problems',
        subject: 'Physics',
        instructorName: 'Er. Alok Gupta',
        thumbnailUrl: 'https://example.com/optics.jpg',
        scheduledAt: now.add(const Duration(hours: 2)),
        durationMinutes: 90,
        status: 'upcoming',
        streamUrl: 'https://stream.example.com/live/301',
      );
      final liveJson = live.toJson();
      final parsedLive = LiveClass.fromJson(liveJson);
      expect(parsedLive.id, equals(301));
      expect(parsedLive.durationMinutes, equals(90));
      expect(parsedLive.streamUrl, contains('301'));

      final ebook = Ebook(
        id: 401,
        title: 'Formula Cheat Sheet - Class 11 & 12 Physics',
        author: 'Faculty Team',
        description: 'Complete formulas for NEET & JEE revision',
        pdfUrl: 'https://example.com/formulas.pdf',
        pageCount: 64,
        fileSize: '4.2 MB',
        isFree: true,
      );
      final ebookJson = ebook.toJson();
      final parsedEbook = Ebook.fromJson(ebookJson);
      expect(parsedEbook.id, equals(401));
      expect(parsedEbook.pageCount, equals(64));
      expect(parsedEbook.isFree, isTrue);

      final resource = Resource(
        id: 501,
        title: 'NEET 2025 Solved Question Paper with Solutions',
        type: 'pdf',
        fileUrl: 'https://example.com/neet2025.pdf',
        fileSize: '8.5 MB',
        createdAt: now,
      );
      final resourceJson = resource.toJson();
      final parsedResource = Resource.fromJson(resourceJson);
      expect(parsedResource.id, equals(501));
      expect(parsedResource.type, equals('pdf'));
    });

    test('AiMessage and AiReply round-trip serialization', () {
      final now = DateTime.now();
      final msg = AiMessage(
        id: 'msg_1',
        sender: 'user',
        text: 'What is Bernoulli\'s principle?',
        timestamp: now,
      );
      final msgJson = msg.toJson();
      final parsedMsg = AiMessage.fromJson(msgJson);
      expect(parsedMsg.id, equals('msg_1'));
      expect(parsedMsg.text, contains('Bernoulli'));

      final reply = AiReply(
        message: 'Bernoulli\'s principle states that an increase in the speed of a fluid occurs simultaneously with a decrease in static pressure.',
        suggestions: [
          'Show equation of continuity',
          'Give real world examples',
          'Practice quiz on fluids',
        ],
      );
      final replyJson = reply.toJson();
      final parsedReply = AiReply.fromJson(replyJson);
      expect(parsedReply.message, contains('pressure'));
      expect(parsedReply.suggestions.length, equals(3));
    });

    test('CheckoutSession and RazorpayOptions round-trip serialization', () {
      final session = CheckoutSession(
        orderId: 'order_test_123',
        amount: 999.0,
        currency: 'INR',
        keyId: 'rzp_test_mock_key',
        itemName: 'NEET Test Series 2026',
        userEmail: 'student@example.com',
        userPhone: '9876543210',
      );
      final sessionJson = session.toJson();
      final parsedSession = CheckoutSession.fromJson(sessionJson);
      expect(parsedSession.orderId, equals('order_test_123'));
      expect(parsedSession.amount, equals(999.0));
      expect(parsedSession.keyId, equals('rzp_test_mock_key'));

      final rzpOptions = RazorpayOptions(
        key: 'rzp_test_mock_key',
        amount: 99900,
        name: 'Test Series App',
        orderId: 'order_test_123',
        description: 'Payment for NEET Test Series 2026',
        prefill: {
          'contact': '9876543210',
          'email': 'student@example.com',
        },
      );
      final rzpJson = rzpOptions.toJson();
      final parsedRzp = RazorpayOptions.fromJson(rzpJson);
      expect(parsedRzp.key, equals('rzp_test_mock_key'));
      expect(parsedRzp.amount, equals(99900));
      expect(parsedRzp.prefill['contact'], equals('9876543210'));
    });
  });
}
