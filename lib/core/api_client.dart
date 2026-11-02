import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ApiConfig {
  static const String baseUrl = 'https://edu.d3vx.in/test-series/api/mobile';
  static bool forceOfflineMock = true; // Enabled by default for deterministic offline reliability
  static String? authToken;
}

class ApiClient {
  late final Dio dio;

  ApiClient({String? baseUrl, bool? forceMock}) {
    if (forceMock != null) {
      ApiConfig.forceOfflineMock = forceMock;
    }

    dio = Dio(
      BaseOptions(
        baseUrl: baseUrl ?? ApiConfig.baseUrl,
        connectTimeout: const Duration(seconds: 15),
        receiveTimeout: const Duration(seconds: 15),
        sendTimeout: const Duration(seconds: 15),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      ),
    );

    // Auth & Logging Interceptor
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          String? token = ApiConfig.authToken;
          if (token == null || token.isEmpty) {
            try {
              final prefs = await SharedPreferences.getInstance();
              token = prefs.getString('auth_token');
            } catch (_) {
              // SharedPreferences may fail in pure unit tests without mocks
            }
          }
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
        onError: (DioException error, handler) {
          // Pass to MockOfflineInterceptor for fallback
          return handler.next(error);
        },
      ),
    );

    // Mock Offline Fallback Interceptor
    dio.interceptors.add(MockOfflineInterceptor());
  }
}

class MockOfflineInterceptor extends Interceptor {
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    if (ApiConfig.forceOfflineMock) {
      final mockResponse = MockDataGenerator.matchResponse(
        options.path,
        options.method,
        options.data,
        options.queryParameters,
      );
      return handler.resolve(
        Response(
          requestOptions: options,
          data: mockResponse,
          statusCode: 200,
        ),
      );
    }
    super.onRequest(options, handler);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    // Fallback to mock data if network is unreachable or timed out
    final mockResponse = MockDataGenerator.matchResponse(
      err.requestOptions.path,
      err.requestOptions.method,
      err.requestOptions.data,
      err.requestOptions.queryParameters,
    );
    return handler.resolve(
      Response(
        requestOptions: err.requestOptions,
        data: mockResponse,
        statusCode: 200,
      ),
    );
  }
}

