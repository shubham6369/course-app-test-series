import 'package:flutter/material.dart';
import '../theme.dart';

/// Reusable card-based authentication layout container.
/// Features the brand logo, clean background, titles, keyboard dismissal,
/// and responsive scrollable container.
class AuthScaffold extends StatelessWidget {
  final String title;
  final String? subtitle;
  final Widget child;
  final Widget? bottomAction;
  final bool showBackButton;
  final VoidCallback? onBackPressed;
  final bool resizeToAvoidBottomInset;
  final double maxWidth;

  const AuthScaffold({
    super.key,
    required this.title,
    this.subtitle,
    required this.child,
    this.bottomAction,
    this.showBackButton = false,
    this.onBackPressed,
    this.resizeToAvoidBottomInset = true,
    this.maxWidth = 440,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => FocusScope.of(context).unfocus(),
      child: Scaffold(
        backgroundColor: AppColors.background,
        resizeToAvoidBottomInset: resizeToAvoidBottomInset,
        body: SafeArea(
          child: SingleChildScrollView(
            physics: const BouncingScrollPhysics(),
            padding: const EdgeInsets.symmetric(
              horizontal: 16,
              vertical: 20,
            ),
            child: Center(
              child: Container(
                width: double.infinity,
                constraints: BoxConstraints(maxWidth: maxWidth),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    if (showBackButton)
                      Align(
                        alignment: Alignment.centerLeft,
                        child: IconButton(
                          icon: const Icon(Icons.arrow_back_ios_new_rounded),
                          color: AppColors.textPrimary,
                          onPressed: onBackPressed ??
                              () {
                                if (Navigator.of(context).canPop()) {
                                  Navigator.of(context).pop();
                                }
                              },
                          tooltip: 'Back',
                        ),
                      )
                    else
                      const SizedBox(height: 12),

                    // Brand Logo Header
                    Center(
                      child: Hero(
                        tag: 'app_logo',
                        child: Container(
                          width: 80,
                          height: 80,
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(20),
                            boxShadow: [
                              BoxShadow(
                                color: AppColors.primary.withAlpha(30),
                                blurRadius: 16,
                                offset: const Offset(0, 8),
                              ),
                            ],
                            border: Border.all(
                              color: AppColors.borderLight,
                              width: 1.5,
                            ),
                          ),
                          clipBehavior: Clip.antiAlias,
                          child: Image.asset(
                            'assets/icons/test_series_logo.jpeg',
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) =>
                                Container(
                              color: AppColors.primary,
                              child: const Icon(
                                Icons.school_rounded,
                                color: Colors.white,
                                size: 40,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 20),

                    // Heading
                    Text(
                      title,
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        fontFamily: 'Poppins',
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        color: AppColors.textPrimary,
                        letterSpacing: -0.5,
                      ),
                    ),
                    if (subtitle != null) ...[
                      const SizedBox(height: 6),
                      Text(
                        subtitle!,
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                          fontFamily: 'Poppins',
                          fontSize: 13,
                          color: AppColors.textSecondary,
                          height: 1.4,
                        ),
                      ),
                    ],
                    const SizedBox(height: 24),

                    // Card Container
                    Container(
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: AppColors.border,
                          width: 1,
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withAlpha(10),
                            blurRadius: 16,
                            offset: const Offset(0, 8),
                          ),
                        ],
                      ),
                      padding: const EdgeInsets.all(20),
                      child: child,
                    ),

                    if (bottomAction != null) ...[
                      const SizedBox(height: 20),
                      bottomAction!,
                    ],
                    const SizedBox(height: 12),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
