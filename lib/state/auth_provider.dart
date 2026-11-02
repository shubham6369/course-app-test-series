import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../core/api_client.dart';
import '../core/api_service.dart';
import '../models/models.dart';

/// Authentication state provider managing user session, persistence,
/// and authentication flows.
class AuthProvider extends ChangeNotifier {
  static const String tokenKey = 'auth_token';
  static const String userProfileKey = 'user_profile';

  static final Student defaultStudent = Student(
    id: 1,
    name: 'Student',
    email: 'student@aimedutech.com',
    phone: '9876543210',
    avatarUrl: null,
    classId: 'Class 12',
    targetExam: 'NEET 2026',
  );

  final ApiService _apiService;
  SharedPreferences? _prefs;

  Student? _currentUser = defaultStudent;
  String? _token = 'guest_token';
  bool _isLoading = false;
  String? _errorMessage;
  bool _isInitialized = true;

  AuthProvider({
    ApiService? apiService,
    SharedPreferences? prefs,
  })  : _apiService = apiService ?? ApiService(),
        _prefs = prefs;

  // ----------------------------------------------------
  // Getters
  // ----------------------------------------------------

  Student? get currentUser => _currentUser;
  Student? get user => _currentUser;
  String? get token => _token;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  bool get isInitialized => _isInitialized;
  bool get isAuthenticated =>
      _token != null && _token!.isNotEmpty && _currentUser != null;

  // ----------------------------------------------------
  // Helpers
  // ----------------------------------------------------

  void clearError() {
    if (_errorMessage != null) {
      _errorMessage = null;
      notifyListeners();
    }
  }

  void _setLoading(bool loading) {
    _isLoading = loading;
    notifyListeners();
  }

  void _setError(String? message) {
    _errorMessage = message;
    notifyListeners();
  }

  Future<SharedPreferences> _getPrefs() async {
    _prefs ??= await SharedPreferences.getInstance();
    return _prefs!;
  }

  // ----------------------------------------------------
  // Session Persistence
  // ----------------------------------------------------

  /// Updates state directly for widget and unit tests
  void setUserForTesting(Student? user, {String? token}) {
    _currentUser = user;
    _token = token ?? (user != null ? 'mock_test_token' : null);
    _isInitialized = true;
    notifyListeners();
  }

