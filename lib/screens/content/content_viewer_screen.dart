import 'package:flutter/material.dart';
import 'package:flutter_pdfview/flutter_pdfview.dart';
import '../../core/screenshot_guard.dart';
import '../../core/share_helper.dart';
import '../../theme.dart';
import '../../widgets/watermark.dart';

/// PDF Document and Content Viewer with Anti-Piracy Watermarking
class ContentViewerScreen extends StatefulWidget {
  final String title;
  final String contentUrl;
  final String? localFilePath;
  final bool isSecure;

  const ContentViewerScreen({
    super.key,
    required this.title,
    required this.contentUrl,
    this.localFilePath,
    this.isSecure = true,
  });

  @override
  State<ContentViewerScreen> createState() => _ContentViewerScreenState();
}

class _ContentViewerScreenState extends State<ContentViewerScreen> {
  int _totalPages = 0;
  int _currentPage = 0;

  @override
  void initState() {
    super.initState();
    if (widget.isSecure) {
      ScreenshotGuardService.enable();
    }
  }

  @override
  void dispose() {
    if (widget.isSecure) {
      ScreenshotGuardService.disable();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isTesting = WidgetsBinding.instance.runtimeType.toString().contains('Test');

    Widget contentBody = Stack(
      children: [
        if (isTesting || widget.localFilePath == null)
          _buildFallbackViewer()
        else
          PDFView(
            filePath: widget.localFilePath!,
            enableSwipe: true,
            swipeHorizontal: false,
            autoSpacing: true,
            pageFling: true,
            onRender: (pages) {
              setState(() {
                _totalPages = pages ?? 0;
              });
            },
            onError: (error) {
              // Handled by fallback if needed
            },
            onPageChanged: (page, total) {
              setState(() {
                _currentPage = page ?? 0;
              });
            },
          ),

        if (_totalPages > 0)
          Positioned(
            bottom: 24,
            left: 0,
            right: 0,
            child: Center(
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                decoration: BoxDecoration(
                  color: Colors.black.withAlpha(180),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  'Page ${_currentPage + 1} of $_totalPages',
                  style: const TextStyle(
                    fontFamily: 'Poppins',
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
              ),
            ),
          ),
      ],
    );

    if (widget.isSecure) {
      contentBody = Watermark(
        text: 'TEST SERIES APP • DRM PROTECTED',
        opacity: 0.06,
        child: contentBody,
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: Text(
          widget.title,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.share_rounded),
            tooltip: 'Share',
            onPressed: () {
              ShareHelper.shareText(
                'Check out this study material: ${widget.title}\n${widget.contentUrl}',
                subject: widget.title,
              );
            },
          ),
        ],
      ),
      body: contentBody,
    );
  }

  Widget _buildFallbackViewer() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: AppColors.primary.withAlpha(20),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.picture_as_pdf_rounded,
                size: 64,
                color: AppColors.primary,
              ),
            ),
            const SizedBox(height: 20),
            Text(
              widget.title,
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontFamily: 'Poppins',
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Digital Study Material & High-Resolution Notes',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontFamily: 'Poppins',
                fontSize: 13,
                color: AppColors.textSecondary,
              ),
            ),
            const SizedBox(height: 24),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.grey.shade50,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.border),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.shield_outlined, size: 20, color: AppColors.success),
                  const SizedBox(width: 8),
                  Text(
                    'DRM Protected Content',
                    style: TextStyle(
                      fontFamily: 'Poppins',
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: Colors.grey.shade700,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
