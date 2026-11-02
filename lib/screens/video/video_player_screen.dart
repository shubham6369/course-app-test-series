import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:youtube_player_iframe/youtube_player_iframe.dart';

import '../../core/screenshot_guard.dart';
import '../../models/models.dart';
import '../../state/auth_provider.dart';
import '../../theme.dart';
import '../../widgets/watermark.dart';

/// Full-featured Video Player Screen with YouTube integration, dynamic anti-piracy
/// watermark, lesson syllabus drawer, notes access, and student comments.
class VideoPlayerScreen extends StatefulWidget {
  final Lesson lesson;
  final Course? course;
  final List<Lesson>? playlist;

  const VideoPlayerScreen({
    super.key,
    required this.lesson,
    this.course,
    this.playlist,
  });

  @override
  State<VideoPlayerScreen> createState() => _VideoPlayerScreenState();
}

class _VideoPlayerScreenState extends State<VideoPlayerScreen>
    with SingleTickerProviderStateMixin {
  late Lesson _currentLesson;
  YoutubePlayerController? _youtubeController;
  bool _isPlayerInitialized = false;
  bool _isPlaying = true;
  double _playbackSpeed = 1.0;
  Duration _currentPosition = Duration.zero;
  Duration _totalDuration = const Duration(minutes: 45);

  late TabController _tabController;
  final TextEditingController _commentController = TextEditingController();
  final List<VideoComment> _comments = [];

  @override
  void initState() {
    super.initState();
    _currentLesson = widget.lesson;
    _totalDuration = Duration(
        minutes: _currentLesson.durationMinutes > 0
            ? _currentLesson.durationMinutes
            : 45);
    _tabController = TabController(length: 3, vsync: this);

    // Initialize Mock Comments
    _initComments();

    // Enable anti-piracy screenshot protection
    ScreenshotGuardService.enable();

    // Initialize Player
    _initPlayer(_currentLesson.videoId);
  }

  void _initComments() {
    _comments.addAll([
      VideoComment(
        id: 1,
        lessonId: _currentLesson.id,
        studentId: 101,
        studentName: 'Aarav Patel',
        comment: 'Great explanation for this derivation! Cleared my concepts.',
        createdAt: DateTime.now().subtract(const Duration(hours: 3)),
        likesCount: 12,
        isTeacherReply: false,
      ),
      VideoComment(
        id: 2,
        lessonId: _currentLesson.id,
        studentId: 1,
        studentName: 'Dr. Sharma (Faculty)',
        comment:
            'Remember students: keep a special focus on the 3rd step in the final exam!',
        createdAt: DateTime.now().subtract(const Duration(hours: 1)),
        likesCount: 28,
        isTeacherReply: true,
      ),
    ]);
  }

  void _initPlayer(String videoId) {
    try {
      final cleanVideoId = _extractVideoId(videoId);
      _youtubeController = YoutubePlayerController.fromVideoId(
        videoId: cleanVideoId.isNotEmpty ? cleanVideoId : 'dQw4w9WgXcQ',
        autoPlay: true,
        params: const YoutubePlayerParams(
          showControls: true,
          showFullscreenButton: true,
          mute: false,
          enableCaption: true,
        ),
      );
      _isPlayerInitialized = true;
    } catch (e) {
      debugPrint('YoutubePlayerController initialization fallback: $e');
      _isPlayerInitialized = false;
    }
  }

  String _extractVideoId(String input) {
    if (input.contains('v=')) {
      return input.split('v=')[1].split('&')[0];
    } else if (input.contains('youtu.be/')) {
      return input.split('youtu.be/')[1].split('?')[0];
    }
    return input.trim();
  }

  void _switchLesson(Lesson newLesson) {
    setState(() {
      _currentLesson = newLesson;
      _totalDuration = Duration(
          minutes: newLesson.durationMinutes > 0
              ? newLesson.durationMinutes
              : 30);
      _currentPosition = Duration.zero;
      _isPlaying = true;
    });

    final cleanId = _extractVideoId(newLesson.videoId);
    if (_youtubeController != null && _isPlayerInitialized) {
      try {
        _youtubeController!.loadVideoById(videoId: cleanId);
      } catch (_) {
        _initPlayer(cleanId);
      }
    } else {
      _initPlayer(cleanId);
    }
  }

  @override
  void dispose() {
    try {
      _youtubeController?.close();
    } catch (_) {}
    _tabController.dispose();
    _commentController.dispose();
    ScreenshotGuardService.disable();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context, listen: false);
    final student = auth.currentUser;
    final watermarkText = student != null
        ? '${student.name} • ${student.phone.isNotEmpty ? student.phone : student.email}'
        : 'Confidential • Test Series';

    return Scaffold(
      backgroundColor: Colors.black,
      body: SafeArea(
        child: Watermark(
          text: watermarkText,
          opacity: 0.08,
          child: Column(
            children: [
              _buildPlayerContainer(),
              Expanded(
                child: Container(
                  color: Colors.white,
                  child: Column(
                    children: [
                      _buildTabBar(),
                      Expanded(
                        child: TabBarView(
                          controller: _tabController,
                          children: [
                            _buildOverviewTab(),
                            _buildPlaylistTab(),
                            _buildCommentsTab(),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPlayerContainer() {
    return AspectRatio(
      aspectRatio: 16 / 9,
      child: Container(
        color: Colors.black,
        child: Stack(
          children: [
            if (_isPlayerInitialized &&
                _youtubeController != null &&
                !kIsWeb &&
                (defaultTargetPlatform == TargetPlatform.android ||
                    defaultTargetPlatform == TargetPlatform.iOS))
              YoutubePlayer(
                controller: _youtubeController!,
                aspectRatio: 16 / 9,
              )
            else
              _buildMockPlayerView(),
            // Top overlay bar with back button & lesson title
            Positioned(
              top: 8,
              left: 8,
              right: 8,
              child: Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.arrow_back, color: Colors.white),
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      _currentLesson.title,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontFamily: 'Poppins',
                        color: Colors.white,
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        shadows: [
                          Shadow(
                            blurRadius: 4,
                            color: Colors.black87,
                            offset: Offset(0, 1),
                          ),
                        ],
                      ),
                    ),
                  ),
                  PopupMenuButton<double>(
                    icon: const Icon(Icons.speed, color: Colors.white),
                    tooltip: 'Playback Speed',
                    onSelected: (speed) {
                      setState(() => _playbackSpeed = speed);
                      _youtubeController?.setPlaybackRate(speed);
                    },
                    itemBuilder: (context) => [
                      0.75,
                      1.0,
                      1.25,
                      1.5,
                      2.0,
                    ].map((s) {
                      return PopupMenuItem(
                        value: s,
                        child: Row(
                          children: [
                            if (_playbackSpeed == s)
                              const Icon(Icons.check,
                                  size: 16, color: AppColors.primary)
                            else
                              const SizedBox(width: 16),
                            const SizedBox(width: 8),
                            Text('${s}x',
                                style: const TextStyle(fontFamily: 'Poppins')),
                          ],
                        ),
                      );
                    }).toList(),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMockPlayerView() {
    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [Colors.black, Color(0xFF1A1A24)],
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
        ),
      ),
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                IconButton(
                  icon: const Icon(Icons.replay_10,
                      color: Colors.white, size: 28),
                  onPressed: () {
                    setState(() {
                      final newSec = _currentPosition.inSeconds - 10;
                      _currentPosition = Duration(seconds: newSec < 0 ? 0 : newSec);
                    });
                  },
                ),
                const SizedBox(width: 16),
                IconButton(
                  icon: Icon(
                    _isPlaying
                        ? Icons.pause_circle_filled
                        : Icons.play_circle_filled,
                    color: Colors.white,
                    size: 48,
                  ),
                  onPressed: () {
                    setState(() => _isPlaying = !_isPlaying);
                  },
                ),
                const SizedBox(width: 16),
                IconButton(
                  icon: const Icon(Icons.forward_10,
                      color: Colors.white, size: 28),
                  onPressed: () {
                    setState(() {
                      final newSec = _currentPosition.inSeconds + 10;
                      _currentPosition = Duration(
                          seconds: newSec > _totalDuration.inSeconds
                              ? _totalDuration.inSeconds
                              : newSec);
                    });
                  },
                ),
              ],
            ),
            const SizedBox(height: 8),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Row(
                children: [
                  Text(
                    _formatDuration(_currentPosition),
                    style: const TextStyle(
                        color: Colors.white70,
                        fontSize: 11,
                        fontFamily: 'Poppins'),
                  ),
                  Expanded(
                    child: Slider(
                      value: _currentPosition.inSeconds
                          .clamp(0, _totalDuration.inSeconds)
                          .toDouble(),
                      max: _totalDuration.inSeconds.toDouble(),
                      activeColor: AppColors.primary,
                      inactiveColor: Colors.white24,
                      onChanged: (val) {
                        setState(() {
                          _currentPosition = Duration(seconds: val.toInt());
                        });
                      },
                    ),
                  ),
                  Text(
                    _formatDuration(_totalDuration),
                    style: const TextStyle(
                        color: Colors.white70,
                        fontSize: 11,
                        fontFamily: 'Poppins'),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTabBar() {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(bottom: BorderSide(color: AppColors.border, width: 1)),
      ),
      child: TabBar(
        controller: _tabController,
        labelColor: AppColors.primary,
        unselectedLabelColor: AppColors.textSecondary,
        indicatorColor: AppColors.primary,
        labelStyle: const TextStyle(
          fontFamily: 'Poppins',
          fontSize: 13,
          fontWeight: FontWeight.w600,
        ),
        tabs: const [
          Tab(text: 'Overview'),
          Tab(text: 'Lessons'),
          Tab(text: 'Discussion'),
        ],
      ),
    );
  }

  Widget _buildOverviewTab() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text(
          _currentLesson.title,
          style: const TextStyle(
            fontFamily: 'Poppins',
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: AppColors.textPrimary,
          ),
        ),
        if (widget.course != null) ...[
          const SizedBox(height: 4),
          Text(
            widget.course!.title,
            style: const TextStyle(
              fontFamily: 'Poppins',
              fontSize: 13,
              fontWeight: FontWeight.w500,
              color: AppColors.primary,
            ),
          ),
        ],
        const SizedBox(height: 12),
        Row(
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: AppColors.primary.withAlpha(20),
                borderRadius: BorderRadius.circular(6),
              ),
              child: Row(
                children: [
                  const Icon(Icons.timer_outlined,
                      size: 14, color: AppColors.primary),
                  const SizedBox(width: 4),
                  Text(
                    '${_currentLesson.durationMinutes} minutes',
                    style: const TextStyle(
                      fontFamily: 'Poppins',
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: AppColors.primary,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 10),
            if (_currentLesson.isFreePreview)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.success.withAlpha(20),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: const Text(
                  'Free Preview',
                  style: TextStyle(
                    fontFamily: 'Poppins',
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: AppColors.success,
                  ),
                ),
              ),
          ],
        ),
        const Divider(height: 28),
        const Text(
          'Lesson Description & Highlights',
          style: TextStyle(
            fontFamily: 'Poppins',
            fontSize: 15,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          _currentLesson.description ??
              'Comprehensive lecture video covering theoretical principles, numerical problem-solving techniques, and high-yield questions for upcoming exams.',
          style: const TextStyle(
            fontFamily: 'Poppins',
            fontSize: 13,
            color: AppColors.textSecondary,
            height: 1.5,
          ),
        ),
        const SizedBox(height: 20),
        if (_currentLesson.pdfUrl != null &&
            _currentLesson.pdfUrl!.isNotEmpty) ...[
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.border),
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: AppColors.error.withAlpha(20),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(Icons.picture_as_pdf,
                      color: AppColors.error, size: 24),
                ),
                const SizedBox(width: 14),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Class Notes & Handouts (PDF)',
                        style: TextStyle(
                          fontFamily: 'Poppins',
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      Text(
                        'Download printable study notes',
                        style: TextStyle(
                          fontFamily: 'Poppins',
                          fontSize: 11,
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
                ElevatedButton(
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Opening printable class notes...'),
                        duration: Duration(seconds: 2),
                      ),
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    elevation: 0,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  child: const Text('Open'),
                ),
              ],
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildPlaylistTab() {
    final playlist = widget.playlist ?? [_currentLesson];

    return ListView.separated(
      padding: const EdgeInsets.symmetric(vertical: 8),
      itemCount: playlist.length,
      separatorBuilder: (_, __) => const Divider(height: 1),
      itemBuilder: (context, index) {
        final lesson = playlist[index];
        final isSelected = lesson.id == _currentLesson.id;

        return ListTile(
          selected: isSelected,
          selectedTileColor: AppColors.primary.withAlpha(15),
          leading: Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: isSelected
                  ? AppColors.primary
                  : AppColors.surface,
              shape: BoxShape.circle,
            ),
            child: Center(
              child: Icon(
                isSelected ? Icons.play_arrow : Icons.play_circle_outline,
                color: isSelected ? Colors.white : AppColors.textSecondary,
                size: 20,
              ),
            ),
          ),
          title: Text(
            '${index + 1}. ${lesson.title}',
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              fontFamily: 'Poppins',
              fontSize: 13,
              fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
              color: isSelected ? AppColors.primary : AppColors.textPrimary,
            ),
          ),
          subtitle: Row(
            children: [
              Text(
                '${lesson.durationMinutes} mins',
                style: const TextStyle(
                  fontFamily: 'Poppins',
                  fontSize: 11,
                  color: AppColors.textSecondary,
                ),
              ),
              if (lesson.isFreePreview) ...[
                const SizedBox(width: 8),
                const Text(
                  '• Free Preview',
                  style: TextStyle(
                    fontFamily: 'Poppins',
                    fontSize: 11,
                    color: AppColors.success,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ],
          ),
          trailing: isSelected
              ? const Icon(Icons.equalizer, color: AppColors.primary)
              : null,
          onTap: () => _switchLesson(lesson),
        );
      },
    );
  }

  Widget _buildCommentsTab() {
    return Column(
      children: [
        Expanded(
          child: _comments.isEmpty
              ? const Center(
                  child: Text(
                    'No questions yet. Be the first to ask!',
                    style: TextStyle(
                      fontFamily: 'Poppins',
                      fontSize: 13,
                      color: AppColors.textSecondary,
                    ),
                  ),
                )
              : ListView.separated(
                  padding: const EdgeInsets.all(14),
                  itemCount: _comments.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 12),
                  itemBuilder: (context, index) {
                    final item = _comments[index];
                    final isFaculty = item.studentName.contains('Faculty');
                    return Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: isFaculty
                            ? AppColors.primary.withAlpha(12)
                            : AppColors.surface,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(
                          color: isFaculty
                              ? AppColors.primary.withAlpha(60)
                              : AppColors.border,
                        ),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                item.studentName,
                                style: TextStyle(
                                  fontFamily: 'Poppins',
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                  color: isFaculty
                                      ? AppColors.primary
                                      : AppColors.textPrimary,
                                ),
                              ),
                              if (isFaculty)
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 6, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: AppColors.primary,
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                  child: const Text(
                                    'Faculty',
                                    style: TextStyle(
                                      fontSize: 9,
                                      fontWeight: FontWeight.bold,
                                      color: Colors.white,
                                    ),
                                  ),
                                ),
                            ],
                          ),
                          const SizedBox(height: 4),
                          Text(
                            item.comment,
                            style: const TextStyle(
                              fontFamily: 'Poppins',
                              fontSize: 12,
                              color: AppColors.textPrimary,
                            ),
                          ),
                        ],
                      ),
                    );
                  },
                ),
        ),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          decoration: const BoxDecoration(
            color: Colors.white,
            border: Border(top: BorderSide(color: AppColors.border)),
          ),
          child: Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _commentController,
                  decoration: InputDecoration(
                    hintText: 'Ask a doubt or question...',
                    hintStyle: const TextStyle(
                      fontFamily: 'Poppins',
                      fontSize: 12,
                      color: AppColors.textSecondary,
                    ),
                    contentPadding: const EdgeInsets.symmetric(
                        horizontal: 14, vertical: 10),
                    filled: true,
                    fillColor: AppColors.surface,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(20),
                      borderSide: BorderSide.none,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              IconButton(
                icon: const Icon(Icons.send_rounded, color: AppColors.primary),
                onPressed: () {
                  final text = _commentController.text.trim();
                  if (text.isEmpty) return;
                  final auth =
                      Provider.of<AuthProvider>(context, listen: false);
                  setState(() {
                    _comments.insert(
                      0,
                      VideoComment(
                        id: DateTime.now().millisecondsSinceEpoch,
                        lessonId: _currentLesson.id,
                        studentId: auth.currentUser?.id ?? 1,
                        studentName: auth.currentUser?.name ?? 'Student',
                        comment: text,
                        createdAt: DateTime.now(),
                      ),
                    );
                    _commentController.clear();
                  });
                },
              ),
            ],
          ),
        ),
      ],
    );
  }

  String _formatDuration(Duration d) {
    final minutes = d.inMinutes;
    final seconds = d.inSeconds % 60;
    return '${minutes.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}';
  }
}
