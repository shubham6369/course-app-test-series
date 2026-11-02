# Handoff Report: APK & Asset Research (Explorer 1)

## 1. Observation

### 1.1 Target APK Overview
- **File Path**: `c:\Users\hp\Desktop\course app\Test Series.apk`
- **File Size**: 73,615,657 bytes (~70.2 MB)
- **Archive Format**: Standard ZIP / Android Package containing 552 files.
- **Root Files**:
  ```
  classes.dex (2,117,900 bytes)
  AndroidManifest.xml
  resources.arsc
  kotlin-tooling-metadata.json
  DebugProbesKt.bin
  play-services-auth-api-phone.properties
  play-services-auth.properties
  play-services-base.properties
  play-services-basement.properties
  play-services-wallet.properties
  ```

### 1.2 Android Manifest Badging & Configuration
Directly extracted using `aapt.exe dump badging "c:\Users\hp\Desktop\course app\Test Series.apk"`:
- **Package Name**: `webphiser.com.test.series`
- **Version Code**: `1`
- **Version Name**: `1.0.0`
- **Compile SDK Version**: `36` (Platform Build: 16)
- **Min SDK Version**: `24` (Android 7.0 Nougat)
- **Target SDK Version**: `36`
- **Application Label**: `Test Series`
- **Launchable Activity**: `webphiser.com.test.series.MainActivity`
- **Application Icon Resource**: `res/BW.xml` (Adaptive Icon with background `@0x7f050044` and foreground `@0x7f070078`)