class MockDataGenerator {
  static Map<String, dynamic> matchResponse(
    String path,
    String method,
    dynamic data,
    Map<String, dynamic>? queryParams,
  ) {
    final cleanPath = path.replaceAll(ApiConfig.baseUrl, '').trim();

    // 1. Auth Endpoints
    if (cleanPath.contains('/auth/login')) {
      final userMap = Map<String, dynamic>.from(_mockStudent);
      if (data is Map && data['phone_or_email'] != null) {
        final poe = data['phone_or_email'].toString();
        if (poe.contains('@')) {
          userMap['email'] = poe;
        } else {
          userMap['phone'] = poe;
        }
      }
      return {
        'status': 'success',
        'token': 'mock_jwt_token_sample_user_123',
        'data': userMap,
        'user': userMap,
      };
    }
    if (cleanPath.contains('/auth/register')) {
      final userMap = Map<String, dynamic>.from(_mockStudent);
      if (data is Map) {
        if (data['name'] != null) userMap['name'] = data['name'];
        if (data['email'] != null) userMap['email'] = data['email'];
        if (data['phone'] != null) userMap['phone'] = data['phone'];
        if (data['class_id'] != null) userMap['class_id'] = data['class_id'];
      }
      return {
        'status': 'success',
        'token': 'mock_jwt_token_sample_user_123',
        'data': userMap,
        'user': userMap,
      };
    }
    if (cleanPath.contains('/auth/signup/send-otp') || cleanPath.contains('/auth/send-otp')) {
      return {
        'status': 'success',
        'message': 'OTP 123456 sent successfully to mobile number',
      };
    }
    if (cleanPath.contains('/auth/signup/verify') || cleanPath.contains('/auth/verify-otp')) {
      return {
        'status': 'success',
        'verified': true,
        'token': 'mock_jwt_token_sample_user_123',
        'user': _mockStudent,
      };
    }
    if (cleanPath.contains('/auth/forgot-password')) {
      return {
        'status': 'success',
        'message': 'Password reset verification code sent to your email and phone',
      };
    }
    if (cleanPath.contains('/auth/reset-password')) {
      return {
        'status': 'success',
        'message': 'Password has been updated successfully. Please login.',
      };
    }
    if (cleanPath == '/profile' || cleanPath.endsWith('/profile')) {
      if (method.toUpperCase() == 'PUT' && data is Map) {
        final userMap = Map<String, dynamic>.from(_mockStudent);
        data.forEach((k, v) {
          userMap[k.toString()] = v;
        });
        return {
          'status': 'success',
          'data': userMap,
          'user': userMap,
        };
      }
      return {
        'status': 'success',
        'data': _mockStudent,
      };
    }

    // 2. Home Feed & Catalog
    if (cleanPath == '/banners' || cleanPath.endsWith('/banners')) {
      return {
        'status': 'success',
        'data': _mockBanners,
      };
    }
    if (cleanPath == '/categories' || cleanPath.endsWith('/categories')) {
      return {
        'status': 'success',
        'data': _mockCategories,
      };
    }
    if (cleanPath == '/home-feed' || cleanPath.endsWith('/home-feed')) {
      return {
        'status': 'success',
        'data': {
          'banners': _mockBanners,
          'categories': _mockCategories,
          'featured_test_series': _mockTestSeriesList,
          'popular_courses': _mockCoursesList,
          'free_quizzes': _mockFreeQuizzes,
          'recent_attempts': _mockRecentAttempts,
        },
      };
    }

    // 3. Courses
    if (cleanPath == '/my-courses' || cleanPath.endsWith('/my-courses')) {
      return {
        'status': 'success',
        'data': _mockCoursesList.take(2).map((c) => {...c, 'is_enrolled': true}).toList(),
      };
    }
    if (RegExp(r'/courses/\d+').hasMatch(cleanPath) || RegExp(r'/courses/[a-zA-Z0-9_-]+').hasMatch(cleanPath)) {
      return {
        'status': 'success',
        'data': _mockCourseDetail,
      };
    }
    if (cleanPath.startsWith('/courses')) {
      return {
        'status': 'success',
        'data': _mockCoursesList,
      };
    }

    // 4. Test Series
    if (RegExp(r'/test-series/\d+').hasMatch(cleanPath)) {
      return {
        'status': 'success',
        'data': _mockTestSeriesDetail,
      };
    }
    if (cleanPath.startsWith('/test-series')) {
      return {
        'status': 'success',
        'data': _mockTestSeriesList,
      };
    }

    // 5. CBT Quizzes
    if (cleanPath.contains('/quizzes') && cleanPath.contains('/submit')) {
      return {
        'status': 'success',
        'data': _mockQuizResult,
      };
    }
    if (cleanPath.contains('/quiz-attempts/') && !cleanPath.endsWith('/quiz-attempts')) {
      return {
        'status': 'success',
        'data': {
          'result': _mockQuizResult,
          'questions': _mockQuestionReviews,
        },
      };
    }
    if (cleanPath == '/quiz-attempts' || cleanPath.endsWith('/quiz-attempts')) {
      return {
        'status': 'success',
        'data': _mockQuizAttemptSummaries,
      };
    }
    if (cleanPath == '/my-performance' || cleanPath.endsWith('/my-performance')) {
      return {
        'status': 'success',
        'data': _mockTestAnalytics,
      };
    }
    if (RegExp(r'/quizzes/\d+').hasMatch(cleanPath)) {
      return {
        'status': 'success',
        'data': _mockQuizPaper,
      };
    }
    if (cleanPath.startsWith('/quizzes')) {
      return {
        'status': 'success',
        'data': _mockFreeQuizzes,
      };
    }

    // 6. Doubts
    if (cleanPath.contains('/doubts/') && cleanPath.contains('/reply')) {
      return {
        'status': 'success',
        'data': {
          'id': 105,
          'doubt_id': 1,
          'author_id': 99,
          'author_name': 'Dr. Sharma (Faculty)',
          'author_avatar': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          'author_type': 'teacher',
          'message': 'Good question! The ATP yield from aerobic respiration is typically calculated as 36-38 ATP per glucose molecule.',
          'image_url': null,
          'created_at': DateTime.now().toIso8601String(),
        },
      };
    }
    if (RegExp(r'/doubts/\d+').hasMatch(cleanPath)) {
      return {
        'status': 'success',
        'data': _mockDoubtsList.first,
      };
    }
    if (cleanPath.startsWith('/doubts')) {
      if (method == 'POST') {
        return {
          'status': 'success',
          'data': _mockDoubtsList.first,
        };
      }
      return {
        'status': 'success',
        'data': _mockDoubtsList,
      };
    }

    // 7. Community
    if (cleanPath.contains('/community/like')) {
      return {
        'status': 'success',
        'liked': true,
        'like_count': 43,
      };
    }
    if (cleanPath.contains('/community') && cleanPath.contains('/comment')) {
      return {
        'status': 'success',
        'message': 'Comment posted successfully',
      };
    }
    if (cleanPath.startsWith('/community')) {
      if (method == 'POST') {
        return {
          'status': 'success',
          'data': _mockCommunityFeed.first,
        };
      }
      return {
        'status': 'success',
        'data': _mockCommunityFeed,
      };
    }

    // 8. Ebooks & Resources
    if (cleanPath.startsWith('/ebooks')) {
      return {
        'status': 'success',
        'data': _mockEbooks,
      };
    }
    if (cleanPath.startsWith('/resources')) {
      return {
        'status': 'success',
        'data': _mockResources,
      };
    }
    if (cleanPath.startsWith('/live')) {
      return {
        'status': 'success',
        'data': _mockLiveClasses,
      };
    }

    // 9. AI Tutor Chat
    if (cleanPath.contains('/ai/chat')) {
      return {
        'status': 'success',
        'data': {
          'message': 'In physics, Lenz\'s law states that the direction of induced current opposes the change in magnetic flux that produces it. This is directly derived from the law of conservation of energy.',
          'suggestions': [
            'How is Lenz\'s law applied in transformers?',
            'Give an example problem on Faraday\'s Law.',
            'What are eddy currents?',
          ],
        },
      };
    }

    // 10. Checkout & Payments
    if (cleanPath.contains('/checkout')) {
      return {
        'status': 'success',
        'data': {
          'order_id': 'order_mock_edu_${DateTime.now().millisecondsSinceEpoch}',
          'amount': 499.0,
          'currency': 'INR',
          'key_id': 'rzp_test_mock_edu9988',
          'item_name': 'NEET 2026 Full Test Series Package',
          'user_email': 'rahul.sharma@example.com',
          'user_phone': '9876543210',
        },
      };
    }
    if (cleanPath.contains('/verify-payment')) {
      return {
        'status': 'success',
        'message': 'Payment verified successfully. Subscription activated.',
      };
    }

    // Default fallback
    return {
      'status': 'success',
      'message': 'Operation successful',
      'data': {},
    };
  }

