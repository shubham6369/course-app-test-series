import 'package:flutter/material.dart';
import '../../core/api_service.dart';
import '../../models/models.dart';
import '../../theme.dart';
import '../../widgets/category_grid.dart';
import '../../widgets/common.dart';
import '../../widgets/course_card.dart';
import '../../widgets/skeleton.dart';
import 'course_detail_screen.dart';

/// Full Course Catalog Screen with live search filtering, category chips,
/// price filter, and responsive course grid.
class AllCoursesScreen extends StatefulWidget {
  final String? initialCategory;

  const AllCoursesScreen({
    super.key,
    this.initialCategory,
  });

  @override
  State<AllCoursesScreen> createState() => _AllCoursesScreenState();
}

class _AllCoursesScreenState extends State<AllCoursesScreen> {
  final ApiService _apiService = ApiService();
  final TextEditingController _searchController = TextEditingController();

  List<Course> _allCourses = [];
  List<Course> _filteredCourses = [];
  bool _isLoading = true;
  String? _errorMessage;
  String _selectedCategory = 'All Exams';
  String _priceFilter = 'all'; // 'all', 'free', 'paid'

  @override
  void initState() {
    super.initState();
    if (widget.initialCategory != null && widget.initialCategory!.isNotEmpty) {
      _selectedCategory = widget.initialCategory!;
    }
    _loadCourses();
  }