#### Declared Uses-Permissions:
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />
<uses-permission android:name="android.permission.NFC" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="webphiser.com.test.series.DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION" />
<uses-permission android:name="android.permission.READ_BASIC_PHONE_STATE" />
```

#### Hardware Features:
```xml
<uses-feature android:glEsVersion="0x00020000" android:required="true" />
<uses-feature android:name="android.hardware.nfc" android:required="false" />
<uses-feature android:name="android.hardware.faketouch" android:required="true" />
```

#### Registered Components (Activities, Providers, Services, Receivers):
1. **MainActivity**:
   - `webphiser.com.test.series.MainActivity`
   - Intent Filter: `android.intent.action.MAIN` + `android.intent.category.LAUNCHER`
   - Metadata: `io.flutter.embedding.android.NormalTheme`, `flutterEmbedding` (value=2)
   - Hardware accelerated: `true`, Window soft input mode: `adjustResize`
2. **Payment Activities (Razorpay)**:
   - `com.razorpay.CheckoutActivity` (exported="true", theme="@android:style/Theme.Translucent.NoTitleBar", intent-filter: `android.intent.action.MAIN`)
   - `com.razorpay.MagicXActivity` (exported="false")
   - `com.razorpay.DeeplinkActivity` (exported="true", intent-filter: `android.intent.action.VIEW` for scheme `razorpay` host `webphiser.com.test.series`)
   - `com.razorpay.UpiChooserSelectionReceiver` (exported="false")
3. **Google Sign-In / Play Services Activities & Services**:
   - `com.google.android.gms.auth.api.signin.internal.SignInHubActivity`
   - `com.google.android.gms.auth.api.signin.RevocationBoundService`
   - `com.google.android.gms.common.api.GoogleApiActivity`
4. **URL Launcher Activity**:
   - `io.flutter.plugins.urllauncher.WebViewActivity`
5. **Content Providers**:
   - `io.flutter.plugins.imagepicker.ImagePickerFileProvider` -> Authority: `webphiser.com.test.series.flutter.image_provider`
   - `com.crazecoder.openfile.FileProvider` -> Authority: `webphiser.com.test.series.fileProvider.com.crazecoder.openfile`
   - `dev.fluttercommunity.plus.share.ShareFileProvider` -> Authority: `webphiser.com.test.series.flutter.share_provider`
   - `androidx.startup.InitializationProvider` -> Authority: `webphiser.com.test.series.androidx-startup`
6. **Package Visibility Queries (`<queries>`)**:
   - `android.intent.action.PROCESS_TEXT` (`text/plain`)
   - `android.intent.action.VIEW` (`https`, `http`, `mailto`, `*/*`)
   - `android.intent.action.SENDTO` (`mailto`)
   - `android.intent.action.VIEW` (`upi://pay`, `credpay`)
   - `android.intent.action.SEND` (`*/*`)
   - `rzp.device_token.share`

---

### 1.3 Flutter Bundle & Assets (`assets/flutter_assets/`)
Directly observed inside the APK archive:
Total items in `assets/flutter_assets/`: 14 files.

| Asset Path in APK | File Size | MIME / Format | Dimensions | SHA-256 Checksum |
|---|---|---|---|---|
| `assets/flutter_assets/assets/icons/test_series_logo.jpeg` | 252,473 B | JPEG | 1169 x 1169 | `3a047525af5dbc85a5f74ef0ee2e3e6b34efd52e3c1d47c4a9980451a3e2b5e1` |
| `assets/flutter_assets/assets/icons/playstore.png` | 276,378 B | JPEG (stored as .png) | 512 x 512 | `e5f35071327aca54cd36f0252da3ae81894662d84b5fa7baf5a61ec10afeeeae` |
| `assets/flutter_assets/assets/icons/agnihotri_classes_logo.jpeg` | 152,999 B | JPEG | 1254 x 1254 | `6a27d1e156b90d2a1699a12f53b73d37b94a3e83d04a35511ef884a2f6fa71a7` |
| `assets/flutter_assets/assets/icons/aim_logo.png` | 153,296 B | JPEG (stored as .png) | 512 x 512 | `92b3c7db1362bbc880a0f0716f8b204791781e4af21054c82b2c2675494d011b` |
| `assets/flutter_assets/assets/icons/hj_education.png` | 227,782 B | JPEG (stored as .png) | 512 x 512 | `00b55bb9eb164c20afd04d767d63bcfaacd1510a5af60caa6b399605d5a859ce` |
| `assets/flutter_assets/fonts/MaterialIcons-Regular.otf` | 1,643,536 B | OpenType Font | N/A | Font family: `MaterialIcons` |
| `assets/flutter_assets/packages/cupertino_icons/assets/CupertinoIcons.ttf` | 283,292 B | TrueType Font | N/A | Font family: `packages/cupertino_icons/CupertinoIcons` |
| `assets/flutter_assets/packages/youtube_player_iframe/assets/player.html` | 6,095 B | HTML5 | N/A | Embedded YouTube iframe player web template |
| `assets/flutter_assets/shaders/ink_sparkle.frag` | 4,228 B | SPIR-V/GLSL | N/A | Flutter Material 3 ripple sparkle shader |
| `assets/flutter_assets/shaders/stretch_effect.frag` | 1,848 B | SPIR-V/GLSL | N/A | Flutter overscroll stretch effect shader |
| `assets/flutter_assets/AssetManifest.bin` | 437 B | StandardMessageCodec | N/A | Binary asset manifest |
| `assets/flutter_assets/FontManifest.json` | 179 B | JSON | N/A | Registered font manifest |
| `assets/flutter_assets/NativeAssetsManifest.json` | 44 B | JSON | N/A | `{"format-version":[1,0,0],"native-assets":{}}` |
| `assets/flutter_assets/NOTICES.Z` | 338,983 B (decompressed: 1,397,282 B) | GZIP | N/A | All open source package licenses |

#### Decoded `AssetManifest.bin`
Decoded via Flutter `StandardMessageCodec`:
```json
{
  "assets/icons/agnihotri_classes_logo.jpeg": [{"asset": "assets/icons/agnihotri_classes_logo.jpeg"}],
  "assets/icons/aim_logo.png": [{"asset": "assets/icons/aim_logo.png"}],
  "assets/icons/hj_education.png": [{"asset": "assets/icons/hj_education.png"}],
  "assets/icons/playstore.png": [{"asset": "assets/icons/playstore.png"}],
  "assets/icons/test_series_logo.jpeg": [{"asset": "assets/icons/test_series_logo.jpeg"}],
  "packages/cupertino_icons/assets/CupertinoIcons.ttf": [{"asset": "packages/cupertino_icons/assets/CupertinoIcons.ttf"}],
  "packages/youtube_player_iframe/assets/player.html": [{"asset": "packages/youtube_player_iframe/assets/player.html"}]
}
```

#### Decoded `FontManifest.json`
```json
[
  {"family": "MaterialIcons", "fonts": [{"asset": "fonts/MaterialIcons-Regular.otf"}]},
  {"family": "packages/cupertino_icons/CupertinoIcons", "fonts": [{"asset": "packages/cupertino_icons/assets/CupertinoIcons.ttf"}]}
]
```

---

### 1.4 Native Libraries & Engine Verification
The APK contains native libraries for three ABIs:
- `lib/arm64-v8a/`
- `lib/armeabi-v7a/`
- `lib/x86_64/`

Each ABI contains:
1. `libapp.so`: Flutter Dart AOT compiled snapshot
2. `libflutter.so`: Flutter Engine
   - Contains version indicator: `Dart 3.4 release. See https://dartbug.com/52121.`
   - Built with LLVM toolchain `Android (13624864, +pgo, +bolt, +lto, +mlgo, based on r530)`