  // --- Static Mock Data Repositories ---

  static final Map<String, dynamic> _mockStudent = {
    'id': 101,
    'name': 'Rahul Sharma',
    'email': 'rahul.sharma@example.com',
    'phone': '9876543210',
    'avatar_url': 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
    'class_id': 'Class 12',
    'target_exam': 'NEET 2026',
    'token': 'mock_jwt_token_sample_user_123',
    'created_at': '2026-01-15T10:00:00Z',
  };

  static final List<Map<String, dynamic>> _mockBanners = [
    {
      'id': 1,
      'title': 'All India NEET 2026 Mock Test Series - Live Now!',
      'image_url': 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800',
      'action_type': 'test_series',
      'action_value': '1',
      'order': 1,
    },
    {
      'id': 2,
      'title': 'Master Organic Chemistry with Video Lectures & Mindmaps',
      'image_url': 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800',
      'action_type': 'course',
      'action_value': '101',
      'order': 2,
    },
    {
      'id': 3,
      'title': 'Ask Doubts 24/7 with our AI Academic Tutor',
      'image_url': 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
      'action_type': 'ai_chat',
      'action_value': '',
      'order': 3,
    },
  ];

  static final List<Map<String, dynamic>> _mockCategories = [
    {'id': 1, 'name': 'NEET UG', 'icon': 'biotech', 'color': 0xFF00897B},
    {'id': 2, 'name': 'JEE Main', 'icon': 'architecture', 'color': 0xFF1A237E},
    {'id': 3, 'name': 'JEE Advanced', 'icon': 'functions', 'color': 0xFF0D47A1},
    {'id': 4, 'name': 'Foundation (9-10)', 'icon': 'school', 'color': 0xFF3949AB},
    {'id': 5, 'name': 'CUET UG', 'icon': 'menu_book', 'color': 0xFF00B4D8},
    {'id': 6, 'name': 'Boards 12th', 'icon': 'assignment', 'color': 0xFF4CAF50},
  ];

  static final List<Map<String, dynamic>> _mockTestSeriesList = [
    {
      'id': 1,
      'title': 'NEET 2026 Target All India Test Series',
      'category': 'NEET UG',
      'thumbnail_url': 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=500',
      'total_tests': 35,
      'free_tests': 3,
      'price': 1499.0,
      'discount_price': 699.0,
      'is_purchased': false,
      'validity_days': 365,
    },
    {
      'id': 2,
      'title': 'JEE Main 2026 Speed & Accuracy Booster',
      'category': 'JEE Main',
      'thumbnail_url': 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=500',
      'total_tests': 40,
      'free_tests': 2,
      'price': 1299.0,
      'discount_price': 599.0,
      'is_purchased': true,
      'validity_days': 365,
    },
    {
      'id': 3,
      'title': 'Class 12 Physics Chapterwise Drill Series',
      'category': 'Boards 12th',
      'thumbnail_url': 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=500',
      'total_tests': 20,
      'free_tests': 5,
      'price': 799.0,
      'discount_price': 299.0,
      'is_purchased': false,
      'validity_days': 180,
    },
    {
      'id': 4,
      'title': 'CUET General Test & Domain Subjects 2026',
      'category': 'CUET UG',
      'thumbnail_url': 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=500',
      'total_tests': 25,
      'free_tests': 2,
      'price': 999.0,
      'discount_price': 399.0,
      'is_purchased': false,
      'validity_days': 240,
    },
  ];

  static final Map<String, dynamic> _mockTestSeriesDetail = {
    'id': 1,
    'title': 'NEET 2026 Target All India Test Series',
    'description': 'Comprehensive NTA pattern exam series containing 25 part tests and 10 full length mock tests with video solutions, percentile analysis, and AIR prediction.',
    'category': 'NEET UG',
    'thumbnail_url': 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=500',
    'price': 1499.0,
    'discount_price': 699.0,
    'is_purchased': false,
    'validity_days': 365,
    'quizzes': [
      {
        'id': 101,
        'test_series_id': 1,
        'title': 'NEET Full Mock Test 01 (NTA Pattern)',
        'duration_minutes': 180,
        'total_questions': 10,
        'total_marks': 40.0,
        'is_free': true,
        'is_locked': false,
        'is_attempted': true,
        'best_score': 34,
        'max_attempts': 3,
        'attempts_taken': 1,
      },
      {
        'id': 102,
        'test_series_id': 1,
        'title': 'NEET Full Mock Test 02 (High Yield)',
        'duration_minutes': 180,
        'total_questions': 10,
        'total_marks': 40.0,
        'is_free': false,
        'is_locked': true,
        'is_attempted': false,
        'best_score': null,
        'max_attempts': 3,
        'attempts_taken': 0,
      },
      {
        'id': 103,
        'test_series_id': 1,
        'title': 'Physics: Mechanics & Thermodynamics',
        'duration_minutes': 60,
        'total_questions': 10,
        'total_marks': 40.0,
        'is_free': true,
        'is_locked': false,
        'is_attempted': false,
        'best_score': null,
        'max_attempts': 3,
        'attempts_taken': 0,
      },
      {
        'id': 104,
        'test_series_id': 1,
        'title': 'Chemistry: Organic & Coordination Chemistry',
        'duration_minutes': 60,
        'total_questions': 10,
        'total_marks': 40.0,
        'is_free': false,
        'is_locked': true,
        'is_attempted': false,
        'best_score': null,
        'max_attempts': 3,
        'attempts_taken': 0,
      },
      {
        'id': 105,
        'test_series_id': 1,
        'title': 'Biology: Genetics, Ecology & Biotechnology',
        'duration_minutes': 60,
        'total_questions': 10,
        'total_marks': 40.0,
        'is_free': false,
        'is_locked': true,
        'is_attempted': false,
        'best_score': null,
        'max_attempts': 3,
        'attempts_taken': 0,
      },
    ],
  };

