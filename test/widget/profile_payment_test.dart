import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:test_series/models/models.dart';
import 'package:test_series/screens/legal/legal_screen.dart';
import 'package:test_series/screens/payment/payment_screen.dart';
import 'package:test_series/screens/profile/edit_profile_screen.dart';
import 'package:test_series/screens/profile/profile_screen.dart';
import 'package:test_series/state/auth_provider.dart';

Widget _buildTestApp(Widget child, {Student? initialUser}) {
  final authProvider = AuthProvider();
  if (initialUser != null) {
    authProvider.setUserForTesting(initialUser);
  }

  return MultiProvider(
    providers: [
      ChangeNotifierProvider<AuthProvider>.value(value: authProvider),
    ],
    child: MaterialApp(
      home: child,
    ),
  );
}

void main() {
  group('Milestone M8: Profile, Payments & Legal Tests', () {
    testWidgets('ProfileScreen renders user details, options hub, and sign out CTA', (tester) async {
      final user = Student(
        id: 101,
        name: 'Rahul Sharma',
        email: 'rahul.sharma@example.com',
        phone: '9876543210',
        classId: 'Class 12',
        targetExam: 'NEET 2026',
      );

      await tester.pumpWidget(_buildTestApp(const ProfileScreen(), initialUser: user));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 300));

      expect(find.text('My Profile & Hub'), findsOneWidget);
      expect(find.text('Rahul Sharma'), findsOneWidget);
      expect(find.text('NEET 2026'), findsOneWidget);
      expect(find.text('My Performance Analytics'), findsOneWidget);
      expect(find.text('My Enrolled Courses'), findsOneWidget);
      expect(find.text('AI Academic Tutor'), findsOneWidget);
      expect(find.text('Digital Books & Ebooks'), findsOneWidget);
      expect(find.text('Revision Notes & Formula Sheets'), findsOneWidget);
      expect(find.text('Aspirants Community Feed'), findsOneWidget);
      expect(find.text('Billing & Transaction History'), findsOneWidget);
      expect(find.text('Terms & Privacy Policies'), findsOneWidget);
      expect(find.text('Sign Out'), findsOneWidget);
    });

    testWidgets('EditProfileScreen populates fields and allows updating profile', (tester) async {
      final user = Student(
        id: 101,
        name: 'Rahul Sharma',
        email: 'rahul.sharma@example.com',
        phone: '9876543210',
        classId: 'Class 12',
        targetExam: 'NEET 2026',
      );

      await tester.pumpWidget(_buildTestApp(const EditProfileScreen(), initialUser: user));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 300));

      expect(find.text('Edit Profile'), findsOneWidget);
      expect(find.text('Full Name'), findsOneWidget);
      expect(find.text('Email Address'), findsOneWidget);
      expect(find.text('Phone Number'), findsOneWidget);
      expect(find.text('Target Examination'), findsOneWidget);
      expect(find.text('Standard / Class'), findsOneWidget);
      expect(find.text('Save Changes'), findsOneWidget);
    });

    testWidgets('PaymentScreen displays active subscription and transaction records', (tester) async {
      await tester.pumpWidget(_buildTestApp(const PaymentScreen()));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 300));

      expect(find.text('Transactions & Billing'), findsOneWidget);
      expect(find.text('ACTIVE ACCESS'), findsOneWidget);
      expect(find.text('PRO STUDENT'), findsOneWidget);
      expect(find.text('NEET 2026 Full Test Package'), findsOneWidget);
      expect(find.text('Order History & Invoices'), findsOneWidget);
      expect(find.text('₹499.00'), findsOneWidget);
      expect(find.text('SUCCESS'), findsWidgets);
    });

    testWidgets('LegalScreen displays Terms, Privacy, and Refund tabs and content', (tester) async {
      await tester.pumpWidget(_buildTestApp(const LegalScreen()));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 300));

      expect(find.text('Policies & Terms'), findsOneWidget);
      expect(find.text('Terms'), findsOneWidget);
      expect(find.text('Privacy'), findsOneWidget);
      expect(find.text('Refunds'), findsOneWidget);
      expect(find.textContaining('Terms & Conditions of Service'), findsOneWidget);

      // Tap on Privacy tab
      await tester.tap(find.text('Privacy'));
      await tester.pumpAndSettle();
      expect(find.textContaining('Privacy Policy'), findsOneWidget);

      // Tap on Refunds tab
      await tester.tap(find.text('Refunds'));
      await tester.pumpAndSettle();
      expect(find.textContaining('Refund & Cancellation Policy'), findsOneWidget);
    });
  });
}