  Future<void> _loadCourses() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final courses = await _apiService.getCourses();
      if (!mounted) return;
      setState(() {
        _allCourses = courses;
        _isLoading = false;
        _applyFilters();
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _errorMessage = e.toString();
        _isLoading = false;
      });
    }
  }

  void _applyFilters() {
    final query = _searchController.text.trim().toLowerCase();

    setState(() {
      _filteredCourses = _allCourses.where((c) {
        // Search Filter
        final matchesQuery = query.isEmpty ||
            c.title.toLowerCase().contains(query) ||
            (c.description?.toLowerCase().contains(query) ?? false) ||
            (c.instructorName?.toLowerCase().contains(query) ?? false);

        // Category Filter
        final matchesCategory = _selectedCategory == 'All Exams' ||
            _selectedCategory == 'All' ||
            c.title.toLowerCase().contains(_selectedCategory.toLowerCase()) ||
            (c.description?.toLowerCase().contains(_selectedCategory.toLowerCase()) ?? false);

        // Price Filter
        bool matchesPrice = true;
        final effectivePrice = c.discountPrice ?? c.price;
        if (_priceFilter == 'free') {
          matchesPrice = effectivePrice == 0;
        } else if (_priceFilter == 'paid') {
          matchesPrice = effectivePrice > 0;
        }

        return matchesQuery && matchesCategory && matchesPrice;
      }).toList();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Explore Courses'),
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            tooltip: 'Refresh',
            onPressed: _loadCourses,
          ),
        ],
      ),
      body: Column(
        children: [
          // Search & Filter Header
          Container(
            color: Colors.white,
            padding: const EdgeInsets.fromLTRB(16, 10, 16, 12),
            child: Column(
              children: [
                // Search Input with live filtering
                TextField(
                  controller: _searchController,
                  onChanged: (_) => _applyFilters(),
                  decoration: InputDecoration(
                    hintText: 'Search NEET, JEE, physics, biology...',
                    hintStyle: const TextStyle(
                      fontFamily: 'Poppins',
                      fontSize: 13,
                      color: AppColors.textSecondary,
                    ),
                    prefixIcon: const Icon(Icons.search, color: AppColors.primary),
                    suffixIcon: _searchController.text.isNotEmpty
                        ? IconButton(
                            icon: const Icon(Icons.clear, size: 18),
                            onPressed: () {
                              _searchController.clear();
                              _applyFilters();
                            },
                          )
                        : null,
                    filled: true,
                    fillColor: AppColors.background,
                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: AppColors.border),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: AppColors.border),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
                    ),
                  ),
                ),
                const SizedBox(height: 10),
                // Horizontal Category Filter Chips
                CategoryGrid(
                  categories: const [],
                  selectedCategory: _selectedCategory,
                  isHorizontal: true,
                  onCategorySelected: (cat) {
                    setState(() {
                      _selectedCategory = cat;
                      _applyFilters();
                    });
                  },
                ),
                const SizedBox(height: 8),
                // Price Type Filter Row
                Row(
                  children: [
                    _buildPriceChip('all', 'All Courses'),
                    const SizedBox(width: 8),
                    _buildPriceChip('free', 'Free Lessons'),
                    const SizedBox(width: 8),
                    _buildPriceChip('paid', 'Premium / Pro'),
                    const Spacer(),
                    Text(
                      '${_filteredCourses.length} results',
                      style: const TextStyle(
                        fontFamily: 'Poppins',
                        fontSize: 11,
                        color: AppColors.textSecondary,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const Divider(height: 1, color: AppColors.border),
          // Responsive Courses List / Grid
          Expanded(
            child: RefreshIndicator(
              onRefresh: _loadCourses,
              color: AppColors.primary,
              child: _buildCourseGridOrList(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPriceChip(String value, String label) {
    final isSelected = _priceFilter == value;
    return ChoiceChip(
      selected: isSelected,
      label: Text(
        label,
        style: TextStyle(
          fontFamily: 'Poppins',
          fontSize: 11,
          fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
          color: isSelected ? Colors.white : AppColors.textPrimary,
        ),
      ),
      selectedColor: AppColors.accent,
      backgroundColor: Colors.white,
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 0),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
        side: BorderSide(
          color: isSelected ? AppColors.accent : AppColors.border,
        ),
      ),
      onSelected: (_) {
        setState(() {
          _priceFilter = value;
          _applyFilters();
        });
      },
    );
  }

  Widget _buildCourseGridOrList() {
    if (_isLoading) {
      return const Padding(
        padding: EdgeInsets.all(16),
        child: SkeletonList(count: 4),
      );
    }

    if (_errorMessage != null) {
      return ErrorStateView(
        message: 'Could not load courses: $_errorMessage',
        onRetry: _loadCourses,
      );
    }

    if (_filteredCourses.isEmpty) {
      return Center(
        child: EmptyStateView(
          icon: Icons.search_off_rounded,
          title: 'No Matching Courses Found',
          message:
              'Try clearing your search query or choosing another category.',
          actionText: 'Reset Filters',
          onAction: () {
            _searchController.clear();
            setState(() {
              _selectedCategory = 'All Exams';
              _priceFilter = 'all';
              _applyFilters();
            });
          },
        ),
      );
    }

    return LayoutBuilder(
      builder: (context, constraints) {
        final isWide = constraints.maxWidth >= 600;

        if (isWide) {
          final crossAxisCount = constraints.maxWidth >= 900 ? 3 : 2;
          return GridView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: _filteredCourses.length,
            gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: crossAxisCount,
              mainAxisSpacing: 16,
              crossAxisSpacing: 16,
              childAspectRatio: 0.85,
            ),
            itemBuilder: (context, index) {
              final course = _filteredCourses[index];
              return CourseCard(
                course: course,
                onTap: () => _navigateToCourse(course),
              );
            },
          );
        }

        return ListView.separated(
          padding: const EdgeInsets.all(16),
          itemCount: _filteredCourses.length,
          separatorBuilder: (_, __) => const SizedBox(height: 16),
          itemBuilder: (context, index) {
            final course = _filteredCourses[index];
            return CourseCard(
              course: course,
              onTap: () => _navigateToCourse(course),
            );
          },
        );
      },
    );
  }

  void _navigateToCourse(Course course) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => CourseDetailScreen(
          courseIdOrSlug: course.id,
          initialCourse: course,
        ),
      ),
    );
  }
}
