import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';

class SkeletonBox extends StatelessWidget {
  final double width;
  final double height;
  final double borderRadius;
  final EdgeInsetsGeometry? margin;

  const SkeletonBox({
    super.key,
    required this.width,
    required this.height,
    this.borderRadius = 8,
    this.margin,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: width,
      height: height,
      margin: margin,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(borderRadius),
      ),
    );
  }
}

class SkeletonCircle extends StatelessWidget {
  final double size;
  final EdgeInsetsGeometry? margin;

  const SkeletonCircle({
    super.key,
    required this.size,
    this.margin,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      margin: margin,
      decoration: const BoxDecoration(
        color: Colors.white,
        shape: BoxShape.circle,
      ),
    );
  }
}

class SkeletonLoading extends StatelessWidget {
  final Widget child;

  const SkeletonLoading({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    final isTesting =
        WidgetsBinding.instance.runtimeType.toString().contains('Test');
    if (isTesting) {
      return child;
    }
    return Shimmer.fromColors(
      baseColor: Colors.grey.shade300,
      highlightColor: Colors.grey.shade100,
      child: child,
    );
  }
}

class SkeletonBanner extends StatelessWidget {
  final double height;

  const SkeletonBanner({super.key, this.height = 160});

  @override
  Widget build(BuildContext context) {
    return SkeletonLoading(
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        height: height,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
        ),
      ),
    );
  }
}

class SkeletonCard extends StatelessWidget {
  final double height;

  const SkeletonCard({super.key, this.height = 120});

  @override
  Widget build(BuildContext context) {
    return SkeletonLoading(
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        height: height,
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
        ),
        child: Row(
          children: [
            const SkeletonBox(width: 90, height: 90, borderRadius: 10),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: const [
                  SkeletonBox(width: double.infinity, height: 16, borderRadius: 4),
                  SizedBox(height: 8),
                  SkeletonBox(width: 140, height: 14, borderRadius: 4),
                  SizedBox(height: 12),
                  SkeletonBox(width: 80, height: 14, borderRadius: 4),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class SkeletonListTile extends StatelessWidget {
  const SkeletonListTile({super.key});

  @override
  Widget build(BuildContext context) {
    return SkeletonLoading(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        child: Row(
          children: [
            const SkeletonCircle(size: 46),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: const [
                  SkeletonBox(width: double.infinity, height: 14, borderRadius: 4),
                  SizedBox(height: 6),
                  SkeletonBox(width: 180, height: 12, borderRadius: 4),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class SkeletonQuizQuestion extends StatelessWidget {
  const SkeletonQuizQuestion({super.key});

  @override
  Widget build(BuildContext context) {
    return SkeletonLoading(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SkeletonBox(width: 100, height: 20, borderRadius: 4),
            const SizedBox(height: 12),
            const SkeletonBox(width: double.infinity, height: 16, borderRadius: 4),
            const SizedBox(height: 8),
            const SkeletonBox(width: double.infinity, height: 16, borderRadius: 4),
            const SizedBox(height: 8),
            const SkeletonBox(width: 220, height: 16, borderRadius: 4),
            const SizedBox(height: 24),
            ...List.generate(
              4,
              (index) => Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: Container(
                  height: 52,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class SkeletonList extends StatelessWidget {
  final int count;
  final Widget Function(BuildContext, int)? itemBuilder;
  final EdgeInsetsGeometry? padding;

  const SkeletonList({
    super.key,
    this.count = 4,
    this.itemBuilder,
    this.padding,
  });

  @override
  Widget build(BuildContext context) {
    if (itemBuilder != null) {
      return ListView.builder(
        padding: padding ?? EdgeInsets.zero,
        itemCount: count,
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        itemBuilder: itemBuilder!,
      );
    }
    return SingleChildScrollView(
      physics: const NeverScrollableScrollPhysics(),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: List.generate(count, (index) => const SkeletonCard()),
      ),
    );
  }
}

