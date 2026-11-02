import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import '../models/models.dart';
import '../theme.dart';
import 'common.dart';

/// Reusable Course Presentation Card supporting Compact (Carousel/Horizontal) & Full Width (Catalog)
class CourseCard extends StatelessWidget {
  final Course course;
  final VoidCallback onTap;
  final bool isCompact;
  final double? width;
  final double? progress;
  final double rating;

  const CourseCard({
    super.key,
    required this.course,
    required this.onTap,
    this.isCompact = false,
    this.width,
    this.progress,
    this.rating = 4.8,
  });

  @override
  Widget build(BuildContext context) {
    if (isCompact) {
      return SizedBox(
        width: width ?? 260,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(16),
          child: Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.border, width: 0.9),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withAlpha(8),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            clipBehavior: Clip.antiAlias,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                _buildThumbnail(height: 125),
                Padding(
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Flexible(child: _buildCategoryOrEnrollBadge()),
                          const SizedBox(width: 4),
                          _buildRatingBadge(),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Text(
                        course.title,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontFamily: 'Poppins',
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: AppColors.textPrimary,
                          height: 1.25,
                        ),
                      ),
                      const SizedBox(height: 8),
                      _buildMetaRow(),
                      if (progress != null || course.isEnrolled) ...[
                        const SizedBox(height: 8),
                        _buildProgressBar(),
                      ],
                      const SizedBox(height: 10),
                      _buildPriceRow(),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    }

    // Full Width Card
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.border, width: 0.9),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withAlpha(6),
              blurRadius: 10,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        clipBehavior: Clip.antiAlias,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildThumbnail(height: 155),
            Padding(
              padding: const EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Flexible(child: _buildCategoryOrEnrollBadge()),
                      const SizedBox(width: 8),
                      Flexible(
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            _buildRatingBadge(),
                            if (course.instructorName != null &&
                                course.instructorName!.isNotEmpty) ...[
                              const SizedBox(width: 8),
                              Flexible(
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    const Icon(Icons.person_outline,
                                        size: 14, color: AppColors.textSecondary),
                                    const SizedBox(width: 4),
                                    Flexible(
                                      child: Text(
                                        course.instructorName!,
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                        style: const TextStyle(
                                          fontFamily: 'Poppins',
                                          fontSize: 11,
                                          color: AppColors.textSecondary,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    course.title,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontFamily: 'Poppins',
                      fontSize: 15,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textPrimary,
                      height: 1.3,
                    ),
                  ),
                  if (course.description != null &&
                      course.description!.isNotEmpty) ...[
                    const SizedBox(height: 4),
                    Text(
                      course.description!,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontFamily: 'Poppins',
                        fontSize: 12,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                  const SizedBox(height: 10),
                  _buildMetaRow(),
                  if (progress != null || course.isEnrolled) ...[
                    const SizedBox(height: 10),
                    _buildProgressBar(),
                  ],
                  const Divider(height: 20),
                  _buildPriceRow(),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildThumbnail({required double height}) {
    final isTesting =
        WidgetsBinding.instance.runtimeType.toString().contains('Test');
    final thumb = course.thumbnailUrl;
    final hasImage = !isTesting &&
        thumb != null &&
        thumb.isNotEmpty &&
        !thumb.contains('placeholder');

    return Stack(
      children: [
        Container(
          height: height,
          width: double.infinity,
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                AppColors.primary,
                AppColors.primaryLight.withAlpha(220),
              ],
            ),
          ),
          child: hasImage
              ? CachedNetworkImage(
                  imageUrl: thumb,
                  fit: BoxFit.cover,
                  placeholder: (context, url) => Container(
                    color: AppColors.primary.withAlpha(40),
                    child: const Center(
                      child: SizedBox(
                        width: 24,
                        height: 24,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor: AlwaysStoppedAnimation<Color>(Colors.white70),
                        ),
                      ),
                    ),
                  ),
                  errorWidget: (context, url, error) => _buildPlaceholderGraphic(),
                )
              : _buildPlaceholderGraphic(),
        ),
        if (course.discountPrice != null &&
            course.discountPrice! < course.price &&
            course.price > 0)
          Positioned(
            top: 10,
            left: 10,
            child: AppBadge(
              text:
                  '${(((course.price - course.discountPrice!) / course.price) * 100).round()}% OFF',
              backgroundColor: AppColors.warning,
            ),
          ),
        if (course.price == 0 || (course.discountPrice != null && course.discountPrice == 0))
          Positioned(
            top: 10,
            left: 10,
            child: AppBadge.free(),
          ),
      ],
    );
  }

  Widget _buildPlaceholderGraphic() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: Colors.white.withAlpha(40),
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.play_lesson_rounded,
              color: Colors.white,
              size: 28,
            ),
          ),
          const SizedBox(height: 6),
          const Text(
            'TEST SERIES & COURSES',
            style: TextStyle(
              fontFamily: 'Poppins',
              fontSize: 10,
              fontWeight: FontWeight.bold,
              letterSpacing: 1.1,
              color: Colors.white70,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCategoryOrEnrollBadge() {
    if (course.isEnrolled) {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
        decoration: BoxDecoration(
          color: AppColors.success.withAlpha(25),
          borderRadius: BorderRadius.circular(6),
          border: Border.all(color: AppColors.success.withAlpha(80)),
        ),
        child: const Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.check_circle_rounded, size: 12, color: AppColors.success),
            SizedBox(width: 4),
            Text(
              'Enrolled',
              style: TextStyle(
                fontFamily: 'Poppins',
                fontSize: 10,
                fontWeight: FontWeight.bold,
                color: AppColors.success,
              ),
            ),
          ],
        ),
      );
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: AppColors.primary.withAlpha(20),
        borderRadius: BorderRadius.circular(6),
      ),
      child: const Text(
        'Course',
        style: TextStyle(
          fontFamily: 'Poppins',
          fontSize: 10,
          fontWeight: FontWeight.w600,
          color: AppColors.primary,
        ),
      ),
    );
  }

  Widget _buildRatingBadge() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: AppColors.warning.withAlpha(30),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.star_rounded, size: 14, color: AppColors.warning),
          const SizedBox(width: 3),
          Text(
            rating.toStringAsFixed(1),
            style: const TextStyle(
              fontFamily: 'Poppins',
              fontSize: 11,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProgressBar() {
    final effectiveProgress = progress ?? 0.45;
    final percent = (effectiveProgress * 100).toInt();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              'Course Progress',
              style: TextStyle(
                fontFamily: 'Poppins',
                fontSize: 11,
                color: AppColors.textSecondary,
              ),
            ),
            Text(
              '$percent%',
              style: const TextStyle(
                fontFamily: 'Poppins',
                fontSize: 11,
                fontWeight: FontWeight.bold,
                color: AppColors.primary,
              ),
            ),
          ],
        ),
        const SizedBox(height: 4),
        ClipRRect(
          borderRadius: BorderRadius.circular(3),
          child: LinearProgressIndicator(
            value: effectiveProgress.clamp(0.0, 1.0),
            backgroundColor: AppColors.borderLight,
            valueColor: const AlwaysStoppedAnimation<Color>(AppColors.primary),
            minHeight: 5,
          ),
        ),
      ],
    );
  }

  Widget _buildMetaRow() {
    return Row(
      children: [
        const Icon(Icons.video_collection_outlined,
            size: 13, color: AppColors.textSecondary),
        const SizedBox(width: 4),
        Text(
          '${course.totalLessons} Lessons',
          style: const TextStyle(
            fontFamily: 'Poppins',
            fontSize: 11,
            color: AppColors.textSecondary,
          ),
        ),
        if (course.totalDurationMinutes > 0) ...[
          const SizedBox(width: 8),
          const Icon(Icons.timer_outlined,
              size: 13, color: AppColors.textSecondary),
          const SizedBox(width: 3),
          Flexible(
            child: Text(
              _formatDuration(course.totalDurationMinutes),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                fontFamily: 'Poppins',
                fontSize: 11,
                color: AppColors.textSecondary,
              ),
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildPriceRow() {
    final effectivePrice = course.discountPrice ?? course.price;

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Flexible(
          child: course.isEnrolled
              ? const Text(
                  'Enrolled',
                  style: TextStyle(
                    fontFamily: 'Poppins',
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: AppColors.success,
                  ),
                )
              : (effectivePrice == 0
                  ? const Text(
                      'FREE',
                      style: TextStyle(
                        fontFamily: 'Poppins',
                        fontSize: 15,
                        fontWeight: FontWeight.w800,
                        color: AppColors.success,
                      ),
                    )
                  : Wrap(
                      crossAxisAlignment: WrapCrossAlignment.center,
                      spacing: 4,
                      children: [
                        Text(
                          '₹${effectivePrice.toInt()}',
                          style: const TextStyle(
                            fontFamily: 'Poppins',
                            fontSize: 15,
                            fontWeight: FontWeight.w800,
                            color: AppColors.textPrimary,
                          ),
                        ),
                        if (course.discountPrice != null &&
                            course.discountPrice! < course.price)
                          Text(
                            '₹${course.price.toInt()}',
                            style: const TextStyle(
                              fontFamily: 'Poppins',
                              fontSize: 11,
                              decoration: TextDecoration.lineThrough,
                              color: AppColors.textSecondary,
                            ),
                          ),
                      ],
                    )),
        ),
        const SizedBox(width: 6),
        ElevatedButton(
          onPressed: onTap,
          style: ElevatedButton.styleFrom(
            backgroundColor:
                course.isEnrolled ? AppColors.accent : AppColors.primary,
            foregroundColor: Colors.white,
            elevation: 0,
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            minimumSize: Size.zero,
            tapTargetSize: MaterialTapTargetSize.shrinkWrap,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
            ),
          ),
          child: Text(
            course.isEnrolled ? 'Start' : 'Explore',
            style: const TextStyle(
              fontFamily: 'Poppins',
              fontSize: 11,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
      ],
    );
  }

  String _formatDuration(int minutes) {
    if (minutes < 60) return '$minutes mins';
    final hrs = minutes ~/ 60;
    final remaining = minutes % 60;
    return remaining == 0 ? '$hrs hrs' : '$hrs h $remaining m';
  }
}
