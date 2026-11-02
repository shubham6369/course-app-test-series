import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../state/auth_provider.dart';
import '../../theme.dart';
import '../../widgets/auth_scaffold.dart';
import '../../widgets/common.dart';

/// Student Login Screen with form validation, password visibility toggle,
/// remember-me option, forgot password navigation, and AuthProvider integration.
class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _phoneOrEmailController = TextEditingController();
  final _passwordController = TextEditingController();

  bool _obscurePassword = true;
  bool _rememberMe = true;
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    _loadSavedCredentials();
  }

  Future<void> _loadSavedCredentials() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final savedPhoneOrEmail = prefs.getString('saved_phone_or_email');
      if (savedPhoneOrEmail != null && savedPhoneOrEmail.isNotEmpty) {
        setState(() {
          _phoneOrEmailController.text = savedPhoneOrEmail;
          _rememberMe = true;
        });
      }
    } catch (_) {}
  }

  @override
  void dispose() {
    _phoneOrEmailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    FocusScope.of(context).unfocus();
    setState(() {
      _isSubmitting = true;
    });

    final authProvider = context.read<AuthProvider>();
    final phoneOrEmail = _phoneOrEmailController.text.trim();
    final password = _passwordController.text;

    final success = await authProvider.login(phoneOrEmail, password);

    if (!mounted) return;
    setState(() {
      _isSubmitting = false;
    });

    if (success) {
      if (_rememberMe) {
        try {
          final prefs = await SharedPreferences.getInstance();
          await prefs.setString('saved_phone_or_email', phoneOrEmail);
        } catch (_) {}
      } else {
        try {
          final prefs = await SharedPreferences.getInstance();
          await prefs.remove('saved_phone_or_email');
        } catch (_) {}
      }

      if (!mounted) return;
      if (GoRouter.maybeOf(context) != null) {
        context.go('/home');
      }
    } else {
      final error = authProvider.errorMessage ?? 'Login failed. Please check your credentials.';
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(error),
          backgroundColor: AppColors.error,
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return AuthScaffold(
      title: 'Welcome Back!',
      subtitle: 'Sign in to access your test series, courses and doubts',
      bottomAction: Wrap(
        alignment: WrapAlignment.center,
        crossAxisAlignment: WrapCrossAlignment.center,
        children: [
          const Text(
            "Don't have an account? ",
            style: TextStyle(
              fontFamily: 'Poppins',
              fontSize: 14,
              color: AppColors.textSecondary,
            ),
          ),
          InkWell(
            onTap: () {
              if (GoRouter.maybeOf(context) != null) {
                context.go('/register');
              }
            },
            borderRadius: BorderRadius.circular(4),
            child: const Padding(
              padding: EdgeInsets.symmetric(horizontal: 4, vertical: 2),
              child: Text(
                'Register',
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
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Phone or Email Input
            TextFormField(
              key: const Key('phone_or_email_input'),
              controller: _phoneOrEmailController,
              keyboardType: TextInputType.emailAddress,
              textInputAction: TextInputAction.next,
              decoration: const InputDecoration(
                labelText: 'Phone or Email',
                hintText: 'Enter phone number or email',
                prefixIcon: Icon(Icons.person_outline_rounded, color: AppColors.primary),
              ),
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return 'Please enter your phone or email';
                }
                return null;
              },
            ),
            const SizedBox(height: 16),

            // Password Input
            TextFormField(
              key: const Key('password_input'),
              controller: _passwordController,
              obscureText: _obscurePassword,
              textInputAction: TextInputAction.done,
              onFieldSubmitted: (_) => _handleLogin(),
              decoration: InputDecoration(
                labelText: 'Password',
                hintText: 'Enter your password',
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
                  return 'Please enter your password';
                }
                if (value.length < 6) {
                  return 'Password must be at least 6 characters';
                }
                return null;
              },
            ),
            const SizedBox(height: 12),

            // Remember Me & Forgot Password
            Wrap(
              alignment: WrapAlignment.spaceBetween,
              crossAxisAlignment: WrapCrossAlignment.center,
              runSpacing: 4,
              children: [
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    SizedBox(
                      height: 24,
                      width: 24,
                      child: Checkbox(
                        value: _rememberMe,
                        activeColor: AppColors.primary,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(4),
                        ),
                        onChanged: (val) {
                          setState(() {
                            _rememberMe = val ?? true;
                          });
                        },
                      ),
                    ),
                    const SizedBox(width: 8),
                    const Text(
                      'Remember me',
                      style: TextStyle(
                        fontFamily: 'Poppins',
                        fontSize: 13,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
                InkWell(
                  onTap: () {
                    if (GoRouter.maybeOf(context) != null) {
                      context.go('/forgot-password');
                    }
                  },
                  borderRadius: BorderRadius.circular(4),
                  child: const Padding(
                    padding: EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                    child: Text(
                      'Forgot Password?',
                      style: TextStyle(
                        fontFamily: 'Poppins',
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: AppColors.primary,
                      ),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),

            // Login Button
            PrimaryButton(
              key: const Key('login_button'),
              text: 'Sign In',
              isLoading: _isSubmitting,
              onPressed: _handleLogin,
            ),
          ],
        ),
      ),
    );
  }
}
