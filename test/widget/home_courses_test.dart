import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:test_series/models/models.dart';
import 'package:test_series/screens/courses/all_courses_screen.dart';
import 'package:test_series/screens/courses/course_detail_screen.dart';
import 'package:test_series/screens/courses/my_courses_screen.dart';
import 'package:test_series/screens/home/home_screen.dart';
import 'package:test_series/screens/video/video_player_screen.dart';
import 'package:test_series/state/auth_provider.dart';
import 'package:test_series/widgets/category_grid.dart';
import 'package:test_series/widgets/course_card.dart';

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
    SharedPreferences.setMockInitialValues({});
  });

  group('CategoryGrid & Chips Tests', () {
    testWidgets('Renders categories in grid and handles taps',
        (tester) async {
      String? selected;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: CategoryGrid(
              categories: const [],
              onCategorySelected: (cat) => selected = cat,
            ),
          ),
        ),
      );

      expect(find.text('All Exams'), findsOneWidget);
      expect(find.text('NEET'), findsOneWidget);
      expect(find.text('JEE'), findsOneWidget);

      await tester.tap(find.text('NEET'));
      await tester.pumpAndSettle();

      expect(selected, 'NEET');
    });

    testWidgets('Renders horizontal filter chips when isHorizontal is true',
        (tester) async {
      String? selected;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: CategoryGrid(
              categories: const [],
              isHorizontal: true,
              onCategorySelected: (cat) => selected = cat,
            ),
          ),
        ),
      );

      expect(find.byType(FilterChip), findsWidgets);
      await tester.tap(find.text('JEE'));
      await tester.pumpAndSettle();

      expect(selected, 'JEE');
    });
  });

  group('CourseCard Widget Tests', () {
    final sampleCourse = Course(
      id: 1,
      title: 'NEET 2026 Physics Masterclass',
      slug: 'neet-2026-physics-masterclass',
      description: 'Comprehensive physics curriculum for NEET aspirants.',
      price: 2999,
      discountPrice: 1999,
      isEnrolled: false,
      totalLessons: 42,
      totalDurationMinutes: 1800,
      instructorName: 'Er. R. K. Gupta',
    );

    testWidgets('Renders compact CourseCard with price discount and lessons',
        (tester) async {
      bool tapped = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: CourseCard(
              course: sampleCourse,
              isCompact: true,
              onTap: () => tapped = true,
            ),
          ),
        ),
      );

      expect(find.text('NEET 2026 Physics Masterclass'), findsOneWidget);
      expect(find.text('42 Lessons'), findsOneWidget);
      expect(find.text('₹1999'), findsOneWidget);
      expect(find.text('₹2999'), findsOneWidget);

      await tester.tap(find.byType(CourseCard));
      expect(tapped, isTrue);
    });

    testWidgets('Renders full-width CourseCard with enrolled status',
        (tester) async {
      final enrolledCourse = Course(
        id: 2,
        title: 'JEE Advanced Chemistry Drill',
        slug: 'jee-advanced-chemistry-drill',
        price: 3499,
        isEnrolled: true,
        totalLessons: 30,
        totalDurationMinutes: 1200,
        instructorName: 'Dr. S. K. Verma',
      );

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: CourseCard(
              course: enrolledCourse,
              isCompact: false,
              onTap: () {},
            ),
          ),
        ),
      );

      expect(find.text('Enrolled'), findsWidgets);
      expect(find.text('Start'), findsOneWidget);
    });
  });

  group('HomeScreen Tests', () {
    testWidgets('Mounts and loads home feed with banners, quick actions and popular courses',
        (tester) async {
      final auth = AuthProvider();

      await tester.pumpWidget(_buildTestApp(const HomeScreen(), auth: auth));
      expect(find.byType(HomeScreen), findsOneWidget);

      await tester.pump();
      await tester.pump(const Duration(milliseconds: 200));

      expect(find.text('Target Exam & Categories'), findsOneWidget);
      expect(find.text('Popular Courses'), findsOneWidget);
      expect(find.text('Featured Test Series'), findsOneWidget);
    });
  });

  group('AllCoursesScreen Catalog Tests', () {
    testWidgets('Loads course catalog and filters by query and price',
        (tester) async {
      await tester.pumpWidget(_buildTestApp(const AllCoursesScreen()));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 200));

      expect(find.byType(CourseCard), findsWidgets);

      // Search for specific course
      await tester.enterText(find.byType(TextField), 'physics');
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 100));

      expect(find.byType(CourseCard), findsWidgets);

      // Test Free filter chip
      await tester.tap(find.text('Free Lessons'));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 100));

      // Reset
      await tester.tap(find.text('All Courses'));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 100));
    });
  });

  group('CourseDetailScreen Tests', () {
    final testCourse = Course(
      id: 1,
      title: 'NEET 2026 Complete Biology Mastery',
      slug: 'neet-biology-mastery',
      description: 'Master Botany and Zoology with diagrammatic explanations.',
      price: 2499,
      discountPrice: 1499,
      isEnrolled: false,
      totalLessons: 55,
      totalDurationMinutes: 2400,
      instructorName: 'Dr. Meenakshi Sundaram',
      folders: [
        CourseFolder(
          id: 1,
          courseId: 1,
          title: 'Unit 1: Diversity in Living World',
          lessons: [
            Lesson(
              id: 101,
              folderId: 1,
              title: 'The Living World - Characteristics of Life',
              videoId: 'dQw4w9WgXcQ',
              durationMinutes: 40,
              isFreePreview: true,
            ),
            Lesson(
              id: 102,
              folderId: 1,
              title: 'Biological Classification - Monera & Protista',
              videoId: 'dQw4w9WgXcQ',
              durationMinutes: 50,
              isFreePreview: false,
            ),
          ],
        ),
      ],
    );

    testWidgets('Renders course details, syllabus modules and enrollment button',
        (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          CourseDetailScreen(
            courseIdOrSlug: testCourse.id,
            initialCourse: testCourse,
          ),
        ),
      );
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 200));

      expect(find.text('NEET 2026 Complete Biology Mastery'), findsOneWidget);
      expect(find.text('Unit 1: Diversity in Living World'), findsOneWidget);
      expect(find.text('The Living World - Characteristics of Life'), findsOneWidget);
      expect(find.text('Preview'), findsOneWidget);
      expect(find.text('Enroll Now'), findsOneWidget);
    });
  });

  group('MyCoursesScreen Tests', () {
    testWidgets('Mounts and displays enrolled courses with progress bar',
        (tester) async {
      await tester.pumpWidget(_buildTestApp(const MyCoursesScreen()));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 200));

      expect(find.text('My Enrolled Courses'), findsOneWidget);
      expect(find.text('Active Subscription'), findsWidgets);
      expect(find.text('Continue'), findsWidgets);
    });
  });

  group('VideoPlayerScreen Tests', () {
    final testLesson = Lesson(
      id: 1,
      folderId: 1,
      title: 'Laws of Motion - Newton\'s Second Law',
      videoId: 'dQw4w9WgXcQ',
      durationMinutes: 42,
      isFreePreview: true,
      description: 'Detailed vector derivation of F = dp/dt and momentum conservation.',
      pdfUrl: 'https://example.com/handout.pdf',
    );

    testWidgets('Renders video player UI, watermark, tabs and allows commenting',
        (tester) async {
      await tester.pumpWidget(_buildTestApp(VideoPlayerScreen(lesson: testLesson)));
      await tester.pump();

      expect(find.text('Laws of Motion - Newton\'s Second Law'), findsWidgets);
      expect(find.text('Overview'), findsOneWidget);
      expect(find.text('Lessons'), findsOneWidget);
      expect(find.text('Discussion'), findsOneWidget);

      // Switch to Discussion Tab
      await tester.tap(find.text('Discussion'));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 100));

      // Post a new comment
      await tester.enterText(
          find.byType(TextField), 'How does this apply in a non-inertial frame?');
      await tester.tap(find.byIcon(Icons.send_rounded), warnIfMissed: false);
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 100));

      expect(find.text('How does this apply in a non-inertial frame?'),
          findsOneWidget);
    });
  });
}
