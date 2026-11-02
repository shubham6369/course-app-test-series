import 'package:flutter/material.dart';
import '../../core/api_service.dart';
import '../../core/media.dart';
import '../../models/models.dart';
import '../../theme.dart';
import '../../widgets/common.dart';
import 'doubt_detail_screen.dart';

/// Doubt Forum & Q&A Screen
class DoubtScreen extends StatefulWidget {
  const DoubtScreen({super.key});

  @override
  State<DoubtScreen> createState() => _DoubtScreenState();
}

class _DoubtScreenState extends State<DoubtScreen> {
  final ApiService _apiService = ApiService();
  final TextEditingController _searchController = TextEditingController();

  List<Doubt> _doubts = [];
  bool _isLoading = true;
  String _selectedStatus = 'all';
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _loadDoubts();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadDoubts() async {
    setState(() => _isLoading = true);
    try {
      final doubts = await _apiService.getDoubts(status: _selectedStatus);
      if (mounted) {
        setState(() {
          _doubts = doubts;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  List<Doubt> get _filteredDoubts {
    if (_searchQuery.isEmpty) return _doubts;
    final q = _searchQuery.toLowerCase();
    return _doubts.where((d) {
      return d.subject.toLowerCase().contains(q) ||
          d.question.toLowerCase().contains(q) ||
          d.studentName.toLowerCase().contains(q);
    }).toList();
  }

  void _showAskDoubtSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => _AskDoubtModal(
        onDoubtSubmitted: (newDoubt) {
          setState(() {
            _doubts.insert(0, newDoubt);
          });
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Doubts & Q&A Forum'),
        actions: [
          IconButton(
            tooltip: 'Ask Doubt',
            icon: const Icon(Icons.add_circle_outline_rounded),
            onPressed: _showAskDoubtSheet,
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _showAskDoubtSheet,
        backgroundColor: AppColors.primary,
        icon: const Icon(Icons.help_outline_rounded, color: Colors.white),
        label: const Text(
          'Ask a Doubt',
          style: TextStyle(
            fontFamily: 'Poppins',
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
      ),
      body: Column(
        children: [
          // 1. Search Bar
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
            child: TextField(
              controller: _searchController,
              onChanged: (val) => setState(() => _searchQuery = val.trim()),
              decoration: InputDecoration(
                hintText: 'Search doubts by subject or topic...',
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

          // 2. Filter Status Chips
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
            child: Row(
              children: [
                _buildStatusChip('All Doubts', 'all'),
                const SizedBox(width: 8),
                _buildStatusChip('Pending', 'pending'),
                const SizedBox(width: 8),
                _buildStatusChip('Resolved', 'resolved'),
              ],
            ),
          ),

          const SizedBox(height: 6),

          // 3. Doubt List
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : RefreshIndicator(
                    onRefresh: _loadDoubts,
                    child: _filteredDoubts.isEmpty
                        ? EmptyStateView(
                            icon: Icons.question_answer_outlined,
                            title: 'No Doubts Found',
                            message: _searchQuery.isNotEmpty
                                ? 'No doubts matching "$_searchQuery".'
                                : 'You haven\'t posted any doubts yet.',
                            actionText: 'Ask a Doubt',
                            onAction: _showAskDoubtSheet,
                          )
                        : ListView.separated(
                            padding: const EdgeInsets.fromLTRB(16, 8, 16, 80),
                            itemCount: _filteredDoubts.length,
                            separatorBuilder: (_, __) => const SizedBox(height: 12),
                            itemBuilder: (context, index) {
                              final doubt = _filteredDoubts[index];
                              return _buildDoubtCard(doubt);
                            },
                          ),
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatusChip(String label, String value) {
    final isSelected = _selectedStatus == value;
    return ChoiceChip(
      label: Text(label),
      selected: isSelected,
      onSelected: (selected) {
        if (selected) {
          setState(() => _selectedStatus = value);
          _loadDoubts();
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

  Widget _buildDoubtCard(Doubt doubt) {
    final isResolved = doubt.status.toLowerCase() == 'resolved';
    final replyCount = doubt.replies?.length ?? 0;

    return Container(
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
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: () {
            Navigator.of(context).push(
              MaterialPageRoute(
                builder: (_) => DoubtDetailScreen(
                  doubtId: doubt.id,
                  initialDoubt: doubt,
                ),
              ),
            );
          },
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Subject & Status header
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withAlpha(20),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        doubt.subject,
                        style: const TextStyle(
                          fontFamily: 'Poppins',
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: AppColors.primary,
                        ),
                      ),
                    ),
                    AppBadge(
                      text: isResolved ? 'RESOLVED' : 'PENDING',
                      backgroundColor: isResolved ? AppColors.success : AppColors.warning,
                    ),
                  ],
                ),
                const SizedBox(height: 10),

                // Question Text
                Text(
                  doubt.question,
                  maxLines: 3,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontFamily: 'Poppins',
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    height: 1.4,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 14),

                // Footer: Student name and reply count
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Asked by ${doubt.studentName}',
                      style: const TextStyle(
                        fontFamily: 'Poppins',
                        fontSize: 11,
                        color: AppColors.textSecondary,
                      ),
                    ),
                    Row(
                      children: [
                        const Icon(
                          Icons.chat_bubble_outline_rounded,
                          size: 14,
                          color: AppColors.textSecondary,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          '$replyCount ${replyCount == 1 ? 'reply' : 'replies'}',
                          style: const TextStyle(
                            fontFamily: 'Poppins',
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            color: AppColors.textSecondary,
                          ),
                        ),
                        const SizedBox(width: 4),
                        const Icon(
                          Icons.arrow_forward_ios_rounded,
                          size: 12,
                          color: AppColors.textSecondary,
                        ),
                      ],
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/// Ask Doubt Bottom Sheet
class _AskDoubtModal extends StatefulWidget {
  final ValueChanged<Doubt> onDoubtSubmitted;

  const _AskDoubtModal({required this.onDoubtSubmitted});

  @override
  State<_AskDoubtModal> createState() => _AskDoubtModalState();
}

class _AskDoubtModalState extends State<_AskDoubtModal> {
  final ApiService _apiService = ApiService();
  final TextEditingController _questionController = TextEditingController();

  String _selectedSubject = 'Physics';
  bool _isSubmitting = false;
  String? _attachedImagePath;

  final List<String> _subjects = [
    'Physics',
    'Chemistry',
    'Mathematics',
    'Biology',
    'General Science',
  ];

  @override
  void dispose() {
    _questionController.dispose();
    super.dispose();
  }

  Future<void> _pickImage() async {
    final file = await MediaHelper.pickImageFromGallery();
    if (file != null && mounted) {
      setState(() => _attachedImagePath = file.path);
    }
  }

  Future<void> _submit() async {
    final question = _questionController.text.trim();
    if (question.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please describe your question or doubt.')),
      );
      return;
    }

    setState(() => _isSubmitting = true);
    try {
      final newDoubt = await _apiService.submitDoubt(
        _selectedSubject,
        question,
        imagePath: _attachedImagePath,
      );
      if (mounted) {
        widget.onDoubtSubmitted(newDoubt);
        Navigator.of(context).pop();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Your doubt has been submitted to teachers!')),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isSubmitting = false);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to post doubt. Please retry.')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom + 20,
        left: 20,
        right: 20,
        top: 20,
      ),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Ask a Doubt',
                style: TextStyle(
                  fontFamily: 'Poppins',
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary,
                ),
              ),
              IconButton(
                icon: const Icon(Icons.close_rounded),
                onPressed: () => Navigator.of(context).pop(),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Subject Selector
          const Text(
            'Select Subject',
            style: TextStyle(
              fontFamily: 'Poppins',
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 8),
          DropdownButtonFormField<String>(
            initialValue: _selectedSubject,
            decoration: const InputDecoration(
              contentPadding: EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            ),
            items: _subjects.map((sub) {
              return DropdownMenuItem(value: sub, child: Text(sub));
            }).toList(),
            onChanged: (val) {
              if (val != null) setState(() => _selectedSubject = val);
            },
          ),
          const SizedBox(height: 16),

          // Question Input
          const Text(
            'Your Question / Doubt Details',
            style: TextStyle(
              fontFamily: 'Poppins',
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 8),
          TextField(
            controller: _questionController,
            maxLines: 4,
            decoration: const InputDecoration(
              hintText: 'Type your question clearly. Mention any specific concept or step you are stuck on...',
              alignLabelWithHint: true,
            ),
          ),
          const SizedBox(height: 12),

          // Photo Attachment
          if (_attachedImagePath == null)
            OutlinedButton.icon(
              onPressed: _pickImage,
              icon: const Icon(Icons.add_photo_alternate_outlined, size: 18),
              label: const Text(
                'Attach Photo / Diagram (Optional)',
                style: TextStyle(fontFamily: 'Poppins', fontSize: 12),
              ),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: AppColors.border),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              ),
            )
          else
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: AppColors.primary.withAlpha(15),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: AppColors.primary.withAlpha(40)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.image_outlined, size: 20, color: AppColors.primary),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      _attachedImagePath!.split(RegExp(r'[/\\]')).last,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontFamily: 'Poppins',
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                        color: AppColors.primary,
                      ),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close_rounded, size: 18, color: AppColors.textSecondary),
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(),
                    onPressed: () => setState(() => _attachedImagePath = null),
                  ),
                ],
              ),
            ),
          const SizedBox(height: 20),

          // Submit Button
          PrimaryButton(
            text: 'Submit Doubt',
            isLoading: _isSubmitting,
            onPressed: _submit,
          ),
        ],
      ),
    );
  }
}
