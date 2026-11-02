# Worker Dispatch - Milestone M5 (Home Dashboard, Courses & Video Player)

## Task
You are Worker 5 (`teamwork_worker`).
Your goal is to implement Milestone M5:
1. Implement `lib/widgets/course_card.dart`:
   - Visual card with course thumbnail (using `cached_network_image` with asset/placeholder fallback), course title, category badge, rating, lesson count, price/free badge, and optional progress indicator.
2. Implement `lib/widgets/category_grid.dart`:
   - Interactive subject/category grid (NEET, JEE, Physics, Chemistry, Biology, Mathematics) with icon chips and category filter callbacks.
3. Implement `lib/screens/home/home_screen.dart`:
   - Student header greeting with target exam badge.
   - Banner carousel slider (`carousel_slider: ^5.0.0`) with interactive dots.
   - Quick action shortcuts (Free Quizzes, Video Courses, Test Series, Doubts, Ebooks).
   - Subject categories grid (`CategoryGrid`).
   - Featured Test Series section with test cards.
   - Popular Courses section with `CourseCard`.
   - Pull-to-refresh calling `ApiService.getHomeFeed()`.
4. Implement `lib/screens/courses/all_courses_screen.dart`:
   - Search bar with live query filtering.
   - Category filter chips.
   - Responsive grid of `CourseCard` items.
5. Implement `lib/screens/courses/course_detail_screen.dart`:
   - Hero header with course thumbnail/video preview, instructor details, price & enroll button.
   - Syllabus accordion with `CourseFolder` chapters and `Lesson` items.
   - Lesson click opens `VideoPlayerScreen`.
6. Implement `lib/screens/courses/my_courses_screen.dart`:
   - Student's enrolled courses with progress bar and continue learning button.
7. Implement `lib/screens/video/video_player_screen.dart`:
   - `youtube_player_iframe: ^5.2.1` player controller with aspect ratio 16:9, fullscreen toggle, and desktop fallback container.
   - Lesson title, description, downloadable lesson PDF resources, and lesson playlist drawer.
8. Wire routes in `lib/router.dart`:
   - `/courses/:id`, `/video-player`, `/my-courses`.
9. Implement widget tests in `test/widget/home_courses_test.dart`:
   - Test home screen banner rendering, category grid interaction, course card layout, and course detail syllabus display.
10. Run `flutter analyze` and `flutter test` to ensure 0 errors.

## MANDATORY INTEGRITY WARNING
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Working Directory: c:\Users\hp\Desktop\course app\.agents\teamwork\worker_m5\
Original Request: c:\Users\hp\Desktop\course app\.agents\teamwork\ORIGINAL_REQUEST.md
PROJECT.md: c:\Users\hp\Desktop\course app\.agents\teamwork\PROJECT.md
Architecture Reference: c:\Users\hp\Desktop\course app\.agents\teamwork\explorer_survey_2\handoff.md

Produce: `handoff.md` with implementation details, test outputs, and verification methods.


## 2026-10-31T15:49:24Z
[Message] timestamp=2026-10-31T15:49:24Z sender=8092c7f4-4ee8-467e-9537-6793388cfe6d priority=MESSAGE_PRIORITY_HIGH content=You are Worker 5 (Home Feed & Video Specialist).
Implement Milestone M5:
1. `lib/widgets/course_card.dart`
2. `lib/widgets/category_grid.dart`
3. `lib/screens/home/home_screen.dart`
4. `lib/screens/courses/all_courses_screen.dart`
5. `lib/screens/courses/course_detail_screen.dart`
6. `lib/screens/courses/my_courses_screen.dart`
7. `lib/screens/video/video_player_screen.dart`
8. Wire routes in `lib/router.dart` (`/courses/:id`, `/video-player`, `/my-courses`).
9. Widget tests in `test/widget/home_courses_test.dart`.
10. Run `flutter analyze` and `flutter test` to ensure 0 errors.
