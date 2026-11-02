# E2E Test Infra: Test Series Educational App

## Test Philosophy
- Requirement-driven and opaque-box. Validates user flows and business rules.
- Test methodology:
  - **Tier 1: Feature Coverage (>=5 per feature domain)**: Happy-path validation for core flows (Models, Auth, Courses, CBT Quiz, Doubts, Profile).
  - **Tier 2: Boundary & Corner Cases**: Empty states, network failure fallback to mock data, invalid credentials, timer expiration auto-submit, negative marking limits.
  - **Tier 3: Cross-Feature Combinations**: Auth state persistence -> Course enrollment -> CBT exam attempt -> Result card & certificate generation.
  - **Tier 4: Real-World Scenarios**: Complete full-cycle student session: login -> browse home -> purchase/enroll course -> watch video -> take CBT exam -> review answers -> view certificate.

## Test Directory Layout
```
test/
├── unit/
│   ├── models_test.dart            # All 30 domain models serialization & deserialization
│   ├── api_service_test.dart       # ApiService endpoints with MockOfflineInterceptor
│   └── cbt_scoring_test.dart       # CBT engine timer, negative marking, accuracy, and score calculation
├── widget/
│   ├── auth_screens_test.dart      # Login, registration, OTP input validation
│   ├── home_dashboard_test.dart    # Home feed, banner carousel, category grid
│   └── quiz_player_test.dart       # Question palette states, mark for review, option selection
└── integration/
    └── full_flow_test.dart         # Complete end-to-end user journey simulation
```

## Coverage Thresholds
- Unit test pass rate: 100%
- Widget test pass rate: 100%
- Static analysis: 0 errors with `flutter analyze`
- Build verification: `flutter build apk` succeeds with output APK generated.
