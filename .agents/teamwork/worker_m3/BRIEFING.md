# BRIEFING — 2026-10-31T15:21:30Z

## Mission
Complete Milestone M3: Verify and finalize domain models in `lib/models/models.dart`, implement `lib/state/auth_provider.dart` with session persistence & API methods, implement comprehensive unit tests in `test/unit/models_test.dart` and `test/unit/auth_provider_test.dart`, and verify 0 errors in flutter analyze and flutter test.

## 🔒 My Identity
- Archetype: worker
- Roles: implementer, qa, specialist
- Working directory: c:\Users\hp\Desktop\course app\.agents\teamwork\worker_m3\
- Original parent: 8092c7f4-4ee8-467e-9537-6793388cfe6d
- Milestone: M3 (Auth State & Models Specialist)

## 🔒 Key Constraints
- All 30 domain models with complete fields, safe JSON parsing, and .toJson() methods.
- AuthProvider using ChangeNotifier and SharedPreferences, managing Student? currentUser, String? token, bool isLoading, String? errorMessage.
- Session persistence (initialize() restoring from SharedPreferences keys: auth_token, user_profile).
- Methods: login(phone, password), register(name, phone, email, password, classId), verifyOtp(phone, otp), forgotPassword(phone), updateProfile(Map<String, dynamic> data), logout().
- Unit tests: test/unit/models_test.dart and test/unit/auth_provider_test.dart.
- ZERO ERRORS on flutter analyze and flutter test.
- MANDATORY INTEGRITY: Do not cheat, hardcode test results, or create facade implementations.

## Current Parent
- Conversation ID: 8092c7f4-4ee8-467e-9537-6793388cfe6d
- Updated: not yet

## Task Summary
- **What to build**: lib/models/models.dart (refine & complete), lib/state/auth_provider.dart, test/unit/models_test.dart, test/unit/auth_provider_test.dart
- **Success criteria**: All tests pass, flutter analyze 0 issues, 100% roundtrip test coverage on models, AuthProvider state lifecycle covered.
- **Interface contracts**: PROJECT.md § Interface Contracts (ApiClient <-> ApiService, AuthProvider <-> UI)
- **Code layout**: PROJECT.md § Code Layout

## Key Decisions Made
- Added `copyWith` and robust id parser to `Student`.
- Added `toJson()` to `RazorpayOptions`.
- Implemented `AuthProvider` with complete state machine, error handling, JSON persistence, and token synchronization with `ApiConfig.authToken`.
- Updated `MockDataGenerator` in `ApiClient` to merge request payloads into responses for `POST /auth/register` and `PUT /profile`.

## Artifact Index
- lib/models/models.dart — 31 domain models
- lib/state/auth_provider.dart — ChangeNotifier authentication state
- test/unit/models_test.dart — Unit test suite for models round-trip serialization (16 tests)
- test/unit/auth_provider_test.dart — Unit test suite for AuthProvider (12 tests)

## Change Tracker
- **Files modified**:
  - `lib/models/models.dart`: Added `Student.copyWith`, safe ID parser, `toString()`, and `RazorpayOptions.toJson()`.
  - `lib/state/auth_provider.dart`: Created full `AuthProvider` implementation.
  - `lib/core/api_client.dart`: Updated `MockDataGenerator` to merge payloads for registration and profile updates.
  - `test/unit/models_test.dart`: Created 16 serialization tests covering all 31 models.
  - `test/unit/auth_provider_test.dart`: Created 12 state tests covering session lifecycle and auth operations.
- **Build status**: Pass
- **Pending issues**: None

## Quality Status
- **Build/test result**: Pass (39/39 tests passed)
- **Lint status**: 0 issues (`flutter analyze` clean)
- **Tests added/modified**: 28 tests added across 2 new test suites

## Loaded Skills
- None
