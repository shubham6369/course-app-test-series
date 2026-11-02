import 'package:flutter/material.dart';
import '../../core/api_service.dart';
import '../../models/models.dart';
import '../../theme.dart';
import '../../widgets/common.dart';

/// Doubt Detail Screen displaying the original question and reply thread.
class DoubtDetailScreen extends StatefulWidget {
  final int doubtId;
  final Doubt? initialDoubt;

  const DoubtDetailScreen({
    super.key,
    required this.doubtId,
    this.initialDoubt,
  });

  @override
  State<DoubtDetailScreen> createState() => _DoubtDetailScreenState();
}

class _DoubtDetailScreenState extends State<DoubtDetailScreen> {
  final ApiService _apiService = ApiService();
  final TextEditingController _replyController = TextEditingController();
  final ScrollController _scrollController = ScrollController();

  Doubt? _doubt;
  bool _isLoading = true;
  bool _isSubmitting = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    if (widget.initialDoubt != null) {
      _doubt = widget.initialDoubt;
      _isLoading = false;
    }
    _loadDoubt();
  }

  @override
  void dispose() {
    _replyController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _loadDoubt() async {
    try {
      final doubt = await _apiService.getDoubtDetail(widget.doubtId);
      if (mounted) {
        setState(() {
          _doubt = doubt;
          _isLoading = false;
          _errorMessage = null;
        });
      }
    } catch (e) {
      if (mounted && _doubt == null) {
        setState(() {
          _isLoading = false;
          _errorMessage = 'Failed to load doubt details.';
        });
      }
    }
  }

  Future<void> _sendReply() async {
    final text = _replyController.text.trim();
    if (text.isEmpty) return;

    setState(() => _isSubmitting = true);
    try {
      final newReply = await _apiService.replyDoubt(widget.doubtId, text);
      _replyController.clear();

      if (mounted) {
        setState(() {
          final currentReplies = List<DoubtReply>.from(_doubt?.replies ?? []);
          currentReplies.add(newReply);
          if (_doubt != null) {
            _doubt = Doubt(
              id: _doubt!.id,
              studentId: _doubt!.studentId,
              studentName: _doubt!.studentName,
              studentAvatar: _doubt!.studentAvatar,
              subject: _doubt!.subject,
              question: _doubt!.question,
              imageUrl: _doubt!.imageUrl,
              status: _doubt!.status,
              createdAt: _doubt!.createdAt,
              replies: currentReplies,
            );
          }
          _isSubmitting = false;
        });

        // Scroll to bottom
        WidgetsBinding.instance.addPostFrameCallback((_) {
          if (_scrollController.hasClients) {
            _scrollController.animateTo(
              _scrollController.position.maxScrollExtent,
              duration: const Duration(milliseconds: 300),
              curve: Curves.easeOut,
            );
          }
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isSubmitting = false);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to submit reply. Please try again.')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_doubt != null ? '${_doubt!.subject} Doubt' : 'Doubt Discussion'),
        actions: [
          if (_doubt != null)
            Padding(
              padding: const EdgeInsets.only(right: 16),
              child: Center(
                child: AppBadge(
                  text: _doubt!.status.toUpperCase(),
                  backgroundColor: _doubt!.status.toLowerCase() == 'resolved'
                      ? AppColors.success
                      : AppColors.warning,
                ),
              ),
            ),
        ],
      ),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_errorMessage != null && _doubt == null) {
      return EmptyStateView(
        icon: Icons.error_outline_rounded,
        title: 'Error Loading Doubt',
        message: _errorMessage!,
        actionText: 'Retry',
        onAction: _loadDoubt,
      );
    }

    final doubt = _doubt!;
    final replies = doubt.replies ?? [];

    return Column(
      children: [
        Expanded(
          child: ListView(
            controller: _scrollController,
            padding: const EdgeInsets.all(16),
            children: [
              // 1. Original Question Card
              _buildQuestionCard(doubt),
              const SizedBox(height: 20),

              // 2. Replies Header
              Row(
                children: [
                  const Icon(Icons.forum_outlined, size: 20, color: AppColors.primary),
                  const SizedBox(width: 8),
                  Text(
                    'Teacher & Student Replies (${replies.length})',
                    style: const TextStyle(
                      fontFamily: 'Poppins',
                      fontSize: 15,
                      fontWeight: FontWeight.bold,
                      color: AppColors.textPrimary,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // 3. Thread List
              if (replies.isEmpty)
                Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: Colors.grey.shade50,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: const Center(
                    child: Text(
                      'No replies yet. A teacher will answer shortly!',
                      style: TextStyle(
                        fontFamily: 'Poppins',
                        fontSize: 13,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ),
                )
              else
                ...replies.map((reply) => _buildReplyTile(reply)),
            ],
          ),
        ),

        // Bottom Reply Input
        _buildReplyInput(),
      ],
    );
  }

  Widget _buildQuestionCard(Doubt doubt) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(6),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Author Header
          Row(
            children: [
              CircleAvatar(
                radius: 20,
                backgroundColor: AppColors.primary.withAlpha(30),
                child: Text(
                  doubt.studentName.isNotEmpty ? doubt.studentName[0].toUpperCase() : 'S',
                  style: const TextStyle(
                    fontFamily: 'Poppins',
                    fontWeight: FontWeight.bold,
                    color: AppColors.primary,
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      doubt.studentName,
                      style: const TextStyle(
                        fontFamily: 'Poppins',
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    Text(
                      'Asked in ${doubt.subject}',
                      style: const TextStyle(
                        fontFamily: 'Poppins',
                        fontSize: 12,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),

          // Question Text
          Text(
            doubt.question,
            style: const TextStyle(
              fontFamily: 'Poppins',
              fontSize: 14,
              height: 1.5,
              color: AppColors.textPrimary,
            ),
          ),

          if (doubt.imageUrl != null && doubt.imageUrl!.isNotEmpty) ...[
            const SizedBox(height: 12),
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: Container(
                height: 160,
                width: double.infinity,
                color: Colors.grey.shade100,
                child: Image.network(
                  doubt.imageUrl!,
                  fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => const Center(
                    child: Icon(Icons.image_outlined, size: 48, color: AppColors.textSecondary),
                  ),
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildReplyTile(DoubtReply reply) {
    final isTeacher = reply.authorType.toLowerCase() == 'teacher' ||
        reply.authorType.toLowerCase() == 'faculty';

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: isTeacher ? const Color(0xFFF0FDF4) : Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isTeacher ? const Color(0xFFBBF7D0) : AppColors.border,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 16,
                backgroundColor: isTeacher
                    ? const Color(0xFF16A34A).withAlpha(30)
                    : AppColors.primary.withAlpha(25),
                child: Icon(
                  isTeacher ? Icons.verified_user_rounded : Icons.person_outline_rounded,
                  size: 18,
                  color: isTeacher ? const Color(0xFF16A34A) : AppColors.primary,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Row(
                  children: [
                    Text(
                      reply.authorName,
                      style: const TextStyle(
                        fontFamily: 'Poppins',
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    const SizedBox(width: 6),
                    if (isTeacher)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: const Color(0xFF16A34A),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: const Text(
                          'FACULTY',
                          style: TextStyle(
                            fontFamily: 'Poppins',
                            fontSize: 9,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                      ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            reply.message,
            style: const TextStyle(
              fontFamily: 'Poppins',
              fontSize: 13,
              height: 1.45,
              color: AppColors.textPrimary,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildReplyInput() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: AppColors.border)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(8),
            blurRadius: 10,
            offset: const Offset(0, -3),
          ),
        ],
      ),
      child: SafeArea(
        top: false,
        child: Row(
          children: [
            Expanded(
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 14),
                decoration: BoxDecoration(
                  color: Colors.grey.shade100,
                  borderRadius: BorderRadius.circular(24),
                ),
                child: TextField(
                  controller: _replyController,
                  decoration: const InputDecoration(
                    hintText: 'Write a response or clarification...',
                    hintStyle: TextStyle(fontFamily: 'Poppins', fontSize: 13),
                    border: InputBorder.none,
                  ),
                  maxLines: null,
                ),
              ),
            ),
            const SizedBox(width: 8),
            Material(
              color: AppColors.primary,
              shape: const CircleBorder(),
              child: InkWell(
                customBorder: const CircleBorder(),
                onTap: _isSubmitting ? null : _sendReply,
                child: Padding(
                  padding: const EdgeInsets.all(10),
                  child: _isSubmitting
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                        )
                      : const Icon(Icons.send_rounded, size: 18, color: Colors.white),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