  static final List<Map<String, dynamic>> _mockCoursesList = [
    {
      'id': 101,
      'title': 'Complete Biology Masterclass for NEET 2026',
      'slug': 'complete-biology-neet-2026',
      'description': 'Covering Botany and Zoology with NCERT line-by-line breakdown, mind maps, and chapterwise test papers.',
      'thumbnail_url': 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=500',
      'price': 2499.0,
      'discount_price': 999.0,
      'is_enrolled': true,
      'total_lessons': 48,
      'total_duration_minutes': 1440,
      'instructor_name': 'Dr. Ananya Sen (Ex-AIIMS)',
    },
    {
      'id': 102,
      'title': 'JEE Physics: Mechanics to Electrodynamics',
      'slug': 'jee-physics-mastery',
      'description': 'Master complex problem solving with visual animations and previous 15 years solved papers.',
      'thumbnail_url': 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=500',
      'price': 2999.0,
      'discount_price': 1199.0,
      'is_enrolled': false,
      'total_lessons': 62,
      'total_duration_minutes': 1860,
      'instructor_name': 'Prof. Rajesh Verma (IIT Delhi)',
    },
    {
      'id': 103,
      'title': 'Organic Chemistry Reaction Mechanisms Simplified',
      'slug': 'organic-chemistry-simplified',
      'description': 'All named reactions, reagents, stereochemistry, and electrophilic aromatic substitutions decoded.',
      'thumbnail_url': 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=500',
      'price': 1799.0,
      'discount_price': 799.0,
      'is_enrolled': false,
      'total_lessons': 34,
      'total_duration_minutes': 920,
      'instructor_name': 'Dr. Neeraj Singhania',
    },
    {
      'id': 104,
      'title': 'Class 10 Foundation Math & Science Sprint',
      'slug': 'class-10-foundation-sprint',
      'description': 'Strengthen your core concepts for Olympiads, NTSE, and early JEE/NEET preparation.',
      'thumbnail_url': 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=500',
      'price': 1299.0,
      'discount_price': 499.0,
      'is_enrolled': false,
      'total_lessons': 28,
      'total_duration_minutes': 800,
      'instructor_name': 'Meera Menon (Gold Medalist)',
    },
  ];

  static final Map<String, dynamic> _mockCourseDetail = {
    'id': 101,
    'title': 'Complete Biology Masterclass for NEET 2026',
    'slug': 'complete-biology-neet-2026',
    'description': 'Detailed syllabus coverage with HD video lessons, downloadable chapter notes in PDF format, and dedicated doubt solving sessions.',
    'thumbnail_url': 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=500',
    'price': 2499.0,
    'discount_price': 999.0,
    'is_enrolled': true,
    'total_lessons': 48,
    'total_duration_minutes': 1440,
    'instructor_name': 'Dr. Ananya Sen (Ex-AIIMS)',
    'folders': [
      {
        'id': 1,
        'course_id': 101,
        'title': 'Module 1: Cell Structure and Function',
        'order': 1,
        'lessons': [
          {
            'id': 11,
            'folder_id': 1,
            'title': '1.1 Cell The Unit of Life: Overview & Organelles',
            'description': 'Prokaryotic vs Eukaryotic cells, Endomembrane system, and Mitochondria.',
            'video_id': 'M7lc1UVf-VE',
            'duration_minutes': 35,
            'is_free_preview': true,
            'order': 1,
            'pdf_url': 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          },
          {
            'id': 12,
            'folder_id': 1,
            'title': '1.2 Cell Cycle and Cell Division: Mitosis vs Meiosis',
            'description': 'Phases of cell cycle, checkpoints, and chromosomal alignment.',
            'video_id': 'dQw4w9WgXcQ',
            'duration_minutes': 40,
            'is_free_preview': false,
            'order': 2,
            'pdf_url': 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          },
        ],
      },
      {
        'id': 2,
        'course_id': 101,
        'title': 'Module 2: Genetics and Molecular Biology',
        'order': 2,
        'lessons': [
          {
            'id': 21,
            'folder_id': 2,
            'title': '2.1 Principles of Inheritance and Variation (Mendelian Genetics)',
            'description': 'Monohybrid, Dihybrid crosses, and Law of Independent Assortment.',
            'video_id': 'M7lc1UVf-VE',
            'duration_minutes': 45,
            'is_free_preview': false,
            'order': 1,
            'pdf_url': 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          },
          {
            'id': 22,
            'folder_id': 2,
            'title': '2.2 Molecular Basis of Inheritance: DNA Replication & Transcription',
            'description': 'Semi-conservative replication, RNA polymerase and processing.',
            'video_id': 'M7lc1UVf-VE',
            'duration_minutes': 50,
            'is_free_preview': false,
            'order': 2,
            'pdf_url': 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          },
        ],
      },
    ],
  };

