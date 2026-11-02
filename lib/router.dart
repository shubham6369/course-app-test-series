import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import 'models/models.dart';
import 'screens/auth/forgot_password_screen.dart';
import 'screens/auth/login_screen.dart';
import 'screens/auth/register_screen.dart';
import 'screens/courses/all_courses_screen.dart';
import 'screens/courses/course_detail_screen.dart';
import 'screens/courses/my_courses_screen.dart';
import 'screens/doubt/doubt_screen.dart';
import 'screens/home/home_screen.dart';
import 'screens/onboarding/onboarding_screen.dart';
import 'screens/profile/profile_screen.dart';
import 'screens/shell.dart';
import 'screens/splash_screen.dart';
import 'screens/test_series/test_series_detail_screen.dart';
import 'screens/test_series/test_series_screen.dart';
import 'screens/quiz/attempt_report_screen.dart';
import 'screens/quiz/certificate_screen.dart';
import 'screens/quiz/free_quizzes_screen.dart';
import 'screens/quiz/my_performance_screen.dart';
import 'screens/quiz/previous_results.dart';
import 'screens/quiz/quiz_player_screen.dart';
import 'screens/quiz/quiz_result_screen.dart';
import 'screens/ai/ai_chat_screen.dart';
import 'screens/community/community_screen.dart';
import 'screens/content/content_viewer_screen.dart';
import 'screens/legal/legal_screen.dart';
import 'screens/payment/payment_screen.dart';
import 'screens/profile/edit_profile_screen.dart';
import 'screens/resources/ebooks_screen.dart';
import 'screens/resources/resource_list_screen.dart';
import 'screens/video/video_player_screen.dart';
import 'state/auth_provider.dart';

/// Centralized application router using GoRouter.
/// Configures public routes, auth flows, the persistent 5-tab shell route,
/// course and video player routes, and auth redirect guards.
class AppRouter {
  static final GlobalKey<NavigatorState> rootNavigatorKey =
      GlobalKey<NavigatorState>(debugLabel: 'root');
  static final GlobalKey<NavigatorState> shellNavigatorKey =
      GlobalKey<NavigatorState>(debugLabel: 'shell');

  static AuthProvider? _authOverride;

  /// Allows setting an AuthProvider override for tests
  static void setAuthOverride(AuthProvider? auth) {
    _authOverride = auth;
  }

