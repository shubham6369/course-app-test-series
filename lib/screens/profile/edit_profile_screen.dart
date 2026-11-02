import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../state/auth_provider.dart';
import '../../theme.dart';
import '../../widgets/common.dart';

/// Edit Profile Screen allowing students to update their name, exam goal, and class
class EditProfileScreen extends StatefulWidget {
  const EditProfileScreen({super.key});

  @override
  State<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends State<EditProfileScreen> {
  final _formKey = GlobalKey<FormState>();

  late TextEditingController _nameController;
  late TextEditingController _emailController;
  late TextEditingController _phoneController;

  String _targetExam = 'NEET 2026';
  String _classId = 'Class 12';
  bool _isSaving = false;

  final List<String> _examOptions = [
    'NEET 2026',
    'JEE Main 2026',
    'JEE Advanced 2026',
    'CBSE Board 2026',
    'Foundation (Class 9-10)',
  ];

  final List<String> _classOptions = [
    'Class 10',
    'Class 11',
    'Class 12',
    'Dropper / Repeater',
  ];

  @override
  void initState() {
    super.initState();
    final auth = context.read<AuthProvider>();
    final user = auth.user;

    _nameController = TextEditingController(text: user?.name ?? '');
    _emailController = TextEditingController(text: user?.email ?? '');
    _phoneController = TextEditingController(text: user?.phone ?? '');

    if (user?.targetExam != null && _examOptions.contains(user!.targetExam)) {
      _targetExam = user.targetExam!;
    }
    if (user?.classId != null && _classOptions.contains(user!.classId)) {
      _classId = user.classId!;
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  Future<void> _saveProfile() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSaving = true);
    final auth = context.read<AuthProvider>();

    final updated = await auth.updateProfile({
      'name': _nameController.text.trim(),
      'email': _emailController.text.trim(),
      'phone': _phoneController.text.trim(),
      'target_exam': _targetExam,
      'class_id': _classId,
    });

    if (mounted) {
      setState(() => _isSaving = false);
      if (updated) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Profile updated successfully!')),
        );
        Navigator.of(context).pop();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(auth.errorMessage ?? 'Failed to update profile.')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().user;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Edit Profile'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              // Avatar
              Stack(
                alignment: Alignment.bottomRight,
                children: [
                  CircleAvatar(
                    radius: 46,
                    backgroundColor: AppColors.primary.withAlpha(25),
                    child: Text(
                      _nameController.text.isNotEmpty
                          ? _nameController.text[0].toUpperCase()
                          : (user != null && user.name.isNotEmpty ? user.name[0].toUpperCase() : 'S'),
                      style: const TextStyle(
                        fontFamily: 'Poppins',
                        fontSize: 34,
                        fontWeight: FontWeight.bold,
                        color: AppColors.primary,
                      ),
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.all(6),
                    decoration: const BoxDecoration(
                      color: AppColors.primary,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.camera_alt_rounded, size: 16, color: Colors.white),
                  ),
                ],
              ),
              const SizedBox(height: 24),

              // Name Field
              TextFormField(
                controller: _nameController,
                decoration: const InputDecoration(
                  labelText: 'Full Name',
                  prefixIcon: Icon(Icons.person_outline_rounded),
                ),
                validator: (val) {
                  if (val == null || val.trim().isEmpty) return 'Please enter your name';
                  return null;
                },
              ),
              const SizedBox(height: 16),

              // Email Field
              TextFormField(
                controller: _emailController,
                keyboardType: TextInputType.emailAddress,
                decoration: const InputDecoration(
                  labelText: 'Email Address',
                  prefixIcon: Icon(Icons.email_outlined),
                ),
                validator: (val) {
                  if (val == null || val.trim().isEmpty) return 'Please enter your email';
                  if (!val.contains('@')) return 'Enter a valid email address';
                  return null;
                },
              ),
              const SizedBox(height: 16),

              // Phone Field
              TextFormField(
                controller: _phoneController,
                keyboardType: TextInputType.phone,
                decoration: const InputDecoration(
                  labelText: 'Phone Number',
                  prefixIcon: Icon(Icons.phone_outlined),
                ),
                validator: (val) {
                  if (val == null || val.trim().isEmpty) return 'Please enter your phone number';
                  return null;
                },
              ),
              const SizedBox(height: 20),

              // Target Exam Dropdown
              DropdownButtonFormField<String>(
                initialValue: _targetExam,
                decoration: const InputDecoration(
                  labelText: 'Target Examination',
                  prefixIcon: Icon(Icons.school_outlined),
                ),
                items: _examOptions.map((exam) {
                  return DropdownMenuItem(value: exam, child: Text(exam));
                }).toList(),
                onChanged: (val) {
                  if (val != null) setState(() => _targetExam = val);
                },
              ),
              const SizedBox(height: 16),

              // Class Dropdown
              DropdownButtonFormField<String>(
                initialValue: _classId,
                decoration: const InputDecoration(
                  labelText: 'Standard / Class',
                  prefixIcon: Icon(Icons.class_outlined),
                ),
                items: _classOptions.map((c) {
                  return DropdownMenuItem(value: c, child: Text(c));
                }).toList(),
                onChanged: (val) {
                  if (val != null) setState(() => _classId = val);
                },
              ),
              const SizedBox(height: 32),

              // Save Button
              PrimaryButton(
                text: 'Save Changes',
                isLoading: _isSaving,
                onPressed: _saveProfile,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
