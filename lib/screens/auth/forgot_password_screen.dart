import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../state/auth_provider.dart';
import '../../theme.dart';
import '../../widgets/auth_scaffold.dart';
import '../../widgets/common.dart';
import '../../widgets/otp_input.dart';

enum ForgotPasswordStep {
  phoneInput,
  otpVerification,
  newPassword,
}

/// 3-step Password Recovery Screen:
/// 1. Enter phone number
/// 2. Enter 6-digit OTP code received via SMS
/// 3. Enter and confirm new password
class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  ForgotPasswordStep _currentStep = ForgotPasswordStep.phoneInput;

  final _phoneFormKey = GlobalKey<FormState>();
  final _passwordFormKey = GlobalKey<FormState>();

  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  String _enteredOtp = '';
  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;
  bool _isLoading = false;

  @override
  void dispose() {
    _phoneController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  Future<void> _handleSendOtp() async {
    if (!_phoneFormKey.currentState!.validate()) return;

    FocusScope.of(context).unfocus();
    setState(() {
      _isLoading = true;
    });

    final authProvider = context.read<AuthProvider>();
    final phone = _phoneController.text.trim();
    final success = await authProvider.forgotPassword(phone);

    if (!mounted) return;
    setState(() {
      _isLoading = false;
    });

    if (success) {
      setState(() {
        _currentStep = ForgotPasswordStep.otpVerification;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Verification code sent to your phone'),
          backgroundColor: AppColors.success,
          behavior: SnackBarBehavior.floating,
        ),
      );
    } else {
      final error = authProvider.errorMessage ?? 'Failed to send OTP. Try again.';
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(error),
          backgroundColor: AppColors.error,
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  void _handleOtpCompleted(String pin) {
    setState(() {
      _enteredOtp = pin;
    });
  }

  Future<void> _handleResetPassword() async {
    if (!_passwordFormKey.currentState!.validate()) return;

    FocusScope.of(context).unfocus();
    setState(() {
      _isLoading = true;
    });

    final authProvider = context.read<AuthProvider>();
    final phone = _phoneController.text.trim();
    final newPassword = _passwordController.text;

    final success = await authProvider.resetPassword(phone, _enteredOtp, newPassword);

    if (!mounted) return;
    setState(() {
      _isLoading = false;
    });

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Password reset successfully! Please sign in with your new password.'),
          backgroundColor: AppColors.success,
          behavior: SnackBarBehavior.floating,
        ),
      );
      if (GoRouter.maybeOf(context) != null) {
        context.go('/login');
      }
    } else {
      final error = authProvider.errorMessage ?? 'Failed to reset password. Please try again.';
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(error),
          backgroundColor: AppColors.error,
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  void _onBackPressed() {
    if (_currentStep == ForgotPasswordStep.newPassword) {
      setState(() {
        _currentStep = ForgotPasswordStep.otpVerification;
      });
    } else if (_currentStep == ForgotPasswordStep.otpVerification) {
      setState(() {
        _currentStep = ForgotPasswordStep.phoneInput;
      });
    } else {
      if (GoRouter.maybeOf(context) != null) {
        context.go('/login');
      } else if (Navigator.of(context).canPop()) {
        Navigator.of(context).pop();
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    String title;
    String subtitle;

    switch (_currentStep) {
      case ForgotPasswordStep.phoneInput:
        title = 'Forgot Password';
        subtitle = 'Enter your registered phone number to receive a verification OTP';
        break;
      case ForgotPasswordStep.otpVerification:
        title = 'Enter Verification Code';
        subtitle = 'We sent a 6-digit code to ${_phoneController.text.trim()}';
        break;
      case ForgotPasswordStep.newPassword:
        title = 'Set New Password';
        subtitle = 'Create a secure new password for your account';
        break;
    }

    return AuthScaffold(
      title: title,
      subtitle: subtitle,
      showBackButton: true,
      onBackPressed: _onBackPressed,
      bottomAction: Wrap(
        alignment: WrapAlignment.center,
        crossAxisAlignment: WrapCrossAlignment.center,
        children: [
          const Text(
            'Remember your password? ',
            style: TextStyle(
              fontFamily: 'Poppins',
              fontSize: 14,
              color: AppColors.textSecondary,
            ),
          ),
          InkWell(
            onTap: () {
              if (GoRouter.maybeOf(context) != null) {
                context.go('/login');
              }
            },
            borderRadius: BorderRadius.circular(4),
            child: const Padding(
              padding: EdgeInsets.symmetric(horizontal: 4, vertical: 2),
              child: Text(
                'Sign In',
                style: TextStyle(
                  fontFamily: 'Poppins',
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: AppColors.primary,
                ),
              ),
            ),
          ),
        ],
      ),
      child: _buildCurrentStep(),
    );
  }

  Widget _buildCurrentStep() {
    switch (_currentStep) {
      case ForgotPasswordStep.phoneInput:
        return Form(
          key: _phoneFormKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              TextFormField(
                key: const Key('forgot_phone_input'),
                controller: _phoneController,
                keyboardType: TextInputType.phone,
                textInputAction: TextInputAction.done,
                onFieldSubmitted: (_) => _handleSendOtp(),
                decoration: const InputDecoration(
                  labelText: 'Phone Number',
                  hintText: '10-digit registered number',
                  prefixIcon: Icon(Icons.phone_outlined, color: AppColors.primary),
                ),
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'Please enter your phone number';
                  }
                  if (value.trim().length < 10) {
                    return 'Please enter a valid 10-digit number';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 24),
              PrimaryButton(
                key: const Key('send_otp_button'),
                text: 'Send OTP',
                isLoading: _isLoading,
                onPressed: _handleSendOtp,
              ),
            ],
          ),
        );

      case ForgotPasswordStep.otpVerification:
        return Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            OtpInputWidget(
              key: const Key('forgot_otp_input'),
              length: 6,
              onCompleted: _handleOtpCompleted,
              onChanged: (val) => _enteredOtp = val,
              onResend: () async {
                final authProvider = context.read<AuthProvider>();
                await authProvider.forgotPassword(_phoneController.text.trim());
              },
            ),
            const SizedBox(height: 24),
            PrimaryButton(
              key: const Key('verify_otp_button'),
              text: 'Verify & Continue',
              isLoading: _isLoading,
              onPressed: () {
                if (_enteredOtp.length == 6) {
                  setState(() {
                    _currentStep = ForgotPasswordStep.newPassword;
                  });
                } else {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Please enter all 6 digits of the OTP'),
                      backgroundColor: AppColors.error,
                      behavior: SnackBarBehavior.floating,
                    ),
                  );
                }
              },
            ),
          ],
        );

      case ForgotPasswordStep.newPassword:
        return Form(
          key: _passwordFormKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              TextFormField(
                key: const Key('new_password_input'),
                controller: _passwordController,
                obscureText: _obscurePassword,
                textInputAction: TextInputAction.next,
                decoration: InputDecoration(
                  labelText: 'New Password',
                  hintText: 'Minimum 6 characters',
                  prefixIcon: const Icon(Icons.lock_outline_rounded, color: AppColors.primary),
                  suffixIcon: IconButton(
                    icon: Icon(
                      _obscurePassword
                          ? Icons.visibility_off_outlined
                          : Icons.visibility_outlined,
                      color: AppColors.textSecondary,
                    ),
                    onPressed: () {
                      setState(() {
                        _obscurePassword = !_obscurePassword;
                      });
                    },
                  ),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter a new password';
                  }
                  if (value.length < 6) {
                    return 'Password must be at least 6 characters';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                key: const Key('confirm_password_input'),
                controller: _confirmPasswordController,
                obscureText: _obscureConfirmPassword,
                textInputAction: TextInputAction.done,
                onFieldSubmitted: (_) => _handleResetPassword(),
                decoration: InputDecoration(
                  labelText: 'Confirm Password',
                  hintText: 'Re-enter your password',
                  prefixIcon: const Icon(Icons.lock_reset_rounded, color: AppColors.primary),
                  suffixIcon: IconButton(
                    icon: Icon(
                      _obscureConfirmPassword
                          ? Icons.visibility_off_outlined
                          : Icons.visibility_outlined,
                      color: AppColors.textSecondary,
                    ),
                    onPressed: () {
                      setState(() {
                        _obscureConfirmPassword = !_obscureConfirmPassword;
                      });
                    },
                  ),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please confirm your password';
                  }
                  if (value != _passwordController.text) {
                    return 'Passwords do not match';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 24),
              PrimaryButton(
                key: const Key('reset_password_button'),
                text: 'Update Password',
                isLoading: _isLoading,
                onPressed: _handleResetPassword,
              ),
            ],
          ),
        );
    }
  }
}