  static final GoRouter router = GoRouter(
    navigatorKey: rootNavigatorKey,
    initialLocation: '/splash',
    routes: [
      // 1. Splash Screen
      GoRoute(
        path: '/splash',
        builder: (context, state) => const SplashScreen(),
      ),

      // 2. Onboarding Walkthrough
      GoRoute(
        path: '/onboarding',
        builder: (context, state) => const OnboardingScreen(),
      ),

      // 3. Auth Screens
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/register',
        builder: (context, state) => const RegisterScreen(),
      ),
      GoRoute(
        path: '/forgot-password',
        builder: (context, state) => const ForgotPasswordScreen(),
      ),

      // 4. Standalone Screens (Course Detail, Video Player, My Courses)
      GoRoute(
        path: '/courses/:id',
        parentNavigatorKey: rootNavigatorKey,
        builder: (context, state) {
          final idStr = state.pathParameters['id'] ?? '1';
          final id = int.tryParse(idStr) ?? idStr;
          final initialCourse = state.extra as Course?;
          return CourseDetailScreen(
            courseIdOrSlug: id,
            initialCourse: initialCourse,
          );
        },
      ),
      GoRoute(
        path: '/course-detail/:id',
        parentNavigatorKey: rootNavigatorKey,
        builder: (context, state) {
          final idStr = state.pathParameters['id'] ?? '1';
          final id = int.tryParse(idStr) ?? 1;
          final initialCourse = state.extra as Course?;
          return CourseDetailScreen(
            courseIdOrSlug: id,
            initialCourse: initialCourse,
          );
        },
      ),
      GoRoute(
        path: '/my-courses',
        parentNavigatorKey: rootNavigatorKey,
        builder: (context, state) => const MyCoursesScreen(),
      ),
      GoRoute(
        path: '/video-player',
        parentNavigatorKey: rootNavigatorKey,
        builder: (context, state) {
          final extra = state.extra;
          Lesson? lesson;
          Course? course;
          List<Lesson>? playlist;

          if (extra is Lesson) {
            lesson = extra;
          } else if (extra is Map<String, dynamic>) {
            lesson = extra['lesson'] as Lesson?;
            course = extra['course'] as Course?;
            playlist = extra['playlist'] as List<Lesson>?;
          }

          lesson ??= Lesson(
            id: 1,
            folderId: 101,
            title: 'Orientation Lecture',
            videoId: 'dQw4w9WgXcQ',
            durationMinutes: 45,
            isFreePreview: true,
          );
          return VideoPlayerScreen(
            lesson: lesson,
            course: course,
            playlist: playlist,
          );
        },
      ),

      GoRoute(
        path: '/test-series/:id',
        parentNavigatorKey: rootNavigatorKey,
        builder: (context, state) {
          final idStr = state.pathParameters['id'] ?? '1';
          final id = int.tryParse(idStr) ?? 1;
          final initialDetail = state.extra as TestSeriesDetail?;
          return TestSeriesDetailScreen(
            seriesId: id,
            initialDetail: initialDetail,
          );
        },
      ),
      GoRoute(
        path: '/quiz/:id',
        parentNavigatorKey: rootNavigatorKey,
        builder: (context, state) {
          final idStr = state.pathParameters['id'] ?? '1';
          final id = int.tryParse(idStr) ?? 1;
          final initialPaper = state.extra as QuizPaper?;
          return QuizPlayerScreen(
            quizId: id,
            initialPaper: initialPaper,
          );
        },
      ),
      GoRoute(
        path: '/my-performance',
        parentNavigatorKey: rootNavigatorKey,
        builder: (context, state) => const MyPerformanceScreen(),
      ),
      GoRoute(
        path: '/previous-results',
        parentNavigatorKey: rootNavigatorKey,
        builder: (context, state) => const PreviousResultsScreen(),
      ),
      GoRoute(
        path: '/free-quizzes',
        parentNavigatorKey: rootNavigatorKey,
        builder: (context, state) => const FreeQuizzesScreen(),
      ),
      GoRoute(
        path: '/quiz-player',
        parentNavigatorKey: rootNavigatorKey,
        builder: (context, state) {
          final extra = state.extra;
          int quizId = 1;
          QuizPaper? paper;
          if (extra is int) {
            quizId = extra;
          } else if (extra is QuizPaper) {
            quizId = extra.id;
            paper = extra;
          } else if (extra is Map<String, dynamic>) {
            quizId = extra['quizId'] as int? ?? 1;
            paper = extra['paper'] as QuizPaper?;
          }
          return QuizPlayerScreen(
            quizId: quizId,
            initialPaper: paper,
          );
        },
      ),
      GoRoute(
        path: '/quiz-result',
        parentNavigatorKey: rootNavigatorKey,
        builder: (context, state) {
          final extra = state.extra;
          QuizResult? result;
          QuizPaper? paper;
          Map<int, int>? userAnswers;

          if (extra is QuizResult) {
            result = extra;
          } else if (extra is Map<String, dynamic>) {
            result = extra['result'] as QuizResult?;
            paper = extra['paper'] as QuizPaper?;
            userAnswers = extra['userAnswers'] as Map<int, int>?;
          }

          result ??= QuizResult(
            attemptId: 1,
            quizId: 101,
            quizTitle: 'Practice Test',
            score: 0,
            totalMarks: 40,
            correctAnswers: 0,
            incorrectAnswers: 0,
            unattempted: 10,
            accuracy: 0,
            timeTakenSeconds: 0,
          );

          return QuizResultScreen(
            result: result,
            paper: paper,
            userAnswers: userAnswers,
          );
        },
      ),
      GoRoute(
        path: '/attempt-report',
        parentNavigatorKey: rootNavigatorKey,
        builder: (context, state) {
          final extra = state.extra;
          int attemptId = 1;
          QuizPaper? paper;
          Map<int, int>? userAnswers;

          if (extra is int) {
            attemptId = extra;
          } else if (extra is Map<String, dynamic>) {
            attemptId = extra['attemptId'] as int? ?? 1;
            paper = extra['paper'] as QuizPaper?;
            userAnswers = extra['userAnswers'] as Map<int, int>?;
          }

          return AttemptReportScreen(
            attemptId: attemptId,
            paper: paper,
            userAnswers: userAnswers,
          );
        },
      ),
      GoRoute(
        path: '/attempt-report/:id',
        parentNavigatorKey: rootNavigatorKey,
        builder: (context, state) {
          final idStr = state.pathParameters['id'] ?? '1';
          final id = int.tryParse(idStr) ?? 1;
          return AttemptReportScreen(attemptId: id);
        },
      ),
      GoRoute(
        path: '/certificate',
        parentNavigatorKey: rootNavigatorKey,
        builder: (context, state) {
          final extra = state.extra;
          QuizResult? result;
          if (extra is QuizResult) {
            result = extra;
          } else if (extra is Map<String, dynamic>) {
            result = extra['result'] as QuizResult?;
          }
          result ??= QuizResult(
            attemptId: 1,
            quizId: 101,
            quizTitle: 'Certification Test',
            score: 36,
            totalMarks: 40,
            correctAnswers: 9,
            incorrectAnswers: 1,
            unattempted: 0,
            accuracy: 90.0,
            timeTakenSeconds: 1200,
          );
          return CertificateScreen(result: result);
        },
      ),

      // Community, AI Tutor, Resources, Ebooks, Profile & Payment Routes
      GoRoute(
        path: '/community',
        parentNavigatorKey: rootNavigatorKey,
        builder: (context, state) => const CommunityScreen(),
      ),
      GoRoute(
        path: '/ai-chat',
        parentNavigatorKey: rootNavigatorKey,
        builder: (context, state) => const AiChatScreen(),
      ),
      GoRoute(
        path: '/ebooks',
        parentNavigatorKey: rootNavigatorKey,
        builder: (context, state) => const EbooksScreen(),
      ),
      GoRoute(
        path: '/resources',
        parentNavigatorKey: rootNavigatorKey,
        builder: (context, state) => const ResourceListScreen(),
      ),
      GoRoute(
        path: '/content-viewer',
        parentNavigatorKey: rootNavigatorKey,
        builder: (context, state) {
          final extra = state.extra as Map<String, dynamic>?;
          return ContentViewerScreen(
            title: extra?['title'] as String? ?? 'Study Document',
            contentUrl: extra?['contentUrl'] as String? ?? '',
            localFilePath: extra?['localFilePath'] as String?,
          );
        },
      ),
      GoRoute(
        path: '/edit-profile',
        parentNavigatorKey: rootNavigatorKey,
        builder: (context, state) => const EditProfileScreen(),
      ),
      GoRoute(
        path: '/payments',
        parentNavigatorKey: rootNavigatorKey,
        builder: (context, state) => const PaymentScreen(),
      ),
      GoRoute(
        path: '/legal',
        parentNavigatorKey: rootNavigatorKey,
        builder: (context, state) {
          final tab = state.extra as int? ?? 0;
          return LegalScreen(initialTabIndex: tab);
        },
      ),

      // 5. Shell Route (Persistent Bottom Navigation Bar)
      ShellRoute(
        navigatorKey: shellNavigatorKey,
        builder: (context, state, child) => AppShell(child: child),
        routes: [
          GoRoute(
            path: '/home',
            builder: (context, state) => const HomeScreen(),
          ),
          GoRoute(
            path: '/test-series',
            builder: (context, state) => const TestSeriesScreen(),
          ),
          GoRoute(
            path: '/courses',
            builder: (context, state) => const AllCoursesScreen(),
          ),
          GoRoute(
            path: '/doubts',
            builder: (context, state) => const DoubtScreen(),
          ),
          GoRoute(
            path: '/profile',
            builder: (context, state) => const ProfileScreen(),
          ),
        ],
      ),
    ],
    redirect: (context, state) {
      AuthProvider? auth = _authOverride;
      if (auth == null) {
        try {
          auth = Provider.of<AuthProvider>(context, listen: false);
        } catch (_) {}
      }

      final isAuthenticated = auth?.isAuthenticated ?? false;
      final matchedLocation = state.matchedLocation;

      final isAuthFlow = matchedLocation == '/login' ||
          matchedLocation == '/register' ||
          matchedLocation == '/forgot-password';

      // If already authenticated and trying to access login/register/forgot-password,
      // redirect them straight to home.
      if (isAuthenticated && isAuthFlow) {
        return '/home';
      }

      // Protected routes requiring authentication
      final protectedRoutes = [
        '/edit-profile',
        '/my-courses',
      ];

      if (!isAuthenticated && protectedRoutes.contains(matchedLocation)) {
        return '/login';
      }

      return null;
    },
  );
}