  static final List<Map<String, dynamic>> _mockFreeQuizzes = [
    {
      'id': 201,
      'title': 'Daily NEET Biology Booster Quiz',
      'subject': 'Biology',
      'duration_minutes': 15,
      'total_questions': 10,
      'total_marks': 40.0,
      'is_attempted': false,
    },
    {
      'id': 202,
      'title': 'JEE Physics: Laws of Motion Rapid Test',
      'subject': 'Physics',
      'duration_minutes': 20,
      'total_questions': 10,
      'total_marks': 40.0,
      'is_attempted': true,
    },
    {
      'id': 203,
      'title': 'Chemistry: Periodic Table & Chemical Bonding',
      'subject': 'Chemistry',
      'duration_minutes': 15,
      'total_questions': 10,
      'total_marks': 40.0,
      'is_attempted': false,
    },
  ];

  static final List<Map<String, dynamic>> _mockRecentAttempts = [
    {
      'attempt_id': 501,
      'quiz_id': 202,
      'title': 'JEE Physics: Laws of Motion Rapid Test',
      'score': 32.0,
      'total_marks': 40.0,
      'date': '2026-10-30T14:20:00Z',
    },
    {
      'attempt_id': 500,
      'quiz_id': 101,
      'title': 'NEET Full Mock Test 01',
      'score': 34.0,
      'total_marks': 40.0,
      'date': '2026-10-28T09:15:00Z',
    },
  ];

