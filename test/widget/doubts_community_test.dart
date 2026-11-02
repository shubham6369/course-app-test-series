import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:test_series/models/models.dart';
import 'package:test_series/screens/ai/ai_chat_screen.dart';
import 'package:test_series/screens/community/community_screen.dart';
import 'package:test_series/screens/content/content_viewer_screen.dart';
import 'package:test_series/screens/doubt/doubt_detail_screen.dart';
import 'package:test_series/screens/doubt/doubt_screen.dart';
import 'package:test_series/screens/resources/ebooks_screen.dart';
import 'package:test_series/screens/resources/resource_list_screen.dart';
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
    SharedPreferences.setMockInitialValues({});
  });

  group('Milestone M7: Doubts, Community, AI Tutor & Resources Tests', () {
    testWidgets('DoubtScreen renders filters, doubts list, and Ask Doubt action', (tester) async {
      await tester.pumpWidget(_buildTestApp(const DoubtScreen()));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 300));

      expect(find.text('Doubts & Q&A Forum'), findsOneWidget);
      expect(find.text('All Doubts'), findsOneWidget);
      expect(find.text('Pending'), findsOneWidget);
      expect(find.text('Resolved'), findsOneWidget);
      expect(find.text('Ask a Doubt'), findsOneWidget);
      expect(find.byType(TextField), findsOneWidget);
    });

    testWidgets('DoubtScreen opens Ask Doubt sheet with subject selector, photo attachment & submit', (tester) async {
      await tester.pumpWidget(_buildTestApp(const DoubtScreen()));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 300));

      // Open Ask a Doubt modal
      await tester.tap(find.text('Ask a Doubt'));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 300));

      expect(find.text('Select Subject'), findsOneWidget);
      expect(find.text('Your Question / Doubt Details'), findsOneWidget);
      expect(find.text('Attach Photo / Diagram (Optional)'), findsOneWidget);
      expect(find.text('Submit Doubt'), findsOneWidget);

      // Enter doubt text
      final textFields = find.byType(TextField);
      await tester.enterText(textFields.last, 'How does centrifugal force differ from centripetal force?');
      await tester.pump();

      // Submit
      await tester.tap(find.text('Submit Doubt'));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 300));
    });

    testWidgets('DoubtDetailScreen displays question, reply thread and input', (tester) async {
      final mockDoubt = Doubt(
        id: 1,
        studentId: 101,
        studentName: 'Rahul Sharma',
        subject: 'Physics',
        question: 'Why does magnetic flux change induce emf in Lenz law?',
        status: 'resolved',
        createdAt: DateTime.now(),
        replies: [
          DoubtReply(
            id: 1,
            doubtId: 1,
            authorId: 501,
            authorName: 'Dr. H. C. Verma',
            authorType: 'teacher',
            message: 'It follows directly from conservation of energy.',
            createdAt: DateTime.now(),
          ),
        ],
      );

      await tester.pumpWidget(
        _buildTestApp(
          DoubtDetailScreen(
            doubtId: 1,
            initialDoubt: mockDoubt,
          ),
        ),
      );
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 300));

      expect(find.textContaining('Doubt'), findsWidgets);
      expect(find.text('FACULTY'), findsWidgets);
      expect(find.byType(TextField), findsOneWidget);

      // Submit reply
      await tester.enterText(find.byType(TextField), 'Thank you, this clarifies the derivation!');
      await tester.tap(find.byIcon(Icons.send_rounded));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 300));
    });

    testWidgets('CommunityScreen displays feed and allows post interaction', (tester) async {
      await tester.pumpWidget(_buildTestApp(const CommunityScreen()));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 300));

      expect(find.text('Student Community'), findsOneWidget);
      expect(find.text('Post Update'), findsOneWidget);
      expect(find.byIcon(Icons.refresh_rounded), findsOneWidget);

      // Open Create Post modal
      await tester.tap(find.text('Post Update'));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 300));

      expect(find.text('Create Community Post'), findsOneWidget);
      expect(find.text('Attach Image / Notes (Optional)'), findsOneWidget);
      expect(find.text('Publish Post'), findsOneWidget);

      await tester.enterText(find.byType(TextField).last, 'Consistent mock test practice is the secret to high percentile!');
      await tester.tap(find.text('Publish Post'));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 300));
    });

    testWidgets('AiChatScreen renders welcome message, prompt chips and input field', (tester) async {
      await tester.pumpWidget(_buildTestApp(const AiChatScreen()));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 300));

      expect(find.text('AI Academic Tutor'), findsOneWidget);
      expect(find.textContaining('24/7 AI Academic Tutor'), findsOneWidget);
      expect(find.byType(TextField), findsOneWidget);
      expect(find.byIcon(Icons.send_rounded), findsOneWidget);
      expect(find.byType(ActionChip), findsWidgets);

      // Tap suggestion chip
      final firstChip = find.byType(ActionChip).first;
      await tester.tap(firstChip);
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 300));

      // Clear chat
      await tester.tap(find.byIcon(Icons.delete_outline_rounded));
      await tester.pump();
      expect(find.textContaining('Chat history cleared'), findsOneWidget);
    });

    testWidgets('EbooksScreen displays library, search, filters, Read Book & Download CTA', (tester) async {
      final sampleEbooks = [
        Ebook(
          id: 1,
          title: 'NCERT Biology High-Yield Highlights',
          author: 'Academic Panel',
          pdfUrl: 'https://example.com/bio.pdf',
          pageCount: 180,
          fileSize: '14.2 MB',
          isFree: true,
        ),
        Ebook(
          id: 2,
          title: 'Handbook of Physics Formulas',
          author: 'Prof. Verma',
          pdfUrl: 'https://example.com/phys.pdf',
          pageCount: 120,
          fileSize: '8.5 MB',
          isFree: false,
        ),
      ];

      await tester.pumpWidget(_buildTestApp(EbooksScreen(initialEbooks: sampleEbooks)));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 200));

      expect(find.text('Digital Books & Guides'), findsOneWidget);
      expect(find.text('All Books'), findsOneWidget);
      expect(find.text('Free'), findsOneWidget);
      expect(find.text('Pro / Premium'), findsOneWidget);
      expect(find.textContaining('NCERT Biology'), findsWidgets);
      expect(find.text('Read Book'), findsWidgets);
      expect(find.text('Download'), findsWidgets);

      // Test Search
      await tester.enterText(find.byType(TextField), 'Physics');
      await tester.pump();
      expect(find.textContaining('Physics Formulas'), findsOneWidget);
      expect(find.textContaining('NCERT Biology'), findsNothing);

      // Clear search
      await tester.enterText(find.byType(TextField), '');
      await tester.pump();

      // Test Download SnackBar
      await tester.tap(find.text('Download').first);
      await tester.pump();
      expect(find.textContaining('Downloading "NCERT Biology High-Yield Highlights"'), findsOneWidget);
    });

    testWidgets('ResourceListScreen displays revision notes, formula sheets, search & download', (tester) async {
      final sampleResources = [
        Resource(
          id: 1,
          title: 'Physics Mechanics Formula Sheet',
          type: 'pdf',
          fileUrl: 'https://example.com/phys.pdf',
          fileSize: '2.4 MB',
          createdAt: DateTime.now(),
        ),
        Resource(
          id: 2,
          title: 'NTA NEET 2026 Official Syllabus',
          type: 'pdf',
          fileUrl: 'https://example.com/syl.pdf',
          fileSize: '4.8 MB',
          createdAt: DateTime.now(),
        ),
      ];

      await tester.pumpWidget(_buildTestApp(ResourceListScreen(initialResources: sampleResources)));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 200));

      expect(find.text('Study Notes & Materials'), findsOneWidget);
      expect(find.byIcon(Icons.picture_as_pdf_rounded), findsWidgets);
      expect(find.text('Physics Mechanics Formula Sheet'), findsOneWidget);
      expect(find.text('All Resources'), findsOneWidget);
      expect(find.text('Formula Sheets'), findsOneWidget);
      expect(find.text('Syllabus & Info'), findsOneWidget);
      expect(find.byIcon(Icons.download_rounded), findsWidgets);

      // Test Search
      await tester.enterText(find.byType(TextField), 'Syllabus');
      await tester.pump();
      expect(find.text('NTA NEET 2026 Official Syllabus'), findsOneWidget);
      expect(find.text('Physics Mechanics Formula Sheet'), findsNothing);

      // Clear search
      await tester.enterText(find.byType(TextField), '');
      await tester.pump();

      // Test Download
      await tester.tap(find.byIcon(Icons.download_rounded).first);
      await tester.pump();
      expect(find.textContaining('Downloading "Physics Mechanics Formula Sheet"'), findsOneWidget);
    });

    testWidgets('ContentViewerScreen renders title, DRM protection and page elements', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          const ContentViewerScreen(
            title: 'Organic Chemistry Reactions Summary',
            contentUrl: 'https://edu.d3vx.in/files/organic_che.pdf',
          ),
        ),
      );
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 300));

      expect(find.text('Organic Chemistry Reactions Summary'), findsWidgets);
      expect(find.text('DRM Protected Content'), findsOneWidget);
      expect(find.byIcon(Icons.share_rounded), findsOneWidget);
    });
  });
}
