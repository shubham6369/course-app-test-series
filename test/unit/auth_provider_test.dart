import 'dart:convert';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:test_series/core/api_client.dart';
import 'package:test_series/core/api_service.dart';
import 'package:test_series/models/models.dart';
import 'package:test_series/state/auth_provider.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('AuthProvider Tests', () {
    late ApiClient apiClient;
    late ApiService apiService;

    setUp(() {
      ApiConfig.forceOfflineMock = true;
      ApiConfig.authToken = null;
      apiClient = ApiClient();
      apiService = ApiService(apiClient: apiClient);
      SharedPreferences.setMockInitialValues({});
    });

    test('Initial unauthenticated state', () {
      final authProvider = AuthProvider(apiService: apiService);

      expect(authProvider.currentUser, isNull);
      expect(authProvider.user, isNull);
      expect(authProvider.token, isNull);
      expect(authProvider.isAuthenticated, isFalse);
      expect(authProvider.isLoading, isFalse);
      expect(authProvider.errorMessage, isNull);
      expect(authProvider.isInitialized, isFalse);
    });

    test('initialize() with no saved session keeps unauthenticated state', () async {
      SharedPreferences.setMockInitialValues({});
      final prefs = await SharedPreferences.getInstance();
      final authProvider = AuthProvider(apiService: apiService, prefs: prefs);

      final result = await authProvider.initialize();

      expect(result, isFalse);
      expect(authProvider.isInitialized, isTrue);
      expect(authProvider.isAuthenticated, isFalse);
      expect(authProvider.currentUser, isNull);
      expect(authProvider.token, isNull);
      expect(ApiConfig.authToken, isNull);
    });

    test('initialize() restores session from SharedPreferences correctly', () async {
      final savedStudent = Student(
        id: 777,
        name: 'Saved Student',
        email: 'saved@test.com',
        phone: '9988776655',
        classId: '12',
        targetExam: 'NEET 2026',
        token: 'persisted_jwt_token_999',
      );

      SharedPreferences.setMockInitialValues({
        AuthProvider.tokenKey: 'persisted_jwt_token_999',
        AuthProvider.userProfileKey: jsonEncode(savedStudent.toJson()),
      });
      final prefs = await SharedPreferences.getInstance();
      final authProvider = AuthProvider(apiService: apiService, prefs: prefs);

      final isAuth = await authProvider.initialize();

      expect(isAuth, isTrue);
      expect(authProvider.isAuthenticated, isTrue);
      expect(authProvider.token, equals('persisted_jwt_token_999'));
      expect(authProvider.currentUser?.id, equals(777));
      expect(authProvider.currentUser?.name, equals('Saved Student'));
      expect(authProvider.currentUser?.email, equals('saved@test.com'));
      expect(ApiConfig.authToken, equals('persisted_jwt_token_999'));
    });

    test('initialize() handles corrupted profile JSON gracefully', () async {
      SharedPreferences.setMockInitialValues({
        AuthProvider.tokenKey: 'persisted_jwt_token_999',
        AuthProvider.userProfileKey: '{"invalid_json_without_closing_brace',
      });
      final prefs = await SharedPreferences.getInstance();
      final authProvider = AuthProvider(apiService: apiService, prefs: prefs);

      final isAuth = await authProvider.initialize();

      expect(isAuth, isFalse);
      expect(authProvider.isAuthenticated, isFalse);
      expect(authProvider.currentUser, isNull);
      expect(authProvider.token, isNull);
      expect(prefs.getString(AuthProvider.tokenKey), isNull);
      expect(prefs.getString(AuthProvider.userProfileKey), isNull);
    });

    test('login() succeeds, updates state, and saves to SharedPreferences', () async {
      final prefs = await SharedPreferences.getInstance();
      final authProvider = AuthProvider(apiService: apiService, prefs: prefs);

      int notifyCount = 0;
      authProvider.addListener(() {
        notifyCount++;
      });

      final success = await authProvider.login('9876543210', 'password123');

      expect(success, isTrue);
      expect(authProvider.isAuthenticated, isTrue);
      expect(authProvider.currentUser, isNotNull);
      expect(authProvider.token, isNotNull);
      expect(authProvider.token, isNotEmpty);
      expect(authProvider.currentUser?.phone, isNotEmpty);
      expect(notifyCount, greaterThanOrEqualTo(2)); // Loading start, loaded finish

      // Verify persisted session in SharedPreferences
      expect(prefs.getString(AuthProvider.tokenKey), equals(authProvider.token));
      final storedProfile = prefs.getString(AuthProvider.userProfileKey);
      expect(storedProfile, isNotNull);
      final decoded = jsonDecode(storedProfile!) as Map<String, dynamic>;
      expect(decoded['id'], equals(authProvider.currentUser?.id));
    });

    test('register() creates user, updates state, and persists session', () async {
      final prefs = await SharedPreferences.getInstance();
      final authProvider = AuthProvider(apiService: apiService, prefs: prefs);

      final success = await authProvider.register(
        'Rohan Sharma',
        '9876543299',
        'rohan@example.com',
        'secret123',
        '11',
      );

      expect(success, isTrue);
      expect(authProvider.isAuthenticated, isTrue);
      expect(authProvider.currentUser?.name, equals('Rohan Sharma'));
      expect(authProvider.token, isNotEmpty);
      expect(prefs.getString(AuthProvider.tokenKey), isNotEmpty);
    });

    test('sendOtp() and verifyOtp() flow', () async {
      final prefs = await SharedPreferences.getInstance();
      final authProvider = AuthProvider(apiService: apiService, prefs: prefs);

      final otpSent = await authProvider.sendOtp('9876543210');
      expect(otpSent, isTrue);

      final verified = await authProvider.verifyOtp('9876543210', '123456');
      expect(verified, isTrue);
    });

    test('forgotPassword() and resetPassword() flow', () async {
      final prefs = await SharedPreferences.getInstance();
      final authProvider = AuthProvider(apiService: apiService, prefs: prefs);

      final forgotSuccess = await authProvider.forgotPassword('9876543210');
      expect(forgotSuccess, isTrue);

      final resetSuccess = await authProvider.resetPassword(
        '9876543210',
        '123456',
        'NewStrongPassword123!',
      );
      expect(resetSuccess, isTrue);
    });

    test('updateProfile() updates user and preferences', () async {
      final prefs = await SharedPreferences.getInstance();
      final authProvider = AuthProvider(apiService: apiService, prefs: prefs);

      await authProvider.login('9876543210', 'password123');
      expect(authProvider.isAuthenticated, isTrue);

      final updateSuccess = await authProvider.updateProfile({
        'name': 'Aarav Updated',
        'target_exam': 'JEE Advanced',
      });

      expect(updateSuccess, isTrue);
      expect(authProvider.currentUser?.name, equals('Aarav Updated'));
      expect(authProvider.currentUser?.targetExam, equals('JEE Advanced'));

      // Verify SharedPreferences updated
      final storedProfile = prefs.getString(AuthProvider.userProfileKey);
      expect(storedProfile, contains('Aarav Updated'));
    });

    test('refreshProfile() retrieves fresh user data when authenticated', () async {
      final prefs = await SharedPreferences.getInstance();
      final authProvider = AuthProvider(apiService: apiService, prefs: prefs);

      // Unauthenticated returns false
      expect(await authProvider.refreshProfile(), isFalse);

      await authProvider.login('9876543210', 'password123');
      final refreshed = await authProvider.refreshProfile();
      expect(refreshed, isTrue);
      expect(authProvider.currentUser, isNotNull);
    });

    test('logout() clears user, token, ApiConfig, and SharedPreferences', () async {
      final prefs = await SharedPreferences.getInstance();
      final authProvider = AuthProvider(apiService: apiService, prefs: prefs);

      await authProvider.login('9876543210', 'password123');
      expect(authProvider.isAuthenticated, isTrue);
      expect(prefs.getString(AuthProvider.tokenKey), isNotNull);

      await authProvider.logout();

      expect(authProvider.isAuthenticated, isFalse);
      expect(authProvider.currentUser, isNull);
      expect(authProvider.user, isNull);
      expect(authProvider.token, isNull);
      expect(ApiConfig.authToken, isNull);
      expect(prefs.getString(AuthProvider.tokenKey), isNull);
      expect(prefs.getString(AuthProvider.userProfileKey), isNull);
    });

    test('clearError() resets errorMessage', () {
      final authProvider = AuthProvider(apiService: apiService);

      // Error state simulation
      authProvider.clearError();
      expect(authProvider.errorMessage, isNull);
    });
  });
}