3. `libdartjni.so`: Dart FFI / JNI bindings
4. `libdatastore_shared_counter.so`: Jetpack Datastore native counter
5. `libpdfium.cr.so` & `libpdfiumandroid.so`: Native PDF rendering engine for `flutter_pdfview`

---

### 1.5 Dart Symbols & Source Inventory (54 Modules)
Extracted from Dart snapshot strings in `libapp.so`:
- **Package Name**: `package:test_series`
- **Typography**: Uses `GoogleFonts.poppins` (`poppinsTextTheme`)
- **Backend API Base URL**: `https://edu.d3vx.in/test-series/api/mobile`
- **Modules**:
  - **Core (7)**: `core/api_client.dart`, `core/api_service.dart`, `core/media.dart`, `core/payment_service.dart`, `core/report_pdf.dart`, `core/screenshot_guard.dart`, `core/share_helper.dart`
  - **Root & Shell (4)**: `main.dart`, `router.dart`, `theme.dart`, `screens/shell.dart`
  - **Models (1)**: `models/models.dart` (Contains 30 entities)
  - **State (1)**: `state/auth_provider.dart`
  - **Widgets (7)**: `widgets/auth_scaffold.dart`, `widgets/category_grid.dart`, `widgets/common.dart`, `widgets/course_card.dart`, `widgets/otp_input.dart`, `widgets/skeleton.dart`, `widgets/watermark.dart`
  - **Screens (34)**:
    - Auth: `screens/splash_screen.dart`, `screens/onboarding/onboarding_screen.dart`, `screens/auth/login_screen.dart`, `screens/auth/register_screen.dart`, `screens/auth/forgot_password_screen.dart`
    - Home & Navigation: `screens/home/home_screen.dart`, `screens/legal/legal_screen.dart`, `screens/live/live_screen.dart`
    - Courses: `screens/courses/all_courses_screen.dart`, `screens/courses/course_detail_screen.dart`, `screens/courses/my_courses_screen.dart`, `screens/video/video_player_screen.dart`
    - Test Series & CBT Quiz: `screens/test_series/test_series_screen.dart`, `screens/test_series/test_series_detail_screen.dart`, `screens/quiz/quiz_player_screen.dart`, `screens/quiz/quiz_result_screen.dart`, `screens/quiz/attempt_report_screen.dart`, `screens/quiz/free_quizzes_screen.dart`, `screens/quiz/my_performance_screen.dart`, `screens/quiz/previous_results.dart`, `screens/quiz/certificate_screen.dart`, `screens/quiz/focus_areas.dart`, `screens/quiz/quiz_ui.dart`, `screens/quiz/report_widgets.dart`
    - Community & Doubts: `screens/doubt/doubt_screen.dart`, `screens/doubt/doubt_detail_screen.dart`, `screens/community/community_screen.dart`, `screens/ai/ai_chat_screen.dart`
    - Resources & Content: `screens/resources/ebooks_screen.dart`, `screens/resources/resource_list_screen.dart`, `screens/content/content_viewer_screen.dart`
    - Profile & Payment: `screens/profile/profile_screen.dart`, `screens/profile/edit_profile_screen.dart`, `screens/payment/payment_screen.dart`

---

## 2. Logic Chain

1. **ZIP Inspection & Extraction**:
   - Running Python ZipFile inspection confirmed `Test Series.apk` is an unencrypted standard Android APK archive.
   - Flutter stores all application-level bundled assets inside `assets/flutter_assets/`.
   - Inspection revealed exactly 5 application branding images located under `assets/flutter_assets/assets/icons/`.

2. **Asset Manifest Mapping**:
   - Decoding `AssetManifest.bin` verified that only the 5 image assets, Cupertino icons font, and YouTube player HTML template are registered in the Flutter asset bundle.
   - Analysis of image headers verified that all 5 images (`agnihotri_classes_logo.jpeg`, `aim_logo.png`, `hj_education.png`, `playstore.png`, `test_series_logo.jpeg`) are valid JPEG bitmaps (even those with `.png` extensions), with resolutions suitable for high-DPI splash and card rendering.

3. **Android Configuration & Compatibility**:
   - `aapt badging` and `aapt dump xmltree` verified the exact package identifier `webphiser.com.test.series` and SDK targets (minSdk=24, targetSdk=36).
   - Package visibility (`<queries>`) declarations in `AndroidManifest.xml` are critical for Android 11+ to permit UPI payment intents (`upi://pay`, `credpay`) and URL opening (`https`, `http`, `mailto`).
   - FileProvider authorities require the exact format `${applicationId}.flutter.image_provider`, `${applicationId}.fileProvider.com.crazecoder.openfile`, and `${applicationId}.flutter.share_provider` to avoid conflicts during image capture, PDF opening, and report sharing.