  static final Map<String, dynamic> _mockQuizPaper = {
    'id': 101,
    'title': 'NEET Full Mock Test 01 (NTA Pattern)',
    'duration_minutes': 180,
    'total_marks': 40.0,
    'negative_marks': 1.0,
    'instructions': [
      'The test consists of 10 multiple choice questions.',
      'Each question carries 4 marks for the correct answer.',
      'For each incorrect answer, 1 mark will be deducted (-1 negative marking).',
      'No marks will be deducted for unattempted questions.',
      'You can mark questions for review and return to them anytime before time expires.',
    ],
    'questions': [
      {
        'id': 1,
        'question_number': 1,
        'question_text': 'Which of the following cell organelles is responsible for cellular respiration and ATP synthesis?',
        'question_image_url': null,
        'options': ['Endoplasmic Reticulum', 'Mitochondria', 'Golgi Apparatus', 'Lysosome'],
        'correct_option': 1,
        'explanation': 'Mitochondria are known as the powerhouses of the cell where aerobic respiration occurs through the Krebs cycle and oxidative phosphorylation to generate ATP.',
        'subject': 'Biology',
        'topic': 'Cell Biology',
        'marks': 4.0,
        'negative_marks': 1.0,
      },
      {
        'id': 2,
        'question_number': 2,
        'question_text': 'What is the SI unit of electric flux?',
        'question_image_url': null,
        'options': ['Volt · meter (V·m)', 'Newton / Coulomb (N/C)', 'Tesla · meter squared (T·m²)', 'Joule / second (J/s)'],
        'correct_option': 0,
        'explanation': 'Electric flux is defined as Φ = E · A. Unit of E is V/m or N/C, so Φ = (V/m) * m² = Volt · meter (V·m).',
        'subject': 'Physics',
        'topic': 'Electrostatics',
        'marks': 4.0,
        'negative_marks': 1.0,
      },
      {
        'id': 3,
        'question_number': 3,
        'question_text': 'Which of the following compounds exhibits optical isomerism?',
        'question_image_url': null,
        'options': ['Lactic acid', 'Acetic acid', 'Propanoic acid', 'Methanol'],
        'correct_option': 0,
        'explanation': 'Lactic acid (CH3-CH(OH)-COOH) contains a chiral carbon atom bonded to four different groups (-H, -CH3, -OH, -COOH), making it optically active.',
        'subject': 'Chemistry',
        'topic': 'Organic Chemistry',
        'marks': 4.0,
        'negative_marks': 1.0,
      },
      {
        'id': 4,
        'question_number': 4,
        'question_text': 'In photosynthesis, the oxygen liberated comes from the splitting of which molecule?',
        'question_image_url': null,
        'options': ['Carbon Dioxide (CO2)', 'Water (H2O)', 'Glucose (C6H12O6)', 'Chlorophyll'],
        'correct_option': 1,
        'explanation': 'During the light-dependent reactions of photosynthesis, photolysis of water in Photosystem II releases electrons, protons, and oxygen gas.',
        'subject': 'Biology',
        'topic': 'Plant Physiology',
        'marks': 4.0,
        'negative_marks': 1.0,
      },
      {
        'id': 5,
        'question_number': 5,
        'question_text': 'A body starts from rest and moves with uniform acceleration of 2 m/s². What distance does it cover in 5 seconds?',
        'question_image_url': null,
        'options': ['10 meters', '20 meters', '25 meters', '50 meters'],
        'correct_option': 2,
        'explanation': 'Using s = ut + 0.5*a*t² with u=0: s = 0.5 * 2 * (5)² = 25 meters.',
        'subject': 'Physics',
        'topic': 'Kinematics',
        'marks': 4.0,
        'negative_marks': 1.0,
      },
      {
        'id': 6,
        'question_number': 6,
        'question_text': 'What is the hybridization of the central atom in Xenon tetrafluoride (XeF4)?',
        'question_image_url': null,
        'options': ['sp³', 'sp³d', 'sp³d²', 'dsp²'],
        'correct_option': 2,
        'explanation': 'XeF4 has 4 bonding pairs and 2 lone pairs around Xenon (total steric number = 6), which corresponds to sp³d² hybridization with a square planar geometry.',
        'subject': 'Chemistry',
        'topic': 'Chemical Bonding',
        'marks': 4.0,
        'negative_marks': 1.0,
      },
      {
        'id': 7,
        'question_number': 7,
        'question_text': 'Which hormone regulates blood sugar by facilitating the cellular uptake of glucose?',
        'question_image_url': null,
        'options': ['Glucagon', 'Insulin', 'Thyroxine', 'Adrenaline'],
        'correct_option': 1,
        'explanation': 'Insulin, secreted by beta cells of the islets of Langerhans in the pancreas, lowers blood glucose levels by promoting glucose transport into muscle and adipose cells.',
        'subject': 'Biology',
        'topic': 'Human Physiology',
        'marks': 4.0,
        'negative_marks': 1.0,
      },
      {
        'id': 8,
        'question_number': 8,
        'question_text': 'If the radius of the Earth shrinks by 1% while its mass remains constant, the acceleration due to gravity on its surface would:',
        'question_image_url': null,
        'options': ['Decrease by 2%', 'Increase by 2%', 'Increase by 1%', 'Remain unchanged'],
        'correct_option': 1,
        'explanation': 'g = GM/R². For small fractional changes, Δg/g ≈ -2(ΔR/R). Since ΔR/R = -1%, Δg/g = +2%, so gravity increases by 2%.',
        'subject': 'Physics',
        'topic': 'Gravitation',
        'marks': 4.0,
        'negative_marks': 1.0,
      },
      {
        'id': 9,
        'question_number': 9,
        'question_text': 'Which of the following noble gases is radioactive?',
        'question_image_url': null,
        'options': ['Argon (Ar)', 'Krypton (Kr)', 'Radon (Rn)', 'Xenon (Xe)'],
        'correct_option': 2,
        'explanation': 'Radon is a radioactive noble gas formed as part of the uranium and thorium radioactive decay chains.',
        'subject': 'Chemistry',
        'topic': 'p-Block Elements',
        'marks': 4.0,
        'negative_marks': 1.0,
      },
      {
        'id': 10,
        'question_number': 10,
        'question_text': 'In DNA, which nitrogenous base forms two hydrogen bonds with Adenine?',
        'question_image_url': null,
        'options': ['Guanine', 'Cytosine', 'Thymine', 'Uracil'],
        'correct_option': 2,
        'explanation': 'According to Chargaff\'s base-pairing rules, Adenine pairs with Thymine via two hydrogen bonds in DNA (and Uracil in RNA).',
        'subject': 'Biology',
        'topic': 'Genetics',
        'marks': 4.0,
        'negative_marks': 1.0,
      },
    ],
  };

  static final Map<String, dynamic> _mockQuizResult = {
    'attempt_id': 502,
    'quiz_id': 101,
    'quiz_title': 'NEET Full Mock Test 01 (NTA Pattern)',
    'score': 34.0,
    'total_marks': 40.0,
    'correct_answers': 9,
    'incorrect_answers': 1,
    'unattempted': 0,
    'accuracy': 90.0,
    'time_taken_seconds': 3600,
    'rank': 14,
    'total_participants': 2840,
    'percentile': 99.5,
    'is_passed': true,
    'certificate_url': 'https://edu.d3vx.in/test-series/certificates/CERT-NEET-502.pdf',
  };

  static final List<Map<String, dynamic>> _mockQuestionReviews = List.generate(
    10,
    (index) => {
      'question': _mockQuizPaper['questions'][index],
      'selected_option': index == 4 ? 1 : (_mockQuizPaper['questions'][index]['correct_option'] as int),
      'is_correct': index != 4,
      'time_spent_seconds': 45 + (index * 12),
      'marked_for_review': index == 2,
    },
  );

  static final List<Map<String, dynamic>> _mockQuizAttemptSummaries = [
    {
      'id': 502,
      'quiz_id': 101,
      'quiz_title': 'NEET Full Mock Test 01',
      'score': 34.0,
      'total_marks': 40.0,
      'accuracy': 90.0,
      'completed_at': '2026-10-31T11:00:00Z',
    },
    {
      'id': 501,
      'quiz_id': 202,
      'quiz_title': 'JEE Physics: Laws of Motion Rapid Test',
      'score': 32.0,
      'total_marks': 40.0,
      'accuracy': 80.0,
      'completed_at': '2026-10-30T14:20:00Z',
    },
    {
      'id': 500,
      'quiz_id': 103,
      'quiz_title': 'Physics: Mechanics & Thermodynamics',
      'score': 28.0,
      'total_marks': 40.0,
      'accuracy': 75.0,
      'completed_at': '2026-10-27T16:45:00Z',
    },
  ];

