import 'dart:math' as math;
import 'package:flutter/material.dart';

class Watermark extends StatelessWidget {
  final Widget child;
  final String text;
  final double opacity;
  final double fontSize;
  final Color textColor;
  final double angle;

  const Watermark({
    super.key,
    required this.child,
    required this.text,
    this.opacity = 0.08,
    this.fontSize = 14,
    this.textColor = Colors.black,
    this.angle = -math.pi / 6, // -30 degrees
  });

  @override
  Widget build(BuildContext context) {
    if (text.isEmpty) return child;

    return Stack(
      children: [
        child,
        Positioned.fill(
          child: IgnorePointer(
            child: CustomPaint(
              painter: _WatermarkPainter(
                text: text,
                opacity: opacity,
                fontSize: fontSize,
                color: textColor,
                angle: angle,
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class _WatermarkPainter extends CustomPainter {
  final String text;
  final double opacity;
  final double fontSize;
  final Color color;
  final double angle;

  _WatermarkPainter({
    required this.text,
    required this.opacity,
    required this.fontSize,
    required this.color,
    required this.angle,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final textStyle = TextStyle(
      color: color.withAlpha((opacity * 255).round()),
      fontSize: fontSize,
      fontWeight: FontWeight.w600,
      letterSpacing: 1.2,
    );

    final textSpan = TextSpan(text: text, style: textStyle);
    final textPainter = TextPainter(
      text: textSpan,
      textDirection: TextDirection.ltr,
    )..layout();

    final textWidth = textPainter.width;
    final textHeight = textPainter.height;

    const double stepX = 220.0;
    const double stepY = 160.0;

    for (double x = -100; x < size.width + 200; x += stepX) {
      for (double y = -100; y < size.height + 200; y += stepY) {
        canvas.save();
        canvas.translate(x, y);
        canvas.rotate(angle);
        textPainter.paint(canvas, Offset(-textWidth / 2, -textHeight / 2));
        canvas.restore();
      }
    }
  }

  @override
  bool shouldRepaint(covariant _WatermarkPainter oldDelegate) {
    return oldDelegate.text != text ||
        oldDelegate.opacity != opacity ||
        oldDelegate.fontSize != fontSize ||
        oldDelegate.color != color ||
        oldDelegate.angle != angle;
  }
}
