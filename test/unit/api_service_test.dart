import 'package:flutter_test/flutter_test.dart';
import 'package:test_series/core/api_client.dart';
import 'package:test_series/core/api_service.dart';

void main() {
  group('ApiService & MockOfflineInterceptor Tests', () {
    late ApiClient apiClient;
    late ApiService apiService;

    setUp(() {
      // Force offline mock mode for deterministic offline testing
      ApiConfig.forceOfflineMock = true;
      apiClient = ApiClient();
      apiService = ApiService(apiClient: apiClient);
    });

    test('getHomeFeed returns structured home feed with banners, categories and courses', () async {
      final feed = await apiService.getHomeFeed();

      expect(feed.banners, isNotEmpty);
      expect(feed.banners.first.title, contains('NEET'));
      expect(feed.categories, isNotEmpty);
      expect(feed.popularCourses, isNotEmpty);
      expect(feed.featuredTestSeries, isNotEmpty);
      expect(feed.freeQuizzes, isNotEmpty);
    });

    test('getCourses retrieves list of courses and getCourseDetail returns syllabus folders', () async {
      final courses = await apiService.getCourses();

      expect(courses, isNotEmpty);
      expect(courses.length, greaterThanOrEqualTo(2));
      expect(courses.first.price, greaterThan(0));

      final courseDetail = await apiService.getCourseDetail(courses.first.id);
      expect(courseDetail.id, equals(101));
      expect(courseDetail.folders, isNotNull);
      expect(courseDetail.folders!, isNotEmpty);
      expect(courseDetail.folders!.first.lessons, isNotEmpty);
      expect(courseDetail.folders!.first.lessons.first.videoId, isNotEmpty);
    });

    test('getTestSeries and getTestSeriesDetail return packages and quizzes', () async {
      final seriesList = await apiService.getTestSeries();

      expect(seriesList, isNotEmpty);
      final detail = await apiService.getTestSeriesDetail(seriesList.first.id);
      expect(detail.id, equals(1));
      expect(detail.quizzes, isNotEmpty);
      expect(detail.quizzes.first.durationMinutes, equals(180));
    });

    test('getQuizPaper retrieves 10 questions with options and negative marks', () async {
      final paper = await apiService.getQuizPaper(101);

      expect(paper.id, equals(101));
      expect(paper.questions.length, equals(10));
      expect(paper.negativeMarks, equals(1.0));
      expect(paper.questions.first.options.length, equals(4));
      expect(paper.questions.first.correctOption, isNotNull);
      expect(paper.questions.first.explanation, isNotEmpty);
    });

    test('submitQuiz returns QuizResult with score and percentile', () async {
      final answers = {1: 1, 2: 0, 3: 0, 4: 1, 5: 2};
      final result = await apiService.submitQuiz(101, answers, 3600);

      expect(result.quizId, equals(101));
      expect(result.score, greaterThan(0));
      expect(result.accuracy, greaterThan(0));
      expect(result.isPassed, isTrue);
      expect(result.percentile, greaterThan(90.0));
    });

    test('getDoubts and replyDoubt return doubt thread data', () async {
      final doubts = await apiService.getDoubts();

      expect(doubts, isNotEmpty);
      expect(doubts.first.subject, equals('Biology'));

      final reply = await apiService.replyDoubt(1, 'Here is the clarification');
      expect(reply.doubtId, equals(1));
      expect(reply.message, isNotEmpty);
    });

    test('getCommunityFeed and likePost return social data', () async {
      final posts = await apiService.getCommunityFeed();

      expect(posts, isNotEmpty);
      expect(posts.first.authorName, isNotEmpty);

      final liked = await apiService.likePost(posts.first.id);
      expect(liked, isTrue);
    });

    test('askAiChat returns relevant academic reply and suggestions', () async {
      final reply = await apiService.askAiChat('Explain Lenz\'s law in physics');

      expect(reply.message, contains('Lenz\'s law'));
      expect(reply.suggestions, isNotEmpty);
    });

    test('createCheckoutSession returns Razorpay order details', () async {
      final session = await apiService.createCheckoutSession('test_series', 1);

      expect(session.orderId, startsWith('order_mock_edu_'));
      expect(session.amount, equals(499.0));
      expect(session.currency, equals('INR'));
      expect(session.keyId, isNotEmpty);
    });

    test('getEbooks and getResources return educational content', () async {
      final ebooks = await apiService.getEbooks();
      final resources = await apiService.getResources();

      expect(ebooks, isNotEmpty);
      expect(ebooks.first.pdfUrl, isNotEmpty);
      expect(resources, isNotEmpty);
      expect(resources.first.fileUrl, isNotEmpty);
    });
  });
}