  /// Initialize and restore session from SharedPreferences on app launch
  Future<bool> initialize() async {
    _isLoading = true;
    notifyListeners();

    try {
      final prefs = await _getPrefs();
      final storedToken = prefs.getString(tokenKey);
      final storedProfile = prefs.getString(userProfileKey);

      if (storedToken != null && storedToken.isNotEmpty && storedProfile != null) {
        _token = storedToken;
        ApiConfig.authToken = storedToken;
        try {
          final Map<String, dynamic> userMap =
              Map<String, dynamic>.from(jsonDecode(storedProfile) as Map);
          _currentUser = Student.fromJson(userMap);
        } catch (e) {
          debugPrint('Error decoding stored profile: $e');
          _currentUser = defaultStudent;
          _token = 'guest_token';
          ApiConfig.authToken = 'guest_token';
        }
      } else {
        // Authentication removed: automatically provide default student session
        _currentUser = defaultStudent;
        _token = 'guest_token';
        ApiConfig.authToken = 'guest_token';
      }
      _isInitialized = true;
      _isLoading = false;
      notifyListeners();
      return isAuthenticated;
    } catch (e) {
      _errorMessage = 'Failed to restore session: $e';
      _isInitialized = true;
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  /// Save session data to SharedPreferences and memory
  Future<void> _persistSession(String token, Student user) async {
    _token = token;
    _currentUser = user;
    ApiConfig.authToken = token;

    try {
      final prefs = await _getPrefs();
      await prefs.setString(tokenKey, token);
      await prefs.setString(userProfileKey, jsonEncode(user.toJson()));
    } catch (e) {
      debugPrint('Error persisting session: $e');
    }
  }

  /// Clear session data from SharedPreferences and memory
  Future<void> _clearPersistedSession() async {
    _token = null;
    _currentUser = null;
    ApiConfig.authToken = null;

    try {
      final prefs = await _getPrefs();
      await prefs.remove(tokenKey);
      await prefs.remove(userProfileKey);
    } catch (e) {
      debugPrint('Error clearing persisted session: $e');
    }
  }

  // ----------------------------------------------------
  // Authentication Actions
  // ----------------------------------------------------

  /// Login with phone (or email) and password
  Future<bool> login(String phoneOrEmail, String password) async {
    _setLoading(true);
    _setError(null);

    try {
      final result = await _apiService.login(phoneOrEmail, password);
      final token = result['token'] as String? ?? '';
      final user = result['user'] as Student?;

      if (user != null && token.isNotEmpty) {
        await _persistSession(token, user);
        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        _setError('Invalid login response');
        _isLoading = false;
        notifyListeners();
        return false;
      }
    } catch (e) {
      _setError(e.toString());
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  /// Register a new student
  Future<bool> register(
    String name,
    String phone,
    String email,
    String password,
    String classId,
  ) async {
    _setLoading(true);
    _setError(null);

    try {
      final result = await _apiService.register(
        name,
        email,
        phone,
        password,
        classId: classId,
      );
      final token = result['token'] as String? ?? '';
      final user = result['user'] as Student?;

      if (user != null && token.isNotEmpty) {
        await _persistSession(token, user);
        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        _setError('Registration succeeded without session token');
        _isLoading = false;
        notifyListeners();
        return false;
      }
    } catch (e) {
      _setError(e.toString());
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  /// Send OTP to phone
  Future<bool> sendOtp(String phone) async {
    _setLoading(true);
    _setError(null);

    try {
      final success = await _apiService.sendOtp(phone);
      _isLoading = false;
      notifyListeners();
      return success;
    } catch (e) {
      _setError(e.toString());
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  /// Verify OTP and update session if user data returned
  Future<bool> verifyOtp(String phone, String otp) async {
    _setLoading(true);
    _setError(null);

    try {
      final result = await _apiService.verifyOtp(phone, otp);
      final verified = result['verified'] as bool? ?? false;
      final token = result['token'] as String?;
      final user = result['user'] as Student?;

      if (token != null && token.isNotEmpty && user != null) {
        await _persistSession(token, user);
      }

      _isLoading = false;
      notifyListeners();
      return verified;
    } catch (e) {
      _setError(e.toString());
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  /// Request password reset
  Future<bool> forgotPassword(String phone) async {
    _setLoading(true);
    _setError(null);

    try {
      final success = await _apiService.forgotPassword(phone);
      _isLoading = false;
      notifyListeners();
      return success;
    } catch (e) {
      _setError(e.toString());
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  /// Reset password with OTP and new password
  Future<bool> resetPassword(String phone, String otp, String newPassword) async {
    _setLoading(true);
    _setError(null);

    try {
      final success = await _apiService.resetPassword(phone, otp, newPassword);
      _isLoading = false;
      notifyListeners();
      return success;
    } catch (e) {
      _setError(e.toString());
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  /// Update student profile
  Future<bool> updateProfile(Map<String, dynamic> data) async {
    _setLoading(true);
    _setError(null);

    try {
      final updatedUser = await _apiService.updateProfile(data);
      _currentUser = updatedUser;
      if (_token != null) {
        await _persistSession(_token!, updatedUser);
      }
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _setError(e.toString());
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  /// Refresh current user profile from server
  Future<bool> refreshProfile() async {
    if (_token == null || _token!.isEmpty) return false;

    try {
      final user = await _apiService.getProfile();
      _currentUser = user;
      await _persistSession(_token!, user);
      notifyListeners();
      return true;
    } catch (e) {
      debugPrint('Failed to refresh profile: $e');
      return false;
    }
  }

  /// Logout student and clear session
  Future<void> logout() async {
    _setLoading(true);
    await _clearPersistedSession();
    _isLoading = false;
    notifyListeners();
  }
}
