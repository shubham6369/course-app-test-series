import 'package:flutter/material.dart';
import '../../core/api_service.dart';
import '../../models/models.dart';
import '../../theme.dart';
import '../../widgets/common.dart';
import '../../widgets/skeleton.dart';
import '../quiz/my_performance_screen.dart';
import 'test_series_detail_screen.dart';

/// Test Series Directory & Mock Exam Packages Catalog Screen
class TestSeriesScreen extends StatefulWidget {
  const TestSeriesScreen({super.key});

  @override
  State<TestSeriesScreen> createState() => _TestSeriesScreenState();
}

class _TestSeriesScreenState extends State<TestSeriesScreen> {
  final ApiService _apiService = ApiService();
  final TextEditingController _searchController = TextEditingController();

  List<TestSeriesSummary> _allPackages = [];
  List<TestSeriesSummary> _filteredPackages = [];
  bool _isLoading = true;
  String? _errorMessage;
  String _selectedCategory = 'All';

  @override
  void initState() {
    super.initState();
    _loadTestSeries();
  }

  Future<void> _loadTestSeries() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final packages = await _apiService.getTestSeries();
      if (!mounted) return;
      setState(() {
        _allPackages = packages;
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
      _filteredPackages = _allPackages.where((p) {
        final matchesQuery = query.isEmpty ||
            p.title.toLowerCase().contains(query) ||
            (p.category?.toLowerCase().contains(query) ?? false);

        bool matchesCat = true;
        if (_selectedCategory == 'Free Mocks') {
          matchesCat = p.freeTests > 0 || p.price == 0;
        } else if (_selectedCategory != 'All') {
          matchesCat = p.category?.toLowerCase().contains(_selectedCategory.toLowerCase()) ?? false;
        }

        return matchesQuery && matchesCat;
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
        title: const Text('Test Series & CBT Mocks'),
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.analytics_outlined),
            tooltip: 'My Performance',
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (context) => const MyPerformanceScreen(),
                ),
              );
            },
          ),
        ],
      ),
      body: Column(
        children: [
          _buildSearchAndFilters(),
          const Divider(height: 1),
          Expanded(
            child: RefreshIndicator(
              onRefresh: _loadTestSeries,
              color: AppColors.primary,
              child: _buildPackageList(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSearchAndFilters() {
    const categories = ['All', 'NEET', 'JEE Main', 'JEE Adv', 'Free Mocks'];

    return Container(
      color: Colors.white,
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 12),
      child: Column(
        children: [
          TextField(
            controller: _searchController,
            onChanged: (_) => _applyFilters(),
            decoration: InputDecoration(
              hintText: 'Search mock tests, full syllabus drills...',
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
              fillColor: AppColors.surface,
              contentPadding: const EdgeInsets.symmetric(
                  horizontal: 14, vertical: 10),
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
                borderSide:
                    const BorderSide(color: AppColors.primary, width: 1.5),
              ),
            ),
          ),
          const SizedBox(height: 10),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: categories.map((cat) {
                final isSelected = _selectedCategory == cat;
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: FilterChip(
                    selected: isSelected,
                    label: Text(
                      cat,
                      style: TextStyle(
                        fontFamily: 'Poppins',
                        fontSize: 12,
                        fontWeight:
                            isSelected ? FontWeight.w600 : FontWeight.normal,
                        color:
                            isSelected ? Colors.white : AppColors.textPrimary,
                      ),
                    ),
                    selectedColor: AppColors.primary,
                    backgroundColor: Colors.white,
                    checkmarkColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(20),
                      side: BorderSide(
                        color:
                            isSelected ? AppColors.primary : AppColors.border,
                      ),
                    ),
                    onSelected: (_) {
                      setState(() {
                        _selectedCategory = cat;
                        _applyFilters();
                      });
                    },
                  ),
                );
              }).toList(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPackageList() {
    if (_isLoading) {
      return const Padding(
        padding: EdgeInsets.all(16),
        child: SkeletonList(count: 4),
      );
    }

    if (_errorMessage != null) {
      return ErrorStateView(
        message: 'Failed to load test packages: $_errorMessage',
        onRetry: _loadTestSeries,
      );
    }

    if (_filteredPackages.isEmpty) {
      return Center(
        child: EmptyStateView(
          icon: Icons.assignment_outlined,
          title: 'No Test Packages Found',
          message: 'Try switching filters or search terms.',
          actionText: 'Reset Filters',
          onAction: () {
            _searchController.clear();
            setState(() {
              _selectedCategory = 'All';
              _applyFilters();
            });
          },
        ),
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: _filteredPackages.length,
      separatorBuilder: (_, __) => const SizedBox(height: 14),
      itemBuilder: (context, index) {
        final pkg = _filteredPackages[index];
        return _buildTestPackageCard(pkg);
      },
    );
  }

  Widget _buildTestPackageCard(TestSeriesSummary pkg) {
    final effectivePrice = pkg.discountPrice ?? pkg.price;

    return InkWell(
      onTap: () {
        Navigator.of(context).push(
          MaterialPageRoute(
            builder: (context) => TestSeriesDetailScreen(seriesId: pkg.id),
          ),
        );
      },
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.border),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withAlpha(5),
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
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withAlpha(15),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    pkg.category ?? 'Target Exam',
                    style: const TextStyle(
                      fontFamily: 'Poppins',
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color: AppColors.primary,
                    ),
                  ),
                ),
                const Spacer(),
                if (pkg.freeTests > 0)
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: AppColors.success.withAlpha(20),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      '${pkg.freeTests} Free Mocks',
                      style: const TextStyle(
                        fontFamily: 'Poppins',
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: AppColors.success,
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 10),
            Text(
              pkg.title,
              style: const TextStyle(
                fontFamily: 'Poppins',
                fontSize: 15,
                fontWeight: FontWeight.bold,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                const Icon(Icons.assignment_outlined,
                    size: 15, color: AppColors.textSecondary),
                const SizedBox(width: 4),
                Text(
                  '${pkg.totalTests} Full Tests',
                  style: const TextStyle(
                    fontFamily: 'Poppins',
                    fontSize: 11,
                    color: AppColors.textSecondary,
                  ),
                ),
                const SizedBox(width: 14),
                const Icon(Icons.timer_outlined,
                    size: 15, color: AppColors.textSecondary),
                const SizedBox(width: 4),
                Text(
                  '${pkg.validityDays} Days Validity',
                  style: const TextStyle(
                    fontFamily: 'Poppins',
                    fontSize: 11,
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
            const Divider(height: 20),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                if (effectivePrice == 0)
                  const Text(
                    'FREE',
                    style: TextStyle(
                      fontFamily: 'Poppins',
                      fontSize: 16,
                      fontWeight: FontWeight.w800,
                      color: AppColors.success,
                    ),
                  )
                else
                  Row(
                    children: [
                      Text(
                        '₹${effectivePrice.toInt()}',
                        style: const TextStyle(
                          fontFamily: 'Poppins',
                          fontSize: 16,
                          fontWeight: FontWeight.w800,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      if (pkg.discountPrice != null &&
                          pkg.discountPrice! < pkg.price) ...[
                        const SizedBox(width: 6),
                        Text(
                          '₹${pkg.price.toInt()}',
                          style: const TextStyle(
                            fontFamily: 'Poppins',
                            fontSize: 12,
                            decoration: TextDecoration.lineThrough,
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ],
                  ),
                ElevatedButton(
                  onPressed: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (context) =>
                            TestSeriesDetailScreen(seriesId: pkg.id),
                      ),
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    elevation: 0,
                    padding: const EdgeInsets.symmetric(
                        horizontal: 14, vertical: 8),
                    minimumSize: Size.zero,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  child: const Text(
                    'View Tests',
                    style: TextStyle(
                      fontFamily: 'Poppins',
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
