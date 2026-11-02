import 'dart:io' show Platform;
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

/// Service and widget for preventing screen recording and screenshots
/// on sensitive content (CBT tests, video lessons, protected PDFs)
/// via Android FLAG_SECURE window flags.
class ScreenshotGuardService {
  static const MethodChannel _channel = MethodChannel('webphiser.com.test.series/security');
  static bool _isEnabled = false;

  static bool get isEnabled => _isEnabled;

  /// Enables screenshot and screen recording protection (Android only).
  /// Safe no-op on iOS/Desktop/Web.
  static Future<bool> enable() async {
    if (kIsWeb) return true;
    try {
      if (Platform.isAndroid) {
        final result = await _channel.invokeMethod<bool>('enableSecure');
        _isEnabled = true;
        return result ?? true;
      }
    } catch (e) {
      debugPrint('ScreenshotGuardService.enable error: $e');
    }
    return true;
  }

  /// Disables screenshot and screen recording protection (Android only).
  static Future<bool> disable() async {
    if (kIsWeb) return true;
    try {
      if (Platform.isAndroid) {
        final result = await _channel.invokeMethod<bool>('disableSecure');
        _isEnabled = false;
        return result ?? true;
      }
    } catch (e) {
      debugPrint('ScreenshotGuardService.disable error: $e');
    }
    return true;
  }
}

/// Widget wrapper that enables FLAG_SECURE on mount and restores on unmount.
class ScreenshotGuard extends StatefulWidget {
  final Widget child;
  final bool enabled;

  const ScreenshotGuard({
    super.key,
    required this.child,
    this.enabled = true,
  });

  /// Static helper delegates
  static Future<bool> enable() => ScreenshotGuardService.enable();
  static Future<bool> disable() => ScreenshotGuardService.disable();

  @override
  State<ScreenshotGuard> createState() => _ScreenshotGuardState();
}

class _ScreenshotGuardState extends State<ScreenshotGuard> {
  @override
  void initState() {
    super.initState();
    if (widget.enabled) {
      ScreenshotGuardService.enable();
    }
  }

  @override
  void didUpdateWidget(covariant ScreenshotGuard oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.enabled != oldWidget.enabled) {
      if (widget.enabled) {
        ScreenshotGuardService.enable();
      } else {
        ScreenshotGuardService.disable();
      }
    }
  }

  @override
  void dispose() {
    if (widget.enabled) {
      ScreenshotGuardService.disable();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return widget.child;
  }
}

/// Mixin for stateful screen widgets to protect during their lifecycle.
mixin ScreenshotGuardMixin<T extends StatefulWidget> on State<T> {
  @override
  void initState() {
    super.initState();
    ScreenshotGuardService.enable();
  }

  @override
  void dispose() {
    ScreenshotGuardService.disable();
    super.dispose();
  }
}
