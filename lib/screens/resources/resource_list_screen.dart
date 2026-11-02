import 'package:flutter/material.dart';
import '../../core/api_service.dart';
import '../../core/share_helper.dart';
import '../../models/models.dart';
import '../../theme.dart';
import '../../widgets/common.dart';
import '../content/content_viewer_screen.dart';

/// PDF Notes, Formula Sheets, and Study Materials Screen
class ResourceListScreen extends StatefulWidget {
  final List<Resource>? initialResources;

  const ResourceListScreen({super.key, this.initialResources});

  @override
  State<ResourceListScreen> createState() => _ResourceListScreenState();
}

class _ResourceListScreenState extends State<ResourceListScreen> {
  final ApiService _apiService = ApiService();
  final TextEditingController _searchController = TextEditingController();

  List<Resource> _resources = [];
  bool _isLoading = true;
  String _selectedCategory = 'all';
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    if (widget.initialResources != null) {
      _resources = widget.initialResources!;
      _isLoading = false;
    } else {
      _loadResources();
    }
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadResources() async {
    setState(() => _isLoading = true);
    try {
      final resources = await _apiService.getResources();
      if (mounted) {
        setState(() {
          _resources = resources;
          _isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  List<Resource> get _filteredResources {
    var list = _resources;
    if (_selectedCategory == 'formula') {
      list = list.where((r) => r.title.toLowerCase().contains('formula')).toList();
    } else if (_selectedCategory == 'syllabus') {
      list = list.where((r) => r.title.toLowerCase().contains('syllabus') || r.title.toLowerCase().contains('bulletin')).toList();
    }
    if (_searchQuery.isNotEmpty) {
      final q = _searchQuery.toLowerCase();
      list = list.where((r) =>
        r.title.toLowerCase().contains(q) ||
        r.type.toLowerCase().contains(q)
      ).toList();
    }
    return list;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Study Notes & Materials'),
      ),
      body: Column(
        children: [
          // 1. Search Bar
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 6),
            child: TextField(
              controller: _searchController,
              onChanged: (val) => setState(() => _searchQuery = val.trim()),
              decoration: InputDecoration(
                hintText: 'Search notes and revision sheets...',
                prefixIcon: const Icon(Icons.search_rounded),
                suffixIcon: _searchQuery.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear_rounded),
                        onPressed: () {
                          _searchController.clear();
                          setState(() => _searchQuery = '');
                        },
                      )
                    : null,
                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              ),
            ),
          ),

          // 2. Filter Category Chips
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
            child: Row(
              children: [
                _buildCategoryChip('All Resources', 'all'),
                const SizedBox(width: 8),
                _buildCategoryChip('Formula Sheets', 'formula'),
                const SizedBox(width: 8),
                _buildCategoryChip('Syllabus & Info', 'syllabus'),
              ],
            ),
          ),

          const SizedBox(height: 6),

          // 3. Resources List
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : RefreshIndicator(
                    onRefresh: _loadResources,
                    child: _filteredResources.isEmpty
                        ? EmptyStateView(
                            icon: Icons.folder_open_rounded,
                            title: 'No Documents Found',
                            message: _searchQuery.isNotEmpty
                                ? 'No documents matching "$_searchQuery".'
                                : 'Formulas and revision notes will appear here soon.',
                            actionText: 'Refresh',
                            onAction: _loadResources,
                          )
                        : ListView.separated(
                            padding: const EdgeInsets.all(16),
                            itemCount: _filteredResources.length,
                            separatorBuilder: (_, __) => const SizedBox(height: 12),
                            itemBuilder: (context, index) {
                              final res = _filteredResources[index];
                              return _buildResourceTile(res);
                            },
                          ),
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildCategoryChip(String label, String value) {
    final isSelected = _selectedCategory == value;
    return ChoiceChip(
      label: Text(label),
      selected: isSelected,
      onSelected: (selected) {
        if (selected) {
          setState(() => _selectedCategory = value);
        }
      },
      selectedColor: AppColors.primary.withAlpha(30),
      labelStyle: TextStyle(
        fontFamily: 'Poppins',
        fontSize: 12,
        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
        color: isSelected ? AppColors.primary : AppColors.textSecondary,
      ),
    );
  }

  Widget _buildResourceTile(Resource res) {
    return Container(
      padding: const EdgeInsets.all(16),
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
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.primary.withAlpha(20),
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(
              Icons.picture_as_pdf_rounded,
              color: AppColors.primary,
              size: 26,
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  res.title,
                  style: const TextStyle(
                    fontFamily: 'Poppins',
                    fontSize: 13.5,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  '${res.type.toUpperCase()} • ${res.fileSize}',
                  style: const TextStyle(
                    fontFamily: 'Poppins',
                    fontSize: 11,
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          ),
          IconButton(
            icon: const Icon(Icons.download_rounded, size: 20),
            tooltip: 'Download',
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('Downloading "${res.title}"...'),
                  duration: const Duration(seconds: 2),
                ),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.share_outlined, size: 20),
            tooltip: 'Share',
            onPressed: () {
              ShareHelper.shareText(
                'Download this revision resource: ${res.title}\n${res.fileUrl}',
                subject: res.title,
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.arrow_forward_ios_rounded, size: 16),
            tooltip: 'View Document',
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (_) => ContentViewerScreen(
                    title: res.title,
                    contentUrl: res.fileUrl,
                  ),
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}
