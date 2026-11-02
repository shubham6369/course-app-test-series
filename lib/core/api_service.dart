import 'package:dio/dio.dart';
import '../models/models.dart';
import 'api_client.dart';

class ApiService {
  final ApiClient client;

  ApiService({ApiClient? apiClient}) : client = apiClient ?? ApiClient();

  Dio get _dio => client.dio;

  // ----------------------------------------------------
  // Authentication & Profile Endpoints
  // ----------------------------------------------------

  Future<Map<String, dynamic>> login(String phoneOrEmail, String password) async {
    final response = await _dio.post(
      '/auth/login',
      data: {
        'phone_or_email': phoneOrEmail,
        'password': password,
      },
    );
    final data = response.data as Map<String, dynamic>;
    final token = data['token'] as String? ?? '';
    ApiConfig.authToken = token;

    final userJson = data['user'] ?? data['data'];
    final user = Student.fromJson(Map<String, dynamic>.from(userJson as Map));
    return {'token': token, 'user': user};
  }

  Future<Map<String, dynamic>> register(
    String name,
    String email,
    String phone,
    String password, {
    String? classId,
  }) async {
    final response = await _dio.post(
      '/auth/register',
      data: {
        'name': name,
        'email': email,
        'phone': phone,
        'password': password,
        if (classId != null) 'class_id': classId,
      },
    );
    final data = response.data as Map<String, dynamic>;
    final token = data['token'] as String? ?? '';
    ApiConfig.authToken = token;

    final userJson = data['user'] ?? data['data'];
    final user = Student.fromJson(Map<String, dynamic>.from(userJson as Map));
    return {'token': token, 'user': user};
  }

  Future<bool> sendOtp(String phone) async {
    final response = await _dio.post(
      '/auth/signup/send-otp',
      data: {'phone': phone},
    );
    final data = response.data as Map<String, dynamic>;
    return data['status'] == 'success';
  }

  Future<Map<String, dynamic>> verifyOtp(String phone, String otp) async {
    final response = await _dio.post(
      '/auth/signup/verify',
      data: {'phone': phone, 'otp': otp},
    );
    final data = response.data as Map<String, dynamic>;
    final token = data['token'] as String?;
    if (token != null && token.isNotEmpty) {
      ApiConfig.authToken = token;
    }
    return {
      'verified': data['verified'] as bool? ?? true,
      'token': token,
      'user': data['user'] != null
          ? Student.fromJson(Map<String, dynamic>.from(data['user'] as Map))
          : null,
    };
  }

  Future<bool> forgotPassword(String phoneOrEmail) async {
    final response = await _dio.post(
      '/auth/forgot-password',
      data: {'phone_or_email': phoneOrEmail},
    );
    final data = response.data as Map<String, dynamic>;
    return data['status'] == 'success';
  }

  Future<bool> resetPassword(String phone, String otp, String newPassword) async {
    final response = await _dio.post(
      '/auth/reset-password',
      data: {
        'phone': phone,
        'otp': otp,
        'new_password': newPassword,
      },
    );
    final data = response.data as Map<String, dynamic>;
    return data['status'] == 'success';
  }

  Future<Student> getProfile() async {
    final response = await _dio.get('/profile');
    final data = response.data as Map<String, dynamic>;
    final studentData = data['data'] ?? data['user'];
    return Student.fromJson(Map<String, dynamic>.from(studentData as Map));
  }

  Future<Student> updateProfile(Map<String, dynamic> updateFields) async {
    final response = await _dio.put('/profile', data: updateFields);
    final data = response.data as Map<String, dynamic>;
    final studentData = data['data'] ?? data['user'];
    return Student.fromJson(Map<String, dynamic>.from(studentData as Map));
  }

  // ----------------------------------------------------
  // Home, Banners & Categories
  // ----------------------------------------------------

  Future<List<BannerItem>> getBanners() async {
    final response = await _dio.get('/banners');
    final data = response.data as Map<String, dynamic>;
    final list = data['data'] as List? ?? [];
    return list.map((e) => BannerItem.fromJson(Map<String, dynamic>.from(e as Map))).toList();
  }

  Future<List<Map<String, dynamic>>> getCategories() async {
    final response = await _dio.get('/categories');
    final data = response.data as Map<String, dynamic>;
    final list = data['data'] as List? ?? [];
    return list.map((e) => Map<String, dynamic>.from(e as Map)).toList();
  }

  Future<HomeFeed> getHomeFeed() async {
    final response = await _dio.get('/home-feed');
    final data = response.data as Map<String, dynamic>;
    final feedData = data['data'] as Map<String, dynamic>;
    return HomeFeed.fromJson(feedData);
  }

  // ----------------------------------------------------
  // Courses
  // ----------------------------------------------------