4. **Engine & Dependency Alignment**:
   - `libflutter.so` confirmed the original APK was compiled with Dart 3.4 (Flutter 3.22.x).
   - Decompressing `NOTICES.Z` and scanning `classes.dex` and `libapp.so` provided the complete set of required pub packages (`dio`, `provider`, `go_router`, `google_fonts`, `razorpay_flutter`, `youtube_player_iframe`, `flutter_pdfview`, `open_filex`, `shared_preferences`, `sqflite`, `shimmer`, `carousel_slider`, `share_plus`, `image_picker`).
   - The local build environment is equipped with Flutter 3.41.1 / Dart 3.11.0, which fully supports Dart 3 null-safety and all required plugin APIs.

---

## 3. Caveats

- **Adaptive Icon Obfuscation**: The launcher icon in `res/BW.xml` references compiled binary XML drawables flattened by R8. However, `assets/icons/test_series_logo.jpeg` (1169x1169) provides high-resolution source artwork that can directly generate `ic_launcher` via `flutter_launcher_icons`.
- **Backend Availability**: The live backend host `https://edu.d3vx.in` was identified in `libapp.so`. Reconstructed services must include robust fallback / mock modes to guarantee offline testability if the external server is unreachable.
- **Razorpay Testing**: Production Razorpay credentials cannot be extracted from Dart bytecode; a configurable test Key ID or mock payment flow must be supported in `payment_service.dart`.

---

## 4. Conclusion

1. **Exact Assets to Extract**:
   The following 5 image assets must be extracted from `c:\Users\hp\Desktop\course app\Test Series.apk` into the new project's `assets/icons/` folder:
   - `assets/flutter_assets/assets/icons/test_series_logo.jpeg` -> `assets/icons/test_series_logo.jpeg`
   - `assets/flutter_assets/assets/icons/playstore.png` -> `assets/icons/playstore.png`
   - `assets/flutter_assets/assets/icons/agnihotri_classes_logo.jpeg` -> `assets/icons/agnihotri_classes_logo.jpeg`
   - `assets/flutter_assets/assets/icons/aim_logo.png` -> `assets/icons/aim_logo.png`
   - `assets/flutter_assets/assets/icons/hj_education.png` -> `assets/icons/hj_education.png`

2. **Android Configuration Requirements**:
   - **Application ID**: `webphiser.com.test.series`
   - **Min SDK**: `24`
   - **Target SDK**: `34` or `36`
   - **Permissions Required**: `INTERNET`, `ACCESS_NETWORK_STATE`, `READ_EXTERNAL_STORAGE` (maxSdkVersion=32)
   - **Queries Element**: Must include `https`, `http`, `mailto`, `upi://pay`, `credpay`
   - **Content Providers**: Setup FileProviders for image picker, open_filex, and share_plus

3. **Flutter Configuration Requirements**:
   - `pubspec.yaml` assets configuration:
     ```yaml
     flutter:
       uses-material-design: true
       assets:
         - assets/icons/
     ```
   - Font dependency: `google_fonts: ^6.2.1` with `GoogleFonts.poppinsTextTheme()`

---

## 5. Verification Method

To independently verify these findings, execute the following commands in PowerShell:

1. **Verify Asset Presence and Extraction**:
   ```powershell
   python -c "
   import zipfile
   with zipfile.ZipFile(r'c:\Users\hp\Desktop\course app\Test Series.apk', 'r') as z:
       for f in z.namelist():
           if 'assets/flutter_assets/assets/icons' in f:
               print(f, z.getinfo(f).file_size)
   "
   ```

2. **Verify Manifest Badging & Package Name**:
   ```powershell
   & "$env:LOCALAPPDATA\Android\Sdk\build-tools\34.0.0\aapt.exe" dump badging "c:\Users\hp\Desktop\course app\Test Series.apk" | Select-String "package: name="
   ```

3. **Verify API Base URL in Compiled Binary**:
   ```powershell
   python -c "
   import zipfile
   with zipfile.ZipFile(r'c:\Users\hp\Desktop\course app\Test Series.apk', 'r') as z:
       data = z.read('lib/arm64-v8a/libapp.so')
       print('URL found:', b'https://edu.d3vx.in/test-series/api/mobile' in data)
   "
   ```