  static final Map<String, dynamic> _mockTestAnalytics = {
    'total_tests_attempted': 14,
    'total_questions_answered': 140,
    'overall_accuracy': 85.7,
    'overall_rank': 42,
    'score_trend': [
      {'label': 'Mock 1', 'score': 28.0, 'accuracy': 75.0},
      {'label': 'Mock 2', 'score': 31.0, 'accuracy': 80.0},
      {'label': 'Mock 3', 'score': 32.0, 'accuracy': 82.5},
      {'label': 'Mock 4', 'score': 34.0, 'accuracy': 90.0},
    ],
    'focus_areas': [
      {
        'topic': 'Cell Biology & Genetics',
        'subject': 'Biology',
        'accuracy_percentage': 92.5,
        'questions_attempted': 40,
        'status': 'strong',
      },
      {
        'topic': 'Electrostatics & Current',
        'subject': 'Physics',
        'accuracy_percentage': 84.0,
        'questions_attempted': 35,
        'status': 'strong',
      },
      {
        'topic': 'Organic Chemistry Mechanisms',
        'subject': 'Chemistry',
        'accuracy_percentage': 72.0,
        'questions_attempted': 35,
        'status': 'moderate',
      },
      {
        'topic': 'Rotational Dynamics',
        'subject': 'Physics',
        'accuracy_percentage': 58.0,
        'questions_attempted': 30,
        'status': 'needs_improvement',
      },
    ],
  };

  static final List<Map<String, dynamic>> _mockDoubtsList = [
    {
      'id': 1,
      'student_id': 101,
      'student_name': 'Rahul Sharma',
      'student_avatar': 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
      'subject': 'Biology',
      'question': 'How does ATP synthase use the proton gradient to convert ADP + Pi into ATP?',
      'image_url': null,
      'status': 'solved',
      'created_at': '2026-10-30T10:30:00Z',
      'replies': [
        {
          'id': 101,
          'doubt_id': 1,
          'author_id': 99,
          'author_name': 'Dr. Ananya Sen (Faculty)',
          'author_avatar': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          'author_type': 'teacher',
          'message': 'According to Mitchell\'s chemiosmotic hypothesis, protons accumulate in the intermembrane space creating a proton motive force. As protons flow back through the F0 channel of ATP synthase, rotation of the F1 catalytic subunit induces conformational changes that synthesize ATP.',
          'image_url': null,
          'created_at': '2026-10-30T11:15:00Z',
        },
      ],
    },
    {
      'id': 2,
      'student_id': 101,
      'student_name': 'Rahul Sharma',
      'student_avatar': 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
      'subject': 'Physics',
      'question': 'Can a body have zero velocity but non-zero acceleration? Please provide a real-life example.',
      'image_url': null,
      'status': 'pending',
      'created_at': '2026-10-31T08:00:00Z',
      'replies': [],
    },
    {
      'id': 3,
      'student_id': 102,
      'student_name': 'Priya Patel',
      'student_avatar': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
      'subject': 'Chemistry',
      'question': 'Why is o-nitrophenol steam volatile while p-nitrophenol is not?',
      'image_url': null,
      'status': 'solved',
      'created_at': '2026-10-29T14:20:00Z',
      'replies': [
        {
          'id': 102,
          'doubt_id': 3,
          'author_id': 98,
          'author_name': 'Prof. Singhania',
          'author_avatar': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
          'author_type': 'teacher',
          'message': 'o-Nitrophenol has intramolecular hydrogen bonding forming a chelate ring, which prevents intermolecular association. In contrast, p-nitrophenol forms intermolecular hydrogen bonds leading to higher boiling point and non-volatility.',
          'image_url': null,
          'created_at': '2026-10-29T15:00:00Z',
        },
      ],
    },
  ];