  Future<List<Course>> getCourses({String? category, String? search}) async {
    final queryParams = <String, dynamic>{};
    if (category != null && category.isNotEmpty) queryParams['category'] = category;
    if (search != null && search.isNotEmpty) queryParams['search'] = search;

    final response = await _dio.get('/courses', queryParameters: queryParams);
    final data = response.data as Map<String, dynamic>;
    final list = data['data'] as List? ?? [];
    return list.map((e) => Course.fromJson(Map<String, dynamic>.from(e as Map))).toList();
  }

  Future<Course> getCourseDetail(dynamic courseIdOrSlug) async {
    final response = await _dio.get('/courses/$courseIdOrSlug');
    final data = response.data as Map<String, dynamic>;
    final courseData = data['data'] as Map<String, dynamic>;
    return Course.fromJson(courseData);
  }

  Future<List<Course>> getMyCourses() async {
    final response = await _dio.get('/my-courses');
    final data = response.data as Map<String, dynamic>;
    final list = data['data'] as List? ?? [];
    return list.map((e) => Course.fromJson(Map<String, dynamic>.from(e as Map))).toList();
  }

  // ----------------------------------------------------
  // Test Series & CBT Quizzes
  // ----------------------------------------------------

  Future<List<TestSeriesSummary>> getTestSeries({String? category}) async {
    final queryParams = <String, dynamic>{};
    if (category != null && category.isNotEmpty) queryParams['category'] = category;

    final response = await _dio.get('/test-series', queryParameters: queryParams);
    final data = response.data as Map<String, dynamic>;
    final list = data['data'] as List? ?? [];
    return list.map((e) => TestSeriesSummary.fromJson(Map<String, dynamic>.from(e as Map))).toList();
  }

  Future<TestSeriesDetail> getTestSeriesDetail(int seriesId) async {
    final response = await _dio.get('/test-series/$seriesId');
    final data = response.data as Map<String, dynamic>;
    final detailData = data['data'] as Map<String, dynamic>;
    return TestSeriesDetail.fromJson(detailData);
  }

  Future<List<QuizSummary>> getFreeQuizzes() async {
    final response = await _dio.get('/quizzes', queryParameters: {'type': 'free'});
    final data = response.data as Map<String, dynamic>;
    final list = data['data'] as List? ?? [];
    return list.map((e) => QuizSummary.fromJson(Map<String, dynamic>.from(e as Map))).toList();
  }

  Future<QuizPaper> getQuizPaper(int quizId) async {
    final response = await _dio.get('/quizzes/$quizId');
    final data = response.data as Map<String, dynamic>;
    final paperData = data['data'] as Map<String, dynamic>;
    return QuizPaper.fromJson(paperData);
  }

  Future<QuizResult> submitQuiz(int quizId, Map<int, dynamic> answers, int timeTakenSeconds) async {
    final response = await _dio.post(
      '/quizzes/$quizId/submit',
      data: {
        'answers': answers.map((k, v) => MapEntry(k.toString(), v)),
        'time_taken_seconds': timeTakenSeconds,
      },
    );
    final data = response.data as Map<String, dynamic>;
    final resultData = data['data'] as Map<String, dynamic>;
    return QuizResult.fromJson(resultData);
  }

  Future<Map<String, dynamic>> getQuizResult(int attemptId) async {
    final response = await _dio.get('/quiz-attempts/$attemptId');
    final data = response.data as Map<String, dynamic>;
    final resultPayload = data['data'] as Map<String, dynamic>;

    final result = QuizResult.fromJson(Map<String, dynamic>.from(resultPayload['result'] as Map));
    final questionsList = (resultPayload['questions'] as List? ?? []).map(
      (e) => QuestionReview.fromJson(Map<String, dynamic>.from(e as Map)),
    ).toList();

    return {
      'result': result,
      'questions': questionsList,
    };
  }

  Future<List<QuizAttemptSummary>> getPreviousResults() async {
    final response = await _dio.get('/quiz-attempts');
    final data = response.data as Map<String, dynamic>;
    final list = data['data'] as List? ?? [];
    return list.map((e) => QuizAttemptSummary.fromJson(Map<String, dynamic>.from(e as Map))).toList();
  }

  Future<TestAnalytics> getMyPerformance() async {
    final response = await _dio.get('/my-performance');
    final data = response.data as Map<String, dynamic>;
    final analyticsData = data['data'] as Map<String, dynamic>;
    return TestAnalytics.fromJson(analyticsData);
  }

  // ----------------------------------------------------
  // Doubts Forum
  // ----------------------------------------------------

  Future<List<Doubt>> getDoubts({String status = 'all'}) async {
    final response = await _dio.get('/doubts', queryParameters: {'status': status});
    final data = response.data as Map<String, dynamic>;
    final list = data['data'] as List? ?? [];
    return list.map((e) => Doubt.fromJson(Map<String, dynamic>.from(e as Map))).toList();
  }

  Future<Doubt> getDoubtDetail(int doubtId) async {
    final response = await _dio.get('/doubts/$doubtId');
    final data = response.data as Map<String, dynamic>;
    final doubtData = data['data'] as Map<String, dynamic>;
    return Doubt.fromJson(doubtData);
  }

