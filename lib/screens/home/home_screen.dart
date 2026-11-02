import 'package:cached_network_image/cached_network_image.dart';
import 'package:carousel_slider/carousel_slider.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../core/api_service.dart';
import '../../models/models.dart';
import '../../state/auth_provider.dart';
import '../../theme.dart';
import '../../widgets/category_grid.dart';
import '../../widgets/common.dart';
import '../../widgets/course_card.dart';
import '../../widgets/skeleton.dart';
import '../courses/all_courses_screen.dart';
import '../courses/course_detail_screen.dart';
import '../courses/my_courses_screen.dart';
import '../video/video_player_screen.dart';

/// Full-featured Home Dashboard Screen with student greeting & target exam badge,
/// banner carousel slider, quick action shortcuts, category grid, featured test series,
/// popular courses, continue learning card, and pull-to-refresh.
class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final ApiService _apiService = ApiService();
  late Future<HomeFeed> _homeFeedFuture;
  int _currentBannerIndex = 0;

  @override
  void initState() {
    super.initState();
    _homeFeedFuture = _apiService.getHomeFeed();
  }

  Future<void> _refresh() async {
    setState(() {
      _homeFeedFuture = _apiService.getHomeFeed();
    });
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final user = auth.currentUser;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: _buildAppBar(user),
      body: RefreshIndicator(
        onRefresh: _refresh,
        color: AppColors.primary,
        child: FutureBuilder<HomeFeed>(
          future: _homeFeedFuture,
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: const [
                    SkeletonCard(height: 160),
                    SizedBox(height: 16),
                    SkeletonList(count: 3),
                  ],
                ),
              );
            }

            if (snapshot.hasError) {
              return ErrorStateView(
                message: 'Failed to load home feed: ${snapshot.error}',
                onRetry: _refresh,
              );
            }

            final feed = snapshot.data ?? HomeFeed.empty();

            return SingleChildScrollView(
              padding: const EdgeInsets.only(bottom: 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildNoticeTicker(),
                  const SizedBox(height: 12),
                  if (feed.banners.isNotEmpty) ...[
                    _buildBannerCarousel(feed.banners),
                    const SizedBox(height: 16),
                  ],
                  _buildQuickActionGrid(),
                  const SizedBox(height: 20),
                  _buildSectionTitle(
                    title: 'Target Exam & Categories',
                    subtitle: 'Choose your academic goal',
                  ),
                  const SizedBox(height: 8),
                  CategoryGrid(
                    categories: feed.categories,
                    onCategorySelected: (categoryName) {
                      Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (context) => AllCoursesScreen(
                            initialCategory: categoryName,
                          ),
                        ),
                      );
                    },
                  ),
                  const SizedBox(height: 20),
                  _buildContinueLearningSection(feed),
                  const SizedBox(height: 16),
                  SectionHeader(
                    title: 'Popular Courses',
                    subtitle: 'Learn from top subject masters',
                    onViewAll: () => context.go('/courses'),
                  ),
                  _buildPopularCoursesList(feed.popularCourses),
                  const SizedBox(height: 20),
                  SectionHeader(
                    title: 'Featured Test Series',
                    subtitle: 'Full length mock tests with All-India ranks',
                    onViewAll: () => context.go('/test-series'),
                  ),
                  _buildFeaturedTestSeriesList(feed.featuredTestSeries),
                  const SizedBox(height: 20),
                  _buildDailyQuizPromoCard(),
                ],
              ),
            );
          },
        ),
      ),
    );
  }

  PreferredSizeWidget _buildAppBar(Student? user) {
    final greeting = _getGreetingMessage();

    return AppBar(
      elevation: 0,
      backgroundColor: Colors.white,
      titleSpacing: 16,
      title: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: AppColors.primary.withAlpha(20),
              shape: BoxShape.circle,
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(20),
              child: Image.asset(
                'assets/icons/test_series_logo.jpeg',
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => const Icon(
                  Icons.person_rounded,
                  color: AppColors.primary,
                  size: 24,
                ),
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  user != null ? '$greeting, ${user.name} 👋' : '$greeting, Scholar 👋',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontFamily: 'Poppins',
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
                ),
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withAlpha(15),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        user?.targetExam ?? 'NEET & JEE 2026',
                        style: const TextStyle(
                          fontFamily: 'Poppins',
                          fontSize: 10,
                          color: AppColors.primary,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
      actions: [
        IconButton(
          icon: const Icon(Icons.bookmark_border_rounded, color: AppColors.textPrimary),
          tooltip: 'My Courses',
          onPressed: () {
            Navigator.of(context).push(
              MaterialPageRoute(
                builder: (context) => const MyCoursesScreen(),
              ),
            );
          },
        ),
        IconButton(
          icon: const Icon(Icons.notifications_none_rounded, color: AppColors.textPrimary),
          tooltip: 'Notifications',
          onPressed: () {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('No new notifications right now.'),
                duration: Duration(seconds: 2),
              ),
            );
          },
        ),
      ],
    );
  }

  String _getGreetingMessage() {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }

  Widget _buildNoticeTicker() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      color: AppColors.primary.withAlpha(15),
      child: const Row(
        children: [
          Icon(Icons.campaign_outlined, size: 18, color: AppColors.primary),
          SizedBox(width: 8),
          Expanded(
            child: Text(
              '📢 All-India Mega Mock Test registrations open for NEET & JEE 2026!',
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                fontFamily: 'Poppins',
                fontSize: 11,
                fontWeight: FontWeight.w600,
                color: AppColors.primary,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBannerCarousel(List<BannerItem> banners) {
    final isTesting = WidgetsBinding.instance.runtimeType.toString().contains('Test');

    return Column(
      children: [
        CarouselSlider.builder(
          itemCount: banners.length,
          options: CarouselOptions(
            height: 155,
            autoPlay: false,
            autoPlayInterval: const Duration(seconds: 4),
            enlargeCenterPage: true,
            viewportFraction: 0.92,
            onPageChanged: (index, reason) {
              setState(() => _currentBannerIndex = index);
            },
          ),
          itemBuilder: (context, index, realIndex) {
            final banner = banners[index];
            return InkWell(
              onTap: () {
                if (banner.actionType == 'course') {
                  final courseId = int.tryParse(banner.actionValue ?? '101') ?? 101;
                  Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (context) => CourseDetailScreen(courseIdOrSlug: courseId),
                    ),
                  );
                } else if (banner.actionType == 'test_series') {
                  context.go('/test-series');
                }
              },
              borderRadius: BorderRadius.circular(16),
              child: Container(
                margin: const EdgeInsets.symmetric(horizontal: 4),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(16),
                  gradient: const LinearGradient(
                    colors: [AppColors.primary, AppColors.primaryLight],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.primary.withAlpha(30),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                clipBehavior: Clip.antiAlias,
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    if (!isTesting &&
                        banner.imageUrl.isNotEmpty &&
                        !banner.imageUrl.contains('placeholder'))
                      CachedNetworkImage(
                        imageUrl: banner.imageUrl,
                        fit: BoxFit.cover,
                        errorWidget: (_, __, ___) => _buildBannerGraphic(banner),
                      )
                    else
                      _buildBannerGraphic(banner),
                  ],
                ),
              ),
            );
          },
        ),
        const SizedBox(height: 8),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: banners.asMap().entries.map((entry) {
            final isSelected = _currentBannerIndex == entry.key;
            return AnimatedContainer(
              duration: const Duration(milliseconds: 250),
              width: isSelected ? 18 : 6,
              height: 6,
              margin: const EdgeInsets.symmetric(horizontal: 3),
              decoration: BoxDecoration(
                color: isSelected ? AppColors.primary : AppColors.border,
                borderRadius: BorderRadius.circular(3),
              ),
            );
          }).toList(),
        ),
      ],
    );
  }

  Widget _buildBannerGraphic(BannerItem banner) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
            decoration: BoxDecoration(
              color: Colors.white.withAlpha(50),
              borderRadius: BorderRadius.circular(4),
            ),
            child: const Text(
              'SPECIAL OFFER',
              style: TextStyle(
                fontFamily: 'Poppins',
                fontSize: 9,
                fontWeight: FontWeight.bold,
                letterSpacing: 1.0,
                color: Colors.white,
              ),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            banner.title.isNotEmpty ? banner.title : 'NEET / JEE Crash Program 2026',
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(
              fontFamily: 'Poppins',
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            banner.subtitle ?? 'High-Yield CBT Tests & Live Masterclasses',
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(
              fontFamily: 'Poppins',
              fontSize: 11,
              color: Colors.white70,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActionGrid() {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        children: [
          _buildQuickTile(
            icon: Icons.flash_on_rounded,
            label: 'Free Quizzes',
            color: AppColors.warning,
            onTap: () => context.push('/free-quizzes'),
          ),
          const SizedBox(width: 14),
          _buildQuickTile(
            icon: Icons.play_lesson_outlined,
            label: 'Video Courses',
            color: AppColors.primaryLight,
            onTap: () => context.go('/courses'),
          ),
          const SizedBox(width: 14),
          _buildQuickTile(
            icon: Icons.quiz_outlined,
            label: 'Test Series',
            color: AppColors.primary,
            onTap: () => context.go('/test-series'),
          ),
          const SizedBox(width: 14),
          _buildQuickTile(
            icon: Icons.help_center_outlined,
            label: 'Doubts',
            color: AppColors.accent,
            onTap: () => context.go('/doubts'),
          ),
          const SizedBox(width: 14),
          _buildQuickTile(
            icon: Icons.menu_book_outlined,
            label: 'Ebooks',
            color: AppColors.info,
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Ebooks library will open shortly.'),
                  duration: Duration(seconds: 2),
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildQuickTile({
    required IconData icon,
    required String label,
    required Color color,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: SizedBox(
        width: 72,
        child: Column(
          children: [
            Container(
              width: 54,
              height: 54,
              decoration: BoxDecoration(
                color: color.withAlpha(20),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: color.withAlpha(50)),
              ),
              child: Icon(icon, color: color, size: 26),
            ),
            const SizedBox(height: 6),
            Text(
              label,
              textAlign: TextAlign.center,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                fontFamily: 'Poppins',
                fontSize: 11,
                fontWeight: FontWeight.w600,
                color: AppColors.textPrimary,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionTitle({required String title, String? subtitle}) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(
              fontFamily: 'Poppins',
              fontSize: 17,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
          if (subtitle != null) ...[
            const SizedBox(height: 2),
            Text(
              subtitle,
              style: const TextStyle(
                fontFamily: 'Poppins',
                fontSize: 12,
                color: AppColors.textSecondary,
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildContinueLearningSection(HomeFeed feed) {
    if (feed.popularCourses.isEmpty) return const SizedBox.shrink();
    final firstCourse = feed.popularCourses.first;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.border),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withAlpha(6),
              blurRadius: 8,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withAlpha(20),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.play_arrow_rounded,
                      color: AppColors.primary, size: 16),
                ),
                const SizedBox(width: 8),
                const Text(
                  'Continue Learning',
                  style: TextStyle(
                    fontFamily: 'Poppins',
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: AppColors.primary,
                  ),
                ),
                const Spacer(),
                const Text(
                  'Lesson 4 of 24',
                  style: TextStyle(
                    fontFamily: 'Poppins',
                    fontSize: 11,
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Text(
              firstCourse.title,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                fontFamily: 'Poppins',
                fontSize: 14,
                fontWeight: FontWeight.bold,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 8),
            ClipRRect(
              borderRadius: BorderRadius.circular(4),
              child: const LinearProgressIndicator(
                value: 0.35,
                backgroundColor: AppColors.borderLight,
                valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
                minHeight: 6,
              ),
            ),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                ElevatedButton.icon(
                  onPressed: () {
                    final lesson = Lesson(
                      id: 1,
                      folderId: 101,
                      title: '${firstCourse.title} - Module 1 Lecture',
                      videoId: 'M7lc1UVf-VE',
                      durationMinutes: 40,
                      isFreePreview: true,
                    );
                    Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (context) => VideoPlayerScreen(
                          lesson: lesson,
                          course: firstCourse,
                        ),
                      ),
                    );
                  },
                  icon: const Icon(Icons.play_arrow, size: 16),
                  label: const Text('Resume Lecture'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    elevation: 0,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPopularCoursesList(List<Course> courses) {
    if (courses.isEmpty) {
      return const Padding(
        padding: EdgeInsets.symmetric(horizontal: 16),
        child: Text(
          'No courses currently available.',
          style: TextStyle(color: AppColors.textSecondary),
        ),
      );
    }

    return SizedBox(
      height: 310,
      child: ListView.separated(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        scrollDirection: Axis.horizontal,
        itemCount: courses.length,
        separatorBuilder: (_, __) => const SizedBox(width: 14),
        itemBuilder: (context, index) {
          final course = courses[index];
          return CourseCard(
            course: course,
            isCompact: true,
            onTap: () {
              Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (context) => CourseDetailScreen(
                    courseIdOrSlug: course.id,
                    initialCourse: course,
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }

  Widget _buildFeaturedTestSeriesList(List<TestSeriesSummary> packages) {
    if (packages.isEmpty) {
      return const Padding(
        padding: EdgeInsets.symmetric(horizontal: 16),
        child: Text(
          'No test series available.',
          style: TextStyle(color: AppColors.textSecondary),
        ),
      );
    }

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: ListView.separated(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        itemCount: packages.length > 3 ? 3 : packages.length,
        separatorBuilder: (_, __) => const SizedBox(height: 12),
        itemBuilder: (context, index) {
          final pkg = packages[index];
          return InkWell(
            onTap: () => context.go('/test-series'),
            borderRadius: BorderRadius.circular(14),
            child: Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: AppColors.border),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withAlpha(5),
                    blurRadius: 6,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Row(
                children: [
                  Container(
                    width: 48,
                    height: 48,
                    decoration: BoxDecoration(
                      color: AppColors.primary.withAlpha(20),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(Icons.assignment_outlined,
                        color: AppColors.primary, size: 24),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          pkg.title,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            fontFamily: 'Poppins',
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                            color: AppColors.textPrimary,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            Text(
                              '${pkg.totalTests} Tests Included',
                              style: const TextStyle(
                                fontFamily: 'Poppins',
                                fontSize: 11,
                                color: AppColors.textSecondary,
                              ),
                            ),
                            if (pkg.validityDays > 0) ...[
                              const SizedBox(width: 8),
                              Text(
                                '• ${pkg.validityDays} Days',
                                style: const TextStyle(
                                  fontFamily: 'Poppins',
                                  fontSize: 11,
                                  color: AppColors.textSecondary,
                                ),
                              ),
                            ],
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  const Icon(Icons.arrow_forward_ios_rounded,
                      size: 16, color: AppColors.textSecondary),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildDailyQuizPromoCard() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [Color(0xFF2C3E50), Color(0xFF3498DB)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(16),
        ),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: Colors.white24,
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: const Text(
                      'DAILY FREE DRILL',
                      style: TextStyle(
                        fontFamily: 'Poppins',
                        fontSize: 9,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Practice Today\'s 10-Min Quiz',
                    style: TextStyle(
                      fontFamily: 'Poppins',
                      fontSize: 15,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Evaluate speed & accuracy with instant AI solution analysis',
                    style: TextStyle(
                      fontFamily: 'Poppins',
                      fontSize: 11,
                      color: Colors.white70,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 12),
            ElevatedButton(
              onPressed: () => context.push('/free-quizzes'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.white,
                foregroundColor: AppColors.primary,
                elevation: 0,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              ),
              child: const Text(
                'Play Free',
                style: TextStyle(
                  fontFamily: 'Poppins',
                  fontWeight: FontWeight.bold,
                  fontSize: 12,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
