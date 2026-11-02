import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../state/auth_provider.dart';
import '../../theme.dart';
import '../../widgets/auth_scaffold.dart';
import '../../widgets/common.dart';

/// Student Registration Screen with Full Name, Phone, Email, Password,
/// and Class/Exam dropdown selector, plus AuthProvider integration.
class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  String _selectedClass = '1';
  bool _obscurePassword = true;
  bool _isSubmitting = false;

  static const List<Map<String, String>> _classes = [
    {'id': '1', 'name': 'NEET 2026'},
    {'id': '2', 'name': 'JEE Main 2026'},
    {'id': '3', 'name': 'JEE Advanced 2026'},
    {'id': '4', 'name': 'Class 12 Foundation'},
    {'id': '5', 'name': 'Class 11 Foundation'},
    {'id': '6', 'name': 'General Practice'},
  ];

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleRegister() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    FocusScope.of(context).unfocus();
    setState(() {
      _isSubmitting = true;
    });

    final authProvider = context.read<AuthProvider>();
    final success = await authProvider.register(
      _nameController.text.trim(),
      _phoneController.text.trim(),
      _emailController.text.trim(),
      _passwordController.text,
      _selectedClass,
    );

    if (!mounted) return;
    setState(() {
      _isSubmitting = false;
    });

    if (success) {
      if (GoRouter.maybeOf(context) != null) {
        context.go('/home');
      }
    } else {
      final error = authProvider.errorMessage ??
          'Registration failed. Please check your information.';
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
      title: 'Create Account',
      subtitle: 'Join thousands of students preparing with top mock tests',
      showBackButton: true,
      onBackPressed: () {
        if (GoRouter.maybeOf(context) != null) {
          context.go('/login');
        } else if (Navigator.of(context).canPop()) {
          Navigator.of(context).pop();
        }
      },
      bottomAction: Wrap(
        alignment: WrapAlignment.center,
        crossAxisAlignment: WrapCrossAlignment.center,
        children: [
          const Text(
            'Already have an account? ',
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
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Full Name Input
            TextFormField(
              key: const Key('register_name_input'),
              controller: _nameController,
              textCapitalization: TextCapitalization.words,
              textInputAction: TextInputAction.next,
              decoration: const InputDecoration(
                labelText: 'Full Name',
                hintText: 'Enter your full name',
                prefixIcon: Icon(Icons.badge_outlined, color: AppColors.primary),
              ),
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return 'Please enter your full name';
                }
                if (value.trim().length < 2) {
                  return 'Name must be at least 2 characters';
                }
                return null;
              },
            ),
            const SizedBox(height: 16),

            // Phone Input
            TextFormField(
              key: const Key('register_phone_input'),
              controller: _phoneController,
              keyboardType: TextInputType.phone,
              textInputAction: TextInputAction.next,
              decoration: const InputDecoration(
                labelText: 'Phone Number',
                hintText: '10-digit mobile number',
                prefixIcon: Icon(Icons.phone_outlined, color: AppColors.primary),
              ),
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return 'Please enter your phone number';
                }
                if (value.trim().length < 10) {
                  return 'Please enter a valid phone number';
                }
                return null;
              },
            ),
            const SizedBox(height: 16),

            // Email Input
            TextFormField(
              key: const Key('register_email_input'),
              controller: _emailController,
              keyboardType: TextInputType.emailAddress,
              textInputAction: TextInputAction.next,
              decoration: const InputDecoration(
                labelText: 'Email Address',
                hintText: 'student@example.com',
                prefixIcon: Icon(Icons.email_outlined, color: AppColors.primary),
              ),
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return 'Please enter your email address';
                }
                if (!value.contains('@') || !value.contains('.')) {
                  return 'Please enter a valid email address';
                }
                return null;
              },
            ),
            const SizedBox(height: 16),

            // Target Class / Exam Dropdown
            DropdownButtonFormField<String>(
              key: const Key('register_class_dropdown'),
              initialValue: _selectedClass,
              isExpanded: true,
              decoration: const InputDecoration(
                labelText: 'Target Exam / Class',
                prefixIcon: Icon(Icons.school_outlined, color: AppColors.primary),
              ),
              items: _classes.map((cls) {
                return DropdownMenuItem<String>(
                  value: cls['id'],
                  child: Text(
                    cls['name']!,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontFamily: 'Poppins',
                      fontSize: 14,
                      color: AppColors.textPrimary,
                    ),
                  ),
                );
              }).toList(),
              onChanged: (val) {
                if (val != null) {
                  setState(() {
                    _selectedClass = val;
                  });
                }
              },
            ),
            const SizedBox(height: 16),

            // Password Input
            TextFormField(
              key: const Key('register_password_input'),
              controller: _passwordController,
              obscureText: _obscurePassword,
              textInputAction: TextInputAction.done,
              onFieldSubmitted: (_) => _handleRegister(),
              decoration: InputDecoration(
                labelText: 'Password',
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
                  return 'Please create a password';
                }
                if (value.length < 6) {
                  return 'Password must be at least 6 characters';
                }
                return null;
              },
            ),
            const SizedBox(height: 24),

            // Register Button
            PrimaryButton(
              key: const Key('register_button'),
              text: 'Create Account',
              isLoading: _isSubmitting,
              onPressed: _handleRegister,
            ),
          ],
        ),
      ),
    );
  }
}