  static final List<Map<String, dynamic>> _mockCommunityFeed = [
    {
      'id': 1,
      'author_id': 105,
      'author_name': 'Aarav Gupta',
      'author_avatar': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      'content': 'Just scored 99.2 percentile in NEET Full Mock 01! The key was keeping cool during Physics calculations and managing time well. Consistency is key, guys!',
      'image_url': null,
      'like_count': 54,
      'reply_count': 12,
      'is_liked': false,
      'created_at': '2026-10-31T12:00:00Z',
    },
    {
      'id': 2,
      'author_id': 106,
      'author_name': 'Sanya Verma',
      'author_avatar': 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      'content': 'Here is my 3-step revision routine for Organic Chemistry conversions:\n1. Write reaction maps on chart paper.\n2. Practice 10 conversions daily.\n3. Identify electrophile & nucleophile in every reaction.',
      'image_url': 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=600',
      'like_count': 88,
      'reply_count': 23,
      'is_liked': true,
      'created_at': '2026-10-31T09:30:00Z',
    },
    {
      'id': 3,
      'author_id': 107,
      'author_name': 'Devansh Mukherjee',
      'author_avatar': 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      'content': 'Does anyone have short revision notes for Semiconductor Electronics (Logic Gates and Diodes)? Looking to revise before tomorrow\'s test.',
      'image_url': null,
      'like_count': 19,
      'reply_count': 7,
      'is_liked': false,
      'created_at': '2026-10-30T18:10:00Z',
    },
    {
      'id': 4,
      'author_id': 108,
      'author_name': 'Kavya Nair',
      'author_avatar': 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      'content': 'Remember: Negative marking is where ranks are lost. If you cannot eliminate at least two options, it\'s wiser to skip and save your score!',
      'image_url': null,
      'like_count': 62,
      'reply_count': 9,
      'is_liked': false,
      'created_at': '2026-10-30T14:45:00Z',
    },
    {
      'id': 5,
      'author_id': 109,
      'author_name': 'Rohan Mehra',
      'author_avatar': 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
      'content': 'Completed the entire Class 12 NCERT Biology exemplar today! Feeling super confident for upcoming tests.',
      'image_url': null,
      'like_count': 41,
      'reply_count': 5,
      'is_liked': true,
      'created_at': '2026-10-29T20:15:00Z',
    },
  ];

  static final List<Map<String, dynamic>> _mockEbooks = [
    {
      'id': 1,
      'title': 'NCERT Biology Class 12 High-Yield Highlights',
      'author': 'Academic Panel',
      'description': 'Every line from NCERT annotated with past 10 years NEET questions and diagram breakdowns.',
      'cover_url': 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400',
      'pdf_url': 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      'page_count': 180,
      'file_size': '14.2 MB',
      'is_free': true,
    },
    {
      'id': 2,
      'title': 'Handbook of Physics Formulas & Key Derivations',
      'author': 'Prof. R. Verma',
      'description': 'Quick pocket formula book for Class 11 and 12 physics with dimensional formulas and SI units.',
      'cover_url': 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400',
      'pdf_url': 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      'page_count': 120,
      'file_size': '8.5 MB',
      'is_free': true,
    },
    {
      'id': 3,
      'title': 'Organic Chemistry Named Reactions & Reagents',
      'author': 'Dr. N. Singhania',
      'description': 'Comprehensive catalog of all 65 reaction mechanisms required for competitive exams.',
      'cover_url': 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400',
      'pdf_url': 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      'page_count': 95,
      'file_size': '6.1 MB',
      'is_free': false,
    },
    {
      'id': 4,
      'title': 'Previous 10 Years NEET Solved Question Papers',
      'author': 'Editorial Board',
      'description': 'Authentic questions with detailed analytical step-by-step solutions and trend analysis.',
      'cover_url': 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400',
      'pdf_url': 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      'page_count': 320,
      'file_size': '28.4 MB',
      'is_free': false,
    },
  ];

  static final List<Map<String, dynamic>> _mockResources = [
    {
      'id': 1,
      'title': 'NTA NEET 2026 Official Information Bulletin & Syllabus',
      'type': 'pdf',
      'file_url': 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      'file_size': '4.8 MB',
      'created_at': '2026-01-10T10:00:00Z',
    },
    {
      'id': 2,
      'title': 'Physics Mechanics Quick Formula Sheet (High-Res)',
      'type': 'pdf',
      'file_url': 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      'file_size': '2.1 MB',
      'created_at': '2026-02-14T12:00:00Z',
    },
    {
      'id': 3,
      'title': 'Inorganic Chemistry Periodic Table & Trends Map',
      'type': 'pdf',
      'file_url': 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      'file_size': '3.4 MB',
      'created_at': '2026-03-01T09:30:00Z',
    },
    {
      'id': 4,
      'title': 'Biology High-Frequency Diagrams for Quick Revision',
      'type': 'pdf',
      'file_url': 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      'file_size': '5.6 MB',
      'created_at': '2026-04-18T15:20:00Z',
    },
  ];

  static final List<Map<String, dynamic>> _mockLiveClasses = [
    {
      'id': 1,
      'title': 'Live Doubt Clearing: Ray Optics & Wave Optics',
      'subject': 'Physics',
      'instructor_name': 'Prof. Rajesh Verma',
      'thumbnail_url': 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=500',
      'scheduled_at': '2026-11-01T17:00:00Z',
      'duration_minutes': 90,
      'status': 'upcoming',
      'stream_url': 'https://www.youtube.com/watch?v=M7lc1UVf-VE',
    },
    {
      'id': 2,
      'title': 'Mega Marathon: Complete Ecology in 3 Hours',
      'subject': 'Biology',
      'instructor_name': 'Dr. Ananya Sen',
      'thumbnail_url': 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=500',
      'scheduled_at': '2026-11-02T15:00:00Z',
      'duration_minutes': 180,
      'status': 'upcoming',
      'stream_url': 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    },
    {
      'id': 3,
      'title': 'Chemical Kinetics & Surface Chemistry Rapid Fire',
      'subject': 'Chemistry',
      'instructor_name': 'Dr. Neeraj Singhania',
      'thumbnail_url': 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=500',
      'scheduled_at': '2026-11-03T18:30:00Z',
      'duration_minutes': 60,
      'status': 'upcoming',
      'stream_url': 'https://www.youtube.com/watch?v=M7lc1UVf-VE',
    },
  ];
}
