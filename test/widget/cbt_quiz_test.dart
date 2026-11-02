import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:test_series/models/models.dart';
import 'package:test_series/screens/quiz/attempt_report_screen.dart';
import 'package:test_series/screens/quiz/certificate_screen.dart';
import 'package:test_series/screens/quiz/my_performance_screen.dart';
import 'package:test_series/screens/quiz/quiz_player_screen.dart';
import 'package:test_series/screens/quiz/quiz_result_screen.dart';
import 'package:test_series/screens/quiz/quiz_ui.dart';
import 'package:test_series/screens/test_series/test_series_detail_screen.dart';
import 'package:test_series/screens/test_series/test_series_screen.dart';
import 'package:test_series/state/auth_provider.dart';

Widget _buildTestApp(Widget child, {AuthProvider? auth}) {
  return MultiProvider(
    providers: [
      ChangeNotifierProvider<AuthProvider>(
        create: (_) => auth ?? AuthProvider(),
      ),
    ],
    child: MaterialApp(
      home: child,
    ),
  );
}

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() {
    SharedPreferences.setMockInitialValues({
      'auth_token': 'test_token',
      'user_profile':
          '{"id": 1, "name": "Aarav Sharma", "email": "aarav@example.com", "phone": "9876543210"}',
    });
  });

  group('CBT UI Components Tests', () {
    testWidgets('CbtCountdownTimer formats time and shows urgent warning',
        (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: CbtCountdownTimer(remainingSeconds: 3665), // 01:01:05
          ),
        ),
      );

      expect(find.text('01:01:05'), findsOneWidget);

      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: CbtCountdownTimer(remainingSeconds: 180), // 03:00 (urgent)
          ),
        ),
      );

      expect(find.text('03:00'), findsOneWidget);
    });

    testWidgets('CbtPaletteLegend & CbtQuestionTile render states and respond to tap',
        (tester) async {
      bool tapped = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Column(
              children: [
                const CbtPaletteLegend(
                  stateCounts: {
                    CbtQuestionState.answered: 10,
                    CbtQuestionState.notAnswered: 4,
                    CbtQuestionState.notVisited: 6,
                    CbtQuestionState.markedForReview: 2,
                    CbtQuestionState.answeredAndMarked: 1,
                  },
                ),
                CbtQuestionTile(
                  questionNumber: 5,
                  state: CbtQuestionState.answered,
                  isCurrent: true,
                  onTap: () => tapped = true,
                ),
              ],
            ),
          ),
        ),
      );

      expect(find.text('Answered (10)'), findsOneWidget);
      expect(find.text('Not Answered (4)'), findsOneWidget);
      expect(find.text('5'), findsOneWidget);

      await tester.tap(find.text('5'));
      expect(tapped, isTrue);
    });
  });

  group('TestSeries Catalog & Detail Screen Tests', () {
    testWidgets('TestSeriesScreen mounts and loads test packages catalog',
        (tester) async {
      await tester.pumpWidget(_buildTestApp(const TestSeriesScreen()));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 200));

      expect(find.text('Test Series & CBT Mocks'), findsOneWidget);
      expect(find.byType(TextField), findsOneWidget);
      expect(find.byType(FilterChip), findsWidgets);
    });

    testWidgets('TestSeriesDetailScreen shows test list and opens rules dialog',
        (tester) async {
      final sampleDetail = TestSeriesDetail(
        id: 1,
        title: 'NEET 2026 Grand Mock Series',
        category: 'NEET 2026',
        description: 'Comprehensive NTA-pattern mock tests with All-India Ranks',
        price: 1499,
        discountPrice: 999,
        isPurchased: true,
        validityDays: 180,
        quizzes: [
          SeriesQuiz(
            id: 101,
            testSeriesId: 1,
            title: 'Mock Test 1: Full Syllabus Drill',
            durationMinutes: 180,
            totalQuestions: 200,
            totalMarks: 720,
            isFree: true,
            isLocked: false,
            isAttempted: false,
          ),
        ],
      );

      await tester.pumpWidget(
        _buildTestApp(
          TestSeriesDetailScreen(
            seriesId: 1,
            initialDetail: sampleDetail,
          ),
        ),
      );
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 100));

      expect(find.text('NEET 2026 Grand Mock Series'), findsOneWidget);
      expect(find.text('Mock Test 1: Full Syllabus Drill'), findsOneWidget);

      // Tap to start test instructions
      await tester.tap(find.text('Free'));
      await tester.pumpAndSettle();

      expect(find.text('Exam Instructions & Rules:'), findsOneWidget);
      expect(find.text('Start Test Now'), findsOneWidget);
    });
  });

  group('CBT Exam Engine (QuizPlayerScreen) Tests', () {
    final samplePaper = QuizPaper(
      id: 101,
      title: 'Physics Mechanics Unit Test',
      durationMinutes: 60,
      totalMarks: 20,
      negativeMarks: 1,
      instructions: ['Each question carries 4 marks', 'Negative marking is -1'],
      questions: [
        QuizQuestion(
          id: 1,
          questionNumber: 1,
          questionText:
              'A ball is thrown vertically upward with velocity 20 m/s. What is its max height? (g=10 m/s^2)',
          options: ['10 m', '20 m', '40 m', '80 m'],
          correctOption: 1, // '20 m'
          marks: 4,
          negativeMarks: 1,
          subject: 'Physics',
          topic: 'Kinematics',
          explanation: 'Using v^2 = u^2 - 2gh => 0 = 400 - 20h => h = 20 m.',
        ),
        QuizQuestion(
          id: 2,
          questionNumber: 2,
          questionText: 'What is the SI unit of momentum?',
          options: ['kg m/s', 'Newton', 'Joule', 'Pascal'],
          correctOption: 0,
          marks: 4,
          negativeMarks: 1,
          subject: 'Physics',
          topic: 'Laws of Motion',
          explanation: 'p = mv => kg * m/s.',
        ),
      ],
    );

    testWidgets('Full CBT exam interactions: select option, save & next, mark, clear, palette and submit',
        (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          QuizPlayerScreen(
            quizId: 101,
            initialPaper: samplePaper,
          ),
        ),
      );
      await tester.pump();

      expect(find.text('Physics Mechanics Unit Test'), findsOneWidget);
      expect(find.text('Q1 of 2'), findsOneWidget);
      expect(find.text('20 m'), findsOneWidget);

      // Select option B ('20 m')
      await tester.tap(find.text('20 m'));
      await tester.pump();

      // Clear response
      expect(find.text('Clear'), findsOneWidget);
      await tester.tap(find.text('Clear'));
      await tester.pump();

      // Re-select and advance via Mark & Next
      await tester.tap(find.text('20 m'));
      await tester.pump();
      await tester.tap(find.text('Mark & Next'));
      await tester.pump();

      // Now at Q2
      expect(find.text('Q2 of 2'), findsOneWidget);
      expect(find.text('What is the SI unit of momentum?'), findsOneWidget);

      // Open Question Palette Bottom Sheet
      await tester.tap(find.byIcon(Icons.grid_view_rounded));
      await tester.pumpAndSettle();

      expect(find.text('Question Palette'), findsOneWidget);
      expect(find.text('Ans & Marked (1)'), findsOneWidget);

      // Jump back to Question 1 via palette
      await tester.tap(find.text('1'));
      await tester.pumpAndSettle();

      expect(find.text('Q1 of 2'), findsOneWidget);

      // Tap Submit
      await tester.tap(find.text('Submit'));
      await tester.pumpAndSettle();

      expect(find.text('Submit Test Paper?'), findsOneWidget);
      expect(find.text('Yes, Submit Now'), findsOneWidget);
    });
  });

  group('QuizResultScreen & AttemptReportScreen Tests', () {
    final sampleResult = QuizResult(
      attemptId: 42,
      quizId: 101,
      quizTitle: 'Physics Mechanics Unit Test',
      score: 16,
      totalMarks: 20,
      correctAnswers: 4,
      incorrectAnswers: 1,
      unattempted: 0,
      accuracy: 80.0,
      timeTakenSeconds: 1420,
    );

    testWidgets('QuizResultScreen displays score ring, accuracy and navigation CTAs',
        (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          QuizResultScreen(result: sampleResult),
        ),
      );
      await tester.pump();

      expect(find.text('Exam Result & Scorecard'), findsOneWidget);
      expect(find.text('16.0'), findsOneWidget);
      expect(find.text('/ 20'), findsOneWidget);
      expect(find.text('Accuracy'), findsOneWidget);
      expect(find.text('View Detailed Solutions & Explanations'), findsOneWidget);
      expect(find.text('View Score Certificate'), findsOneWidget);
    });

    testWidgets('AttemptReportScreen renders solutions and filters questions',
        (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          AttemptReportScreen(attemptId: 42),
        ),
      );
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 200));

      expect(find.text('Detailed Solutions'), findsOneWidget);
      expect(find.text('All (10)'), findsOneWidget);
      expect(find.text('Explanation & Formula Breakdown'), findsWidgets);
    });

    testWidgets('CertificateScreen displays verifiable certificate with student merit',
        (tester) async {
      final auth = AuthProvider();

      await tester.pumpWidget(
        _buildTestApp(
          CertificateScreen(result: sampleResult),
          auth: auth,
        ),
      );
      await tester.pump();

      expect(find.text('CERTIFICATE OF MERIT'), findsOneWidget);
      expect(find.text('Physics Mechanics Unit Test'), findsOneWidget);
      expect(find.text('Share Certificate'), findsWidgets);
    });
  });

  group('MyPerformanceScreen Analytics Tests', () {
    testWidgets('Mounts and loads performance metrics and growth charts',
        (tester) async {
      await tester.pumpWidget(_buildTestApp(const MyPerformanceScreen()));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 200));

      expect(find.text('Performance & Analytics'), findsOneWidget);
      expect(find.text('Tests Attempted'), findsOneWidget);
      expect(find.text('Questions Solved'), findsOneWidget);
      expect(find.text('Score Growth & Performance Trend'), findsOneWidget);
    });
  });
}