  Future<Doubt> submitDoubt(String subject, String question, {String? imagePath}) async {
    dynamic postData;
    if (imagePath != null && imagePath.isNotEmpty) {
      postData = FormData.fromMap({
        'subject': subject,
        'question': question,
        'image': await MultipartFile.fromFile(imagePath),
      });
    } else {
      postData = {
        'subject': subject,
        'question': question,
      };
    }

    final response = await _dio.post('/doubts', data: postData);
    final data = response.data as Map<String, dynamic>;
    final doubtData = data['data'] as Map<String, dynamic>;
    return Doubt.fromJson(doubtData);
  }

  Future<DoubtReply> replyDoubt(int doubtId, String message, {String? imagePath}) async {
    dynamic postData;
    if (imagePath != null && imagePath.isNotEmpty) {
      postData = FormData.fromMap({
        'message': message,
        'image': await MultipartFile.fromFile(imagePath),
      });
    } else {
      postData = {'message': message};
    }

    final response = await _dio.post('/doubts/$doubtId/reply', data: postData);
    final data = response.data as Map<String, dynamic>;
    final replyData = data['data'] as Map<String, dynamic>;
    return DoubtReply.fromJson(replyData);
  }

  // ----------------------------------------------------
  // Community Feed
  // ----------------------------------------------------

  Future<List<CommunityPost>> getCommunityFeed() async {
    final response = await _dio.get('/community');
    final data = response.data as Map<String, dynamic>;
    final list = data['data'] as List? ?? [];
    return list.map((e) => CommunityPost.fromJson(Map<String, dynamic>.from(e as Map))).toList();
  }

  Future<CommunityPost> createPost(String content, {String? imagePath}) async {
    dynamic postData;
    if (imagePath != null && imagePath.isNotEmpty) {
      postData = FormData.fromMap({
        'content': content,
        'image': await MultipartFile.fromFile(imagePath),
      });
    } else {
      postData = {'content': content};
    }

    final response = await _dio.post('/community', data: postData);
    final data = response.data as Map<String, dynamic>;
    final postDataMap = data['data'] as Map<String, dynamic>;
    return CommunityPost.fromJson(postDataMap);
  }

  Future<bool> likePost(int postId) async {
    final response = await _dio.post('/community/like', data: {'post_id': postId});
    final data = response.data as Map<String, dynamic>;
    return data['status'] == 'success';
  }

  Future<bool> commentPost(int postId, String comment) async {
    final response = await _dio.post(
      '/community/$postId/comment',
      data: {'comment': comment},
    );
    final data = response.data as Map<String, dynamic>;
    return data['status'] == 'success';
  }

  // ----------------------------------------------------
  // AI Academic Tutor
  // ----------------------------------------------------

  Future<AiReply> askAiChat(String message, {List<Map<String, dynamic>>? history}) async {
    final response = await _dio.post(
      '/ai/chat',
      data: {
        'message': message,
        if (history != null) 'history': history,
      },
    );
    final data = response.data as Map<String, dynamic>;
    final replyData = data['data'] as Map<String, dynamic>;
    return AiReply.fromJson(replyData);
  }

  // ----------------------------------------------------
  // Ebooks, Resources & Live Classes
  // ----------------------------------------------------

  Future<List<Ebook>> getEbooks() async {
    final response = await _dio.get('/ebooks');
    final data = response.data as Map<String, dynamic>;
    final list = data['data'] as List? ?? [];
    return list.map((e) => Ebook.fromJson(Map<String, dynamic>.from(e as Map))).toList();
  }

  Future<List<Resource>> getResources() async {
    final response = await _dio.get('/resources');
    final data = response.data as Map<String, dynamic>;
    final list = data['data'] as List? ?? [];
    return list.map((e) => Resource.fromJson(Map<String, dynamic>.from(e as Map))).toList();
  }

  Future<List<LiveClass>> getLiveClasses() async {
    final response = await _dio.get('/live');
    final data = response.data as Map<String, dynamic>;
    final list = data['data'] as List? ?? [];
    return list.map((e) => LiveClass.fromJson(Map<String, dynamic>.from(e as Map))).toList();
  }

  // ----------------------------------------------------
  // Checkout & Payment Verification
  // ----------------------------------------------------

  Future<CheckoutSession> createCheckoutSession(String itemType, int itemId) async {
    final response = await _dio.post(
      '/checkout',
      data: {
        'item_type': itemType,
        'item_id': itemId,
      },
    );
    final data = response.data as Map<String, dynamic>;
    final sessionData = data['data'] as Map<String, dynamic>;
    return CheckoutSession.fromJson(sessionData);
  }

  Future<bool> verifyPayment(String orderId, String paymentId, String signature) async {
    final response = await _dio.post(
      '/verify-payment',
      data: {
        'razorpay_order_id': orderId,
        'razorpay_payment_id': paymentId,
        'razorpay_signature': signature,
      },
    );
    final data = response.data as Map<String, dynamic>;
    return data['status'] == 'success';
  }
}
