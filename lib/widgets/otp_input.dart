import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../theme.dart';

/// 6-digit OTP / PIN input widget with auto-advance, backspace handling,
/// and built-in resend countdown timer.
class OtpInputWidget extends StatefulWidget {
  final int length;
  final ValueChanged<String>? onCompleted;
  final ValueChanged<String>? onChanged;
  final Future<void> Function()? onResend;
  final int resendTimeoutSeconds;
  final bool autoFocus;

  const OtpInputWidget({
    super.key,
    this.length = 6,
    this.onCompleted,
    this.onChanged,
    this.onResend,
    this.resendTimeoutSeconds = 30,
    this.autoFocus = true,
  });

  @override
  State<OtpInputWidget> createState() => _OtpInputWidgetState();
}

class _OtpInputWidgetState extends State<OtpInputWidget> {
  late final List<TextEditingController> _controllers;
  late final List<FocusNode> _focusNodes;
  int _secondsRemaining = 0;
  Timer? _timer;
  bool _isResending = false;

  @override
  void initState() {
    super.initState();
    _controllers = List.generate(widget.length, (_) => TextEditingController());
    _focusNodes = List.generate(widget.length, (_) => FocusNode());
    _startResendTimer();
  }

  void _startResendTimer() {
    _timer?.cancel();
    setState(() {
      _secondsRemaining = widget.resendTimeoutSeconds;
    });

    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) return;
      if (_secondsRemaining > 0) {
        setState(() {
          _secondsRemaining--;
        });
      } else {
        timer.cancel();
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    for (final c in _controllers) {
      c.dispose();
    }
    for (final f in _focusNodes) {
      f.dispose();
    }
    super.dispose();
  }

  String get _currentPin => _controllers.map((c) => c.text).join();

  void _handleChanged(int index, String value) {
    if (value.isNotEmpty) {
      // If user pasted multiple characters
      if (value.length > 1) {
        final chars = value.split('');
        for (int i = 0; i < chars.length && (index + i) < widget.length; i++) {
          _controllers[index + i].text = chars[i];
        }
        final nextIndex = (index + chars.length).clamp(0, widget.length - 1);
        _focusNodes[nextIndex].requestFocus();
      } else {
        _controllers[index].text = value.substring(value.length - 1);
        if (index < widget.length - 1) {
          _focusNodes[index + 1].requestFocus();
        } else {
          _focusNodes[index].unfocus();
        }
      }
    }

    final pin = _currentPin;
    widget.onChanged?.call(pin);
    if (pin.length == widget.length) {
      widget.onCompleted?.call(pin);
    }
  }

  void _handleKeyEvent(int index, KeyEvent event) {
    if (event is KeyDownEvent &&
        event.logicalKey == LogicalKeyboardKey.backspace) {
      if (_controllers[index].text.isEmpty && index > 0) {
        _focusNodes[index - 1].requestFocus();
        _controllers[index - 1].clear();
        final pin = _currentPin;
        widget.onChanged?.call(pin);
      }
    }
  }

  Future<void> _handleResend() async {
    if (_secondsRemaining > 0 || _isResending || widget.onResend == null) return;

    setState(() {
      _isResending = true;
    });

    try {
      await widget.onResend!();
      _startResendTimer();
    } finally {
      if (mounted) {
        setState(() {
          _isResending = false;
        });
      }
    }
  }

  void clear() {
    for (final c in _controllers) {
      c.clear();
    }
    if (_focusNodes.isNotEmpty) {
      _focusNodes.first.requestFocus();
    }
    widget.onChanged?.call('');
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: List.generate(widget.length, (index) {
            return SizedBox(
              width: 44,
              height: 52,
              child: KeyboardListener(
                focusNode: FocusNode(),
                onKeyEvent: (event) => _handleKeyEvent(index, event),
                child: TextField(
                  controller: _controllers[index],
                  focusNode: _focusNodes[index],
                  autofocus: widget.autoFocus && index == 0,
                  keyboardType: TextInputType.number,
                  textAlign: TextAlign.center,
                  maxLength: 1,
                  style: const TextStyle(
                    fontFamily: 'Poppins',
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
                  inputFormatters: [
                    FilteringTextInputFormatter.digitsOnly,
                  ],
                  decoration: InputDecoration(
                    counterText: '',
                    contentPadding: EdgeInsets.zero,
                    fillColor: Colors.white,
                    filled: true,
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10),
                      borderSide: const BorderSide(
                        color: AppColors.border,
                        width: 1.2,
                      ),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10),
                      borderSide: const BorderSide(
                        color: AppColors.primary,
                        width: 2,
                      ),
                    ),
                  ),
                  onChanged: (val) => _handleChanged(index, val),
                ),
              ),
            );
          }),
        ),
        const SizedBox(height: 16),
        // Timer / Resend Row
        Wrap(
          alignment: WrapAlignment.center,
          crossAxisAlignment: WrapCrossAlignment.center,
          children: [
            const Text(
              "Didn't receive code? ",
              style: TextStyle(
                fontFamily: 'Poppins',
                fontSize: 13,
                color: AppColors.textSecondary,
              ),
            ),
            if (_secondsRemaining > 0)
              Text(
                'Resend in ${_secondsRemaining}s',
                style: const TextStyle(
                  fontFamily: 'Poppins',
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: AppColors.primary,
                ),
              )
            else
              InkWell(
                onTap: _isResending ? null : _handleResend,
                borderRadius: BorderRadius.circular(4),
                child: Padding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 4,
                    vertical: 2,
                  ),
                  child: _isResending
                      ? const SizedBox(
                          width: 14,
                          height: 14,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Text(
                          'Resend OTP',
                          style: TextStyle(
                            fontFamily: 'Poppins',
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: AppColors.primary,
                            decoration: TextDecoration.underline,
                          ),
                        ),
                ),
              ),
          ],
        ),
      ],
    );
  }
}
