import 'package:flutter/material.dart';
import '../../core/api_service.dart';
import '../../models/models.dart';
import '../../theme.dart';
import '../../widgets/common.dart';
import '../content/content_viewer_screen.dart';

/// Digital Ebook Library Screen
class EbooksScreen extends StatefulWidget {
  final List<Ebook>? initialEbooks;

  const EbooksScreen({super.key, this.initialEbooks});

  @override
  State<EbooksScreen> createState() => _EbooksScreenState();
}

class _EbooksScreenState extends State<EbooksScreen> {
  final ApiService _apiService = ApiService();
  final TextEditingController _searchController = TextEditingController();

  List<Ebook> _ebooks = [];
  bool _isLoading = true;
  String _selectedCategory = 'all';
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    if (widget.initialEbooks != null) {
      _ebooks = widget.initialEbooks!;
      _isLoading = false;
    } else {
      _loadEbooks();
    }
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadEbooks() async {
    setState(() => _isLoading = true);
    try {
      final ebooks = await _apiService.getEbooks();
      if (mounted) {
        setState(() {
          _ebooks = ebooks;
          _isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  List<Ebook> get _filteredEbooks {
    var list = _ebooks;
    if (_selectedCategory == 'free') {
      list = list.where((e) => e.isFree).toList();
    } else if (_selectedCategory == 'pro') {
      list = list.where((e) => !e.isFree).toList();
    }
    if (_searchQuery.isNotEmpty) {
      final q = _searchQuery.toLowerCase();
      list = list.where((e) =>
        e.title.toLowerCase().contains(q) ||
        (e.author?.toLowerCase().contains(q) ?? false)
      ).toList();
    }
    return list;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Digital Books & Guides'),
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
                hintText: 'Search books by title or author...',
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
                _buildCategoryChip('All Books', 'all'),
                const SizedBox(width: 8),
                _buildCategoryChip('Free', 'free'),
                const SizedBox(width: 8),
                _buildCategoryChip('Pro / Premium', 'pro'),
              ],
            ),
          ),

          const SizedBox(height: 6),

          // 3. Ebooks List
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : RefreshIndicator(
                    onRefresh: _loadEbooks,
                    child: _filteredEbooks.isEmpty
                        ? EmptyStateView(
                            icon: Icons.menu_book_rounded,
                            title: 'No Books Available',
                            message: _searchQuery.isNotEmpty
                                ? 'No books matching "$_searchQuery".'
                                : 'Check back later for updated study guides and reference handbooks.',
                            actionText: 'Refresh',
                            onAction: _loadEbooks,
                          )
                        : ListView.separated(
                            padding: const EdgeInsets.all(16),
                            itemCount: _filteredEbooks.length,
                            separatorBuilder: (_, __) => const SizedBox(height: 14),
                            itemBuilder: (context, index) {
                              final ebook = _filteredEbooks[index];
                              return _buildEbookCard(ebook);
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

  Widget _buildEbookCard(Ebook ebook) {
    return Container(
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
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Book Thumbnail / Icon
          Container(
            width: 70,
            height: 95,
            decoration: BoxDecoration(
              color: AppColors.primary.withAlpha(20),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: AppColors.primary.withAlpha(40)),
            ),
            child: const Center(
              child: Icon(Icons.book_rounded, size: 36, color: AppColors.primary),
            ),
          ),
          const SizedBox(width: 16),

          // Content
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        ebook.title,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontFamily: 'Poppins',
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: AppColors.textPrimary,
                        ),
                      ),
                    ),
                    AppBadge(
                      text: ebook.isFree ? 'FREE' : 'PRO',
                      backgroundColor: ebook.isFree ? AppColors.success : AppColors.accent,
                    ),
                  ],
                ),
                if (ebook.author != null) ...[
                  const SizedBox(height: 4),
                  Text(
                    'By ${ebook.author}',
                    style: const TextStyle(
                      fontFamily: 'Poppins',
                      fontSize: 12,
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
                const SizedBox(height: 8),
                Row(
                  children: [
                    Text(
                      '${ebook.pageCount} Pages • ${ebook.fileSize}',
                      style: const TextStyle(
                        fontFamily: 'Poppins',
                        fontSize: 11,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
                Row(
                  children: [
                    SizedBox(
                      height: 36,
                      child: ElevatedButton.icon(
                        onPressed: () {
                          Navigator.of(context).push(
                            MaterialPageRoute(
                              builder: (_) => ContentViewerScreen(
                                title: ebook.title,
                                contentUrl: ebook.pdfUrl,
                              ),
                            ),
                          );
                        },
                        icon: const Icon(Icons.chrome_reader_mode_rounded, size: 16),
                        label: const Text(
                          'Read Book',
                          style: TextStyle(fontFamily: 'Poppins', fontSize: 12, fontWeight: FontWeight.bold),
                        ),
                        style: ElevatedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(horizontal: 14),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    SizedBox(
                      height: 36,
                      child: OutlinedButton.icon(
                        onPressed: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text('Downloading "${ebook.title}" for offline reading...'),
                              duration: const Duration(seconds: 2),
                            ),
                          );
                        },
                        icon: const Icon(Icons.download_rounded, size: 16),
                        label: const Text(
                          'Download',
                          style: TextStyle(fontFamily: 'Poppins', fontSize: 12, fontWeight: FontWeight.bold),
                        ),
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(horizontal: 12),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
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
    );
  }
}
