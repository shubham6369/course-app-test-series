import 'package:flutter/material.dart';
import '../../core/api_service.dart';
import '../../core/media.dart';
import '../../models/models.dart';
import '../../theme.dart';
import '../../widgets/common.dart';

/// Community Feed & Discussion Screen
class CommunityScreen extends StatefulWidget {
  const CommunityScreen({super.key});

  @override
  State<CommunityScreen> createState() => _CommunityScreenState();
}

class _CommunityScreenState extends State<CommunityScreen> {
  final ApiService _apiService = ApiService();

  List<CommunityPost> _posts = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadFeed();
  }

  Future<void> _loadFeed() async {
    setState(() => _isLoading = true);
    try {
      final posts = await _apiService.getCommunityFeed();
      if (mounted) {
        setState(() {
          _posts = posts;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _toggleLike(CommunityPost post, int index) async {
    final originalState = post.isLiked;
    final originalCount = post.likeCount;
    final newLiked = !originalState;
    final newCount = newLiked ? originalCount + 1 : (originalCount > 0 ? originalCount - 1 : 0);

    setState(() {
      _posts[index] = CommunityPost(
        id: post.id,
        authorId: post.authorId,
        authorName: post.authorName,
        authorAvatar: post.authorAvatar,
        content: post.content,
        imageUrl: post.imageUrl,
        likeCount: newCount,
        replyCount: post.replyCount,
        isLiked: newLiked,
        createdAt: post.createdAt,
      );
    });

    try {
      await _apiService.likePost(post.id);
    } catch (_) {
      if (mounted) {
        setState(() {
          _posts[index] = CommunityPost(
            id: post.id,
            authorId: post.authorId,
            authorName: post.authorName,
            authorAvatar: post.authorAvatar,
            content: post.content,
            imageUrl: post.imageUrl,
            likeCount: originalCount,
            replyCount: post.replyCount,
            isLiked: originalState,
            createdAt: post.createdAt,
          );
        });
      }
    }
  }

  void _showCommentSheet(CommunityPost post, int index) {
    final commentCtrl = TextEditingController();
    bool isSubmitting = false;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (sheetContext) {
        return StatefulBuilder(
          builder: (context, setSheetState) {
            return Container(
              padding: EdgeInsets.only(
                bottom: MediaQuery.of(sheetContext).viewInsets.bottom + 16,
                top: 20,
                left: 16,
                right: 16,
              ),
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Post Discussion',
                        style: TextStyle(
                          fontFamily: 'Poppins',
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close_rounded),
                        onPressed: () => Navigator.of(sheetContext).pop(),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    post.content,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontFamily: 'Poppins',
                      fontSize: 13,
                      color: AppColors.textSecondary,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: commentCtrl,
                          decoration: InputDecoration(
                            hintText: 'Add to the discussion...',
                            hintStyle: const TextStyle(fontFamily: 'Poppins', fontSize: 13),
                            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(24),
                              borderSide: const BorderSide(color: AppColors.border),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Material(
                        color: AppColors.primary,
                        shape: const CircleBorder(),
                        child: InkWell(
                          customBorder: const CircleBorder(),
                          onTap: isSubmitting
                              ? null
                              : () async {
                                  final comment = commentCtrl.text.trim();
                                  if (comment.isEmpty) return;

                                  setSheetState(() => isSubmitting = true);
                                  try {
                                    await _apiService.commentPost(post.id, comment);
                                    if (mounted) {
                                      setState(() {
                                        _posts[index] = CommunityPost(
                                          id: post.id,
                                          authorId: post.authorId,
                                          authorName: post.authorName,
                                          authorAvatar: post.authorAvatar,
                                          content: post.content,
                                          imageUrl: post.imageUrl,
                                          likeCount: post.likeCount,
                                          replyCount: post.replyCount + 1,
                                          isLiked: post.isLiked,
                                          createdAt: post.createdAt,
                                        );
                                      });
                                    }
                                    if (sheetContext.mounted) {
                                      Navigator.of(sheetContext).pop();
                                      ScaffoldMessenger.of(sheetContext).showSnackBar(
                                        const SnackBar(content: Text('Comment published!')),
                                      );
                                    }
                                  } catch (e) {
                                    setSheetState(() => isSubmitting = false);
                                  }
                                },
                          child: Padding(
                            padding: const EdgeInsets.all(10),
                            child: isSubmitting
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
                ],
              ),
            );
          },
        );
      },
    );
  }

  void _showCreatePostSheet() {
    final contentCtrl = TextEditingController();
    bool isPosting = false;
    String? attachedImagePath;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (sheetContext) {
        return StatefulBuilder(
          builder: (context, setSheetState) {
            return Container(
              padding: EdgeInsets.only(
                bottom: MediaQuery.of(sheetContext).viewInsets.bottom + 20,
                top: 20,
                left: 20,
                right: 20,
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
                        'Create Community Post',
                        style: TextStyle(
                          fontFamily: 'Poppins',
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close_rounded),
                        onPressed: () => Navigator.of(sheetContext).pop(),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: contentCtrl,
                    maxLines: 4,
                    decoration: const InputDecoration(
                      hintText: 'Share study tips, exam strategies, or inspirational thoughts with fellow aspirants...',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 12),
                  if (attachedImagePath == null)
                    OutlinedButton.icon(
                      onPressed: () async {
                        final file = await MediaHelper.pickImageFromGallery();
                        if (file != null) {
                          setSheetState(() => attachedImagePath = file.path);
                        }
                      },
                      icon: const Icon(Icons.add_photo_alternate_outlined, size: 18),
                      label: const Text(
                        'Attach Image / Notes (Optional)',
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
                              attachedImagePath!.split(RegExp(r'[/\\]')).last,
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
                            onPressed: () => setSheetState(() => attachedImagePath = null),
                          ),
                        ],
                      ),
                    ),
                  const SizedBox(height: 16),
                  PrimaryButton(
                    text: 'Publish Post',
                    isLoading: isPosting,
                    onPressed: () async {
                      final content = contentCtrl.text.trim();
                      if (content.isEmpty) return;

                      setSheetState(() => isPosting = true);
                      try {
                        final newPost = await _apiService.createPost(
                          content,
                          imagePath: attachedImagePath,
                        );
                        if (mounted) {
                          setState(() {
                            _posts.insert(0, newPost);
                          });
                        }
                        if (sheetContext.mounted) {
                          Navigator.of(sheetContext).pop();
                          ScaffoldMessenger.of(sheetContext).showSnackBar(
                            const SnackBar(content: Text('Your post is live on the community feed!')),
                          );
                        }
                      } catch (e) {
                        setSheetState(() => isPosting = false);
                      }
                    },
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Student Community'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            tooltip: 'Refresh Feed',
            onPressed: _loadFeed,
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _showCreatePostSheet,
        backgroundColor: AppColors.primary,
        icon: const Icon(Icons.edit_note_rounded, color: Colors.white),
        label: const Text(
          'Post Update',
          style: TextStyle(
            fontFamily: 'Poppins',
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadFeed,
              child: _posts.isEmpty
                  ? EmptyStateView(
                      icon: Icons.people_outline_rounded,
                      title: 'No Posts Yet',
                      message: 'Be the first student to share an insight with the community!',
                      actionText: 'Create Post',
                      onAction: _showCreatePostSheet,
                    )
                  : ListView.separated(
                      padding: const EdgeInsets.fromLTRB(16, 12, 16, 80),
                      itemCount: _posts.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 14),
                      itemBuilder: (context, index) {
                        final post = _posts[index];
                        return _buildPostCard(post, index);
                      },
                    ),
            ),
    );
  }

  Widget _buildPostCard(CommunityPost post, int index) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(5),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 20,
                backgroundColor: AppColors.primary.withAlpha(25),
                child: Text(
                  post.authorName.isNotEmpty ? post.authorName[0].toUpperCase() : 'S',
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
                      post.authorName,
                      style: const TextStyle(
                        fontFamily: 'Poppins',
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    const Text(
                      'Aspirant • Community Member',
                      style: TextStyle(
                        fontFamily: 'Poppins',
                        fontSize: 11,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            post.content,
            style: const TextStyle(
              fontFamily: 'Poppins',
              fontSize: 13.5,
              height: 1.5,
              color: AppColors.textPrimary,
            ),
          ),
          if (post.imageUrl != null && post.imageUrl!.isNotEmpty) ...[
            const SizedBox(height: 12),
            ClipRRect(
              borderRadius: BorderRadius.circular(10),
              child: Container(
                height: 180,
                width: double.infinity,
                color: Colors.grey.shade100,
                child: Image.network(
                  post.imageUrl!,
                  fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => const Center(
                    child: Icon(Icons.image_outlined, size: 48, color: AppColors.textSecondary),
                  ),
                ),
              ),
            ),
          ],
          const SizedBox(height: 14),
          Row(
            children: [
              InkWell(
                borderRadius: BorderRadius.circular(20),
                onTap: () => _toggleLike(post, index),
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  child: Row(
                    children: [
                      Icon(
                        post.isLiked ? Icons.favorite_rounded : Icons.favorite_border_rounded,
                        size: 20,
                        color: post.isLiked ? Colors.red : AppColors.textSecondary,
                      ),
                      const SizedBox(width: 6),
                      Text(
                        '${post.likeCount}',
                        style: TextStyle(
                          fontFamily: 'Poppins',
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: post.isLiked ? Colors.red : AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 16),
              InkWell(
                borderRadius: BorderRadius.circular(20),
                onTap: () => _showCommentSheet(post, index),
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  child: Row(
                    children: [
                      const Icon(
                        Icons.chat_bubble_outline_rounded,
                        size: 19,
                        color: AppColors.textSecondary,
                      ),
                      const SizedBox(width: 6),
                      Text(
                        '${post.replyCount}',
                        style: const TextStyle(
                          fontFamily: 'Poppins',
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
