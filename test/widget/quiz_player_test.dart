import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:test_series/models/models.dart';
import 'package:test_series/screens/quiz/free_quizzes_screen.dart';
import 'package:test_series/screens/quiz/previous_results.dart';
import 'package:test_series/screens/quiz/quiz_player_screen.dart';
import 'package:test_series/screens/quiz/quiz_ui.dart';
import 'package:test_series/screens/quiz/report_widgets.dart';
import 'package:test_series/state/auth_provider.dart';

Widget _buildTestApp(Widget child) {
  return MultiProvider(
    providers: [
      ChangeNotifierProvider<AuthProvider>(
        create: (_) => AuthProvider(),
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
      'user_profile': '{"id": 1, "name": "Test Student", "email": "test@example.com", "phone": "9876543210"}',
    });
  });

  group('QuizPlayerScreen & CBT Engine Widget Tests', () {
    late QuizPaper samplePaper;

    setUp(() {
      samplePaper = QuizPaper(
        id: 201,
        title: 'Physics & Chemistry Speed Drill',
        durationMinutes: 45,
        totalMarks: 16.0,
        negativeMarks: 1.0,
        questions: [
          QuizQuestion(
            id: 11,
            questionNumber: 1,
            questionText: 'What is the unit of electric capacitance?',
            options: ['Farad', 'Henry', 'Ohm', 'Siemens'],
            correctOption: 0,
            marks: 4.0,
            negativeMarks: 1.0,
            subject: 'Physics',
          ),
          QuizQuestion(
            id: 12,
            questionNumber: 2,
            questionText: 'Which element has the highest electronegativity?',
            options: ['Oxygen', 'Chlorine', 'Fluorine', 'Nitrogen'],
            correctOption: 2,
            marks: 4.0,
            negativeMarks: 1.0,
            subject: 'Chemistry',
          ),
          QuizQuestion(
            id: 13,
            questionNumber: 3,
            questionText: 'What is the acceleration due to gravity on the Moon?',
            options: ['9.8 m/s²', '1.62 m/s²', '3.7 m/s²', '0 m/s²'],
            correctOption: 1,
            marks: 4.0,
            negativeMarks: 1.0,
            subject: 'Physics',
          ),
          QuizQuestion(
            id: 14,
            questionNumber: 4,
            questionText: 'Which gas is commonly known as laughing gas?',
            options: ['Nitric Oxide', 'Nitrous Oxide', 'Nitrogen Dioxide', 'Ammonia'],
            correctOption: 1,
            marks: 4.0,
            negativeMarks: 1.0,
            subject: 'Chemistry',
          ),
        ],
      );
    });

    testWidgets('Renders QuizPlayerScreen with title, timer, question prompt and options', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          QuizPlayerScreen(
            quizId: 201,
            initialPaper: samplePaper,
          ),
        ),
      );
      await tester.pump();

      expect(find.text('Physics & Chemistry Speed Drill'), findsOneWidget);
      expect(find.text('Q1 of 4'), findsOneWidget);
      expect(find.text('What is the unit of electric capacitance?'), findsOneWidget);
      expect(find.text('Farad'), findsOneWidget);
      expect(find.text('Henry'), findsOneWidget);
      expect(find.text('Ohm'), findsOneWidget);
      expect(find.text('Siemens'), findsOneWidget);
      expect(find.text('Save & Next'), findsOneWidget);
      expect(find.text('Submit'), findsOneWidget);
    });

    testWidgets('Option selection, clear response and Save & Next transitions', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          QuizPlayerScreen(
            quizId: 201,
            initialPaper: samplePaper,
          ),
        ),
      );
      await tester.pump();

      // Tap on 'Farad' option (Option A)
      await tester.tap(find.text('Farad'));
      await tester.pump();

      // Clear button should now appear
      expect(find.text('Clear'), findsOneWidget);

      // Tap 'Clear' button -> selection removed
      await tester.tap(find.text('Clear'));
      await tester.pump();

      // Clear button should disappear
      expect(find.text('Clear'), findsNothing);

      // Re-select 'Farad'
      await tester.tap(find.text('Farad'));
      await tester.pump();

      // Tap 'Save & Next' -> advances to Question 2
      await tester.tap(find.text('Save & Next'));
      await tester.pump();

      expect(find.text('Q2 of 4'), findsOneWidget);
      expect(find.text('Which element has the highest electronegativity?'), findsOneWidget);
    });

    testWidgets('Question palette tracks 5 states accurately across question workflow', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          QuizPlayerScreen(
            quizId: 201,
            initialPaper: samplePaper,
          ),
        ),
      );
      await tester.pump();

      // Q1: Select answer and Save & Next -> Answered
      await tester.tap(find.text('Farad'));
      await tester.pump();
      await tester.tap(find.text('Save & Next'));
      await tester.pump();

      // Now at Q2: Do not select answer, tap 'Mark & Next' -> Marked for Review
      expect(find.text('Q2 of 4'), findsOneWidget);
      await tester.tap(find.text('Mark & Next'));
      await tester.pump();

      // Now at Q3: Select option '1.62 m/s²', tap 'Mark & Next' -> Answered & Marked for Review
      expect(find.text('Q3 of 4'), findsOneWidget);
      await tester.tap(find.text('1.62 m/s²'));
      await tester.pump();
      await tester.tap(find.text('Mark & Next'));
      await tester.pump();

      // Now at Q4: Visited, but not answered -> Not Answered
      expect(find.text('Q4 of 4'), findsOneWidget);

      // Open Question Palette Bottom Sheet
      await tester.tap(find.byIcon(Icons.grid_view_rounded));
      await tester.pumpAndSettle();

      expect(find.text('Question Palette'), findsOneWidget);
      // Legend counts verification:
      // Q1: Answered (1)
      // Q2: Marked for Review (1)
      // Q3: Ans & Marked (1)
      // Q4: Not Answered (1)
      // Not Visited: (0)
      expect(find.text('Answered (1)'), findsOneWidget);
      expect(find.text('Marked for Review (1)'), findsOneWidget);
      expect(find.text('Ans & Marked (1)'), findsOneWidget);
      expect(find.text('Not Answered (1)'), findsOneWidget);
      expect(find.text('Not Visited (0)'), findsOneWidget);

      // Tap on Q1 in palette to navigate back
      await tester.tap(find.text('1'));
      await tester.pumpAndSettle();

      expect(find.text('Q1 of 4'), findsOneWidget);
    });

    testWidgets('Submit confirmation dialog displays correct summary and dismisses or confirms', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          QuizPlayerScreen(
            quizId: 201,
            initialPaper: samplePaper,
          ),
        ),
      );
      await tester.pump();

      // Answer Q1
      await tester.tap(find.text('Farad'));
      await tester.pump();

      // Tap Submit button in AppBar
      await tester.tap(find.text('Submit'));
      await tester.pumpAndSettle();

      // AlertDialog should be displayed
      expect(find.text('Submit Test Paper?'), findsOneWidget);
      expect(find.text('Total Questions'), findsOneWidget);
      expect(find.text('Answered'), findsOneWidget);
      expect(find.text('Unanswered'), findsOneWidget);
      expect(find.text('Review Answers'), findsOneWidget);
      expect(find.text('Yes, Submit Now'), findsOneWidget);

      // Dismiss dialog
      await tester.tap(find.text('Review Answers'));
      await tester.pumpAndSettle();

      expect(find.text('Submit Test Paper?'), findsNothing);
    });
  });

  group('CBT UI Modular Components Tests', () {
    testWidgets('CbtOptionTile triggers onTap and highlights when selected', (tester) async {
      bool selected = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: StatefulBuilder(
              builder: (context, setState) {
                return CbtOptionTile(
                  index: 0,
                  label: 'A',
                  text: 'Newton\'s First Law',
                  isSelected: selected,
                  onTap: () {
                    setState(() => selected = !selected);
                  },
                );
              },
            ),
          ),
        ),
      );

      expect(find.text('Newton\'s First Law'), findsOneWidget);
      expect(find.text('A'), findsOneWidget);
      expect(find.byIcon(Icons.check_circle_rounded), findsNothing);

      await tester.tap(find.text('Newton\'s First Law'));
      await tester.pump();

      expect(selected, isTrue);
      expect(find.byIcon(Icons.check_circle_rounded), findsOneWidget);
    });

    testWidgets('CbtBottomActionBar executes clear, mark, previous, and save callbacks', (tester) async {
      bool cleared = false;
      bool marked = false;
      bool saved = false;
      bool backed = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: CbtBottomActionBar(
              hasAnswer: true,
              isLastQuestion: false,
              canGoBack: true,
              onClear: () => cleared = true,
              onMarkAndNext: () => marked = true,
              onPrevious: () => backed = true,
              onSaveAndNext: () => saved = true,
            ),
          ),
        ),
      );

      expect(find.text('Clear'), findsOneWidget);
      expect(find.text('Mark & Next'), findsOneWidget);
      expect(find.text('Save & Next'), findsOneWidget);
      expect(find.byIcon(Icons.arrow_back_ios_rounded), findsOneWidget);

      await tester.tap(find.text('Clear'));
      expect(cleared, isTrue);

      await tester.tap(find.text('Mark & Next'));
      expect(marked, isTrue);

      await tester.tap(find.byIcon(Icons.arrow_back_ios_rounded));
      expect(backed, isTrue);

      await tester.tap(find.text('Save & Next'));
      expect(saved, isTrue);
    });
  });

  group('FreeQuizzesScreen & PreviousResultsScreen Widget Tests', () {
    testWidgets('FreeQuizzesScreen mounts and renders daily practice quizzes and subject filters', (tester) async {
      await tester.pumpWidget(_buildTestApp(const FreeQuizzesScreen()));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 200));

      expect(find.text('Free Daily Quizzes'), findsOneWidget);
      expect(find.byType(TextField), findsOneWidget);
      expect(find.text('Daily NEET Biology Booster Quiz'), findsOneWidget);
      expect(find.text('FREE PRACTICE'), findsWidgets);
      expect(find.text('Start Quiz'), findsWidgets);
    });

    testWidgets('PreviousResultsScreen mounts and displays past attempt history', (tester) async {
      await tester.pumpWidget(_buildTestApp(const PreviousResultsScreen()));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 200));

      expect(find.text('Attempt History'), findsOneWidget);
      expect(find.byType(TextField), findsOneWidget);
      expect(find.text('NEET Full Mock Test 01'), findsOneWidget);
      expect(find.text('View Solutions'), findsWidgets);
      expect(find.text('Retake'), findsWidgets);
    });
  });

  group('ReportWidgets Component Tests', () {
    testWidgets('AccuracyRingWidget displays percentage and accuracy label', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: AccuracyRingWidget(accuracy: 85.5),
          ),
        ),
      );

      expect(find.text('85.5%'), findsOneWidget);
      expect(find.text('Accuracy'), findsOneWidget);
    });

    testWidgets('ScoreGaugeCard renders score, percentile, and rank', (tester) async {
      final sampleResult = QuizResult(
        attemptId: 10,
        quizId: 101,
        quizTitle: 'Physics Electrostatics Test',
        score: 36.0,
        totalMarks: 40.0,
        correctAnswers: 9,
        incorrectAnswers: 1,
        unattempted: 0,
        accuracy: 90.0,
        timeTakenSeconds: 900,
        rank: 12,
        totalParticipants: 1400,
        percentile: 98.5,
        isPassed: true,
      );

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ScoreGaugeCard(result: sampleResult),
          ),
        ),
      );

      expect(find.text('Physics Electrostatics Test'), findsOneWidget);
      expect(find.text('QUALIFIED'), findsOneWidget);
      expect(find.text('90.0%'), findsOneWidget);
      expect(find.text('36.0 / 40'), findsOneWidget);
      expect(find.text('98.5%ile'), findsOneWidget);
      expect(find.text('#12 of 1400'), findsOneWidget);
    });

    testWidgets('QuestionBreakdownBar displays legend counts', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: QuestionBreakdownBar(
              correct: 8,
              incorrect: 1,
              unattempted: 1,
              total: 10,
            ),
          ),
        ),
      );

      expect(find.text('Correct (8)'), findsOneWidget);
      expect(find.text('Incorrect (1)'), findsOneWidget);
      expect(find.text('Skipped (1)'), findsOneWidget);
    });
  });
}
