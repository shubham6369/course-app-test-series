// Domain models for the Test Series Application
// Consolidated 30+ domain models with manual JSON serialization

// 1. Student / User Model
class Student {
  final int id;
  final String name;
  final String email;
  final String phone;
  final String? avatarUrl;
  final String? classId;
  final String? targetExam;
  final String? token;
  final DateTime? createdAt;

  Student({
    required this.id,
    required this.name,
    required this.email,
    required this.phone,
    this.avatarUrl,
    this.classId,
    this.targetExam,
    this.token,
    this.createdAt,
  });

  Student copyWith({
    int? id,
    String? name,
    String? email,
    String? phone,
    String? avatarUrl,
    String? classId,
    String? targetExam,
    String? token,
    DateTime? createdAt,
  }) => Student(
    id: id ?? this.id,
    name: name ?? this.name,
    email: email ?? this.email,
    phone: phone ?? this.phone,
    avatarUrl: avatarUrl ?? this.avatarUrl,
    classId: classId ?? this.classId,
    targetExam: targetExam ?? this.targetExam,
    token: token ?? this.token,
    createdAt: createdAt ?? this.createdAt,
  );

  factory Student.fromJson(Map<String, dynamic> json) => Student(
    id: (json['id'] is num)
        ? (json['id'] as num).toInt()
        : int.tryParse(json['id']?.toString() ?? '') ?? 0,
    name: json['name'] as String? ?? '',
    email: json['email'] as String? ?? '',
    phone: json['phone'] as String? ?? '',
    avatarUrl: json['avatar_url'] as String?,
    classId: json['class_id']?.toString(),
    targetExam: json['target_exam'] as String?,
    token: json['token'] as String?,
    createdAt: json['created_at'] != null ? DateTime.tryParse(json['created_at'].toString()) : null,
  );

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'email': email,
    'phone': phone,
    'avatar_url': avatarUrl,
    'class_id': classId,
    'target_exam': targetExam,
    'token': token,
    'created_at': createdAt?.toIso8601String(),
  };

  @override
  String toString() => 'Student(id: $id, name: $name, phone: $phone, email: $email)';
}

// 2. Banner Item
class BannerItem {
  final int id;
  final String title;
  final String? subtitle;
  final String imageUrl;
  final String? actionType;
  final String? actionValue;
  final int order;

  BannerItem({
    required this.id,
    required this.title,
    this.subtitle,
    required this.imageUrl,
    this.actionType,
    this.actionValue,
    this.order = 0,
  });

  factory BannerItem.fromJson(Map<String, dynamic> json) => BannerItem(
    id: json['id'] as int? ?? 0,
    title: json['title'] as String? ?? '',
    subtitle: json['subtitle'] as String?,
    imageUrl: json['image_url'] as String? ?? '',
    actionType: json['action_type'] as String?,
    actionValue: json['action_value'] as String?,
    order: json['order'] as int? ?? 0,
  );

  Map<String, dynamic> toJson() => {
    'id': id,
    'title': title,
    if (subtitle != null) 'subtitle': subtitle,
    'image_url': imageUrl,
    'action_type': actionType,
    'action_value': actionValue,
    'order': order,
  };
}

// 3. Home Feed Aggregated Model
class HomeFeed {
  final List<BannerItem> banners;
  final List<Map<String, dynamic>> categories;
  final List<TestSeriesSummary> featuredTestSeries;
  final List<Course> popularCourses;
  final List<QuizSummary> freeQuizzes;
  final List<AttemptSummary> recentAttempts;

  HomeFeed({
    required this.banners,
    required this.categories,
    required this.featuredTestSeries,
    required this.popularCourses,
    required this.freeQuizzes,
    required this.recentAttempts,
  });

  factory HomeFeed.empty() => HomeFeed(
    banners: [],
    categories: [],
    featuredTestSeries: [],
    popularCourses: [],
    freeQuizzes: [],
    recentAttempts: [],
  );

  factory HomeFeed.fromJson(Map<String, dynamic> json) => HomeFeed(
    banners: (json['banners'] as List? ?? []).map((e) => BannerItem.fromJson(Map<String, dynamic>.from(e as Map))).toList(),
    categories: (json['categories'] as List? ?? []).map((e) => Map<String, dynamic>.from(e as Map)).toList(),
    featuredTestSeries: (json['featured_test_series'] as List? ?? []).map((e) => TestSeriesSummary.fromJson(Map<String, dynamic>.from(e as Map))).toList(),
    popularCourses: (json['popular_courses'] as List? ?? []).map((e) => Course.fromJson(Map<String, dynamic>.from(e as Map))).toList(),
    freeQuizzes: (json['free_quizzes'] as List? ?? []).map((e) => QuizSummary.fromJson(Map<String, dynamic>.from(e as Map))).toList(),
    recentAttempts: (json['recent_attempts'] as List? ?? []).map((e) => AttemptSummary.fromJson(Map<String, dynamic>.from(e as Map))).toList(),
  );

  Map<String, dynamic> toJson() => {
    'banners': banners.map((e) => e.toJson()).toList(),
    'categories': categories,
    'featured_test_series': featuredTestSeries.map((e) => e.toJson()).toList(),
    'popular_courses': popularCourses.map((e) => e.toJson()).toList(),
    'free_quizzes': freeQuizzes.map((e) => e.toJson()).toList(),
    'recent_attempts': recentAttempts.map((e) => e.toJson()).toList(),
  };
}

// 4. Course Folder
class CourseFolder {
  final int id;
  final int courseId;
  final String title;
  final int order;
  final List<Lesson> lessons;

  CourseFolder({
    required this.id,
    required this.courseId,
    required this.title,
    this.order = 0,
    required this.lessons,
  });

  factory CourseFolder.fromJson(Map<String, dynamic> json) => CourseFolder(
    id: json['id'] as int? ?? 0,
    courseId: json['course_id'] as int? ?? 0,
    title: json['title'] as String? ?? '',
    order: json['order'] as int? ?? 0,
    lessons: (json['lessons'] as List? ?? []).map((e) => Lesson.fromJson(Map<String, dynamic>.from(e as Map))).toList(),
  );

  Map<String, dynamic> toJson() => {
    'id': id,
    'course_id': courseId,
    'title': title,
    'order': order,
    'lessons': lessons.map((e) => e.toJson()).toList(),
  };
}

// 5. Course Model
class Course {
  final int id;
  final String title;
  final String slug;
  final String? description;
  final String? thumbnailUrl;
  final double price;
  final double? discountPrice;
  final bool isEnrolled;
  final int totalLessons;
  final int totalDurationMinutes;
  final String? instructorName;
  final List<CourseFolder>? folders;

  Course({
    required this.id,
    required this.title,
    required this.slug,
    this.description,
    this.thumbnailUrl,
    required this.price,
    this.discountPrice,
    this.isEnrolled = false,
    this.totalLessons = 0,
    this.totalDurationMinutes = 0,
    this.instructorName,
    this.folders,
  });

  factory Course.fromJson(Map<String, dynamic> json) => Course(
    id: json['id'] as int? ?? 0,
    title: json['title'] as String? ?? '',
    slug: json['slug'] as String? ?? '',
    description: json['description'] as String?,
    thumbnailUrl: json['thumbnail_url'] as String?,
    price: (json['price'] as num? ?? 0.0).toDouble(),
    discountPrice: (json['discount_price'] as num?)?.toDouble(),
    isEnrolled: json['is_enrolled'] as bool? ?? false,
    totalLessons: json['total_lessons'] as int? ?? 0,
    totalDurationMinutes: json['total_duration_minutes'] as int? ?? 0,
    instructorName: json['instructor_name'] as String?,
    folders: (json['folders'] as List?)?.map((e) => CourseFolder.fromJson(Map<String, dynamic>.from(e as Map))).toList(),
  );

  Map<String, dynamic> toJson() => {
    'id': id,
    'title': title,
    'slug': slug,
    'description': description,
    'thumbnail_url': thumbnailUrl,
    'price': price,
    'discount_price': discountPrice,
    'is_enrolled': isEnrolled,
    'total_lessons': totalLessons,
    'total_duration_minutes': totalDurationMinutes,
    'instructor_name': instructorName,
    if (folders != null) 'folders': folders!.map((e) => e.toJson()).toList(),
  };
}

// 6. Lesson Model
class Lesson {
  final int id;
  final int folderId;
  final String title;
  final String? description;
  final String videoId;
  final int durationMinutes;
  final bool isFreePreview;
  final int order;
  final String? pdfUrl;

  Lesson({
    required this.id,
    required this.folderId,
    required this.title,
    this.description,
    required this.videoId,
    this.durationMinutes = 0,
    this.isFreePreview = false,
    this.order = 0,
    this.pdfUrl,
  });

  factory Lesson.fromJson(Map<String, dynamic> json) => Lesson(
    id: json['id'] as int? ?? 0,
    folderId: json['folder_id'] as int? ?? 0,
    title: json['title'] as String? ?? '',
    description: json['description'] as String?,
    videoId: json['video_id'] as String? ?? '',
    durationMinutes: json['duration_minutes'] as int? ?? 0,
    isFreePreview: json['is_free_preview'] as bool? ?? false,
    order: json['order'] as int? ?? 0,
    pdfUrl: json['pdf_url'] as String?,
  );

  Map<String, dynamic> toJson() => {
    'id': id,
    'folder_id': folderId,
    'title': title,
    'description': description,
    'video_id': videoId,
    'duration_minutes': durationMinutes,
    'is_free_preview': isFreePreview,
    'order': order,
    'pdf_url': pdfUrl,
  };
}

// 7. Video Comment
class VideoComment {
  final int id;
  final int lessonId;
  final int studentId;
  final String studentName;
  final String? studentAvatar;
  final String comment;
  final DateTime createdAt;
  final int likesCount;
  final bool isTeacherReply;
  final String? videoId;

  VideoComment({
    required this.id,
    this.lessonId = 0,
    this.studentId = 0,
    required this.studentName,
    this.studentAvatar,
    required this.comment,
    required this.createdAt,
    this.likesCount = 0,
    this.isTeacherReply = false,
    this.videoId,
  });

  factory VideoComment.fromJson(Map<String, dynamic> json) => VideoComment(
    id: json['id'] as int? ?? 0,
    lessonId: json['lesson_id'] as int? ?? 0,
    studentId: json['student_id'] as int? ?? 0,
    studentName: json['student_name'] as String? ?? '',
    studentAvatar: json['student_avatar'] as String?,
    comment: json['comment'] as String? ?? '',
    createdAt: DateTime.tryParse(json['created_at']?.toString() ?? '') ?? DateTime.now(),
    likesCount: json['likes_count'] as int? ?? 0,
    isTeacherReply: json['is_teacher_reply'] as bool? ?? false,
    videoId: json['video_id'] as String?,
  );

  Map<String, dynamic> toJson() => {
    'id': id,
    'lesson_id': lessonId,
    'student_id': studentId,
    'student_name': studentName,
    'student_avatar': studentAvatar,
    'comment': comment,
    'created_at': createdAt.toIso8601String(),
    'likes_count': likesCount,
    'is_teacher_reply': isTeacherReply,
    if (videoId != null) 'video_id': videoId,
  };
}

// 8. Test Series Summary
class TestSeriesSummary {
  final int id;
  final String title;
  final String? category;
  final String? thumbnailUrl;
  final int totalTests;
  final int freeTests;
  final double price;
  final double? discountPrice;
  final bool isPurchased;
  final int validityDays;

  TestSeriesSummary({
    required this.id,
    required this.title,
    this.category,
    this.thumbnailUrl,
    this.totalTests = 0,
    this.freeTests = 0,
    required this.price,
    this.discountPrice,
    this.isPurchased = false,
    this.validityDays = 365,
  });

  factory TestSeriesSummary.fromJson(Map<String, dynamic> json) => TestSeriesSummary(
    id: json['id'] as int? ?? 0,
    title: json['title'] as String? ?? '',
    category: json['category'] as String?,
    thumbnailUrl: json['thumbnail_url'] as String?,
    totalTests: json['total_tests'] as int? ?? 0,
    freeTests: json['free_tests'] as int? ?? 0,
    price: (json['price'] as num? ?? 0.0).toDouble(),
    discountPrice: (json['discount_price'] as num?)?.toDouble(),
    isPurchased: json['is_purchased'] as bool? ?? false,
    validityDays: json['validity_days'] as int? ?? 365,
  );

  Map<String, dynamic> toJson() => {
    'id': id,
    'title': title,
    'category': category,
    'thumbnail_url': thumbnailUrl,
    'total_tests': totalTests,
    'free_tests': freeTests,
    'price': price,
    'discount_price': discountPrice,
    'is_purchased': isPurchased,
    'validity_days': validityDays,
  };
}

// 9. Test Series Detail
class TestSeriesDetail {
  final int id;
  final String title;
  final String? description;
  final String? category;
  final String? thumbnailUrl;
  final double price;
  final double? discountPrice;
  final bool isPurchased;
  final int validityDays;
  final List<SeriesQuiz> quizzes;

  TestSeriesDetail({
    required this.id,
    required this.title,
    this.description,
    this.category,
    this.thumbnailUrl,
    required this.price,
    this.discountPrice,
    this.isPurchased = false,
    this.validityDays = 365,
    required this.quizzes,
  });

  factory TestSeriesDetail.fromJson(Map<String, dynamic> json) => TestSeriesDetail(
    id: json['id'] as int? ?? 0,
    title: json['title'] as String? ?? '',
    description: json['description'] as String?,
    category: json['category'] as String?,
    thumbnailUrl: json['thumbnail_url'] as String?,
    price: (json['price'] as num? ?? 0.0).toDouble(),
    discountPrice: (json['discount_price'] as num?)?.toDouble(),
    isPurchased: json['is_purchased'] as bool? ?? false,
    validityDays: json['validity_days'] as int? ?? 365,
    quizzes: (json['quizzes'] as List? ?? []).map((e) => SeriesQuiz.fromJson(Map<String, dynamic>.from(e as Map))).toList(),
  );

  Map<String, dynamic> toJson() => {
    'id': id,
    'title': title,
    'description': description,
    'category': category,
    'thumbnail_url': thumbnailUrl,
    'price': price,
    'discount_price': discountPrice,
    'is_purchased': isPurchased,
    'validity_days': validityDays,
    'quizzes': quizzes.map((e) => e.toJson()).toList(),
  };
}

// 10. Series Quiz
class SeriesQuiz {
  final int id;
  final int testSeriesId;
  final String title;
  final int durationMinutes;
  final int totalQuestions;
  final double totalMarks;
  final bool isFree;
  final bool isLocked;
  final bool isAttempted;
  final int? bestScore;
  final int? maxAttempts;
  final int attemptsTaken;

  SeriesQuiz({
    required this.id,
    required this.testSeriesId,
    required this.title,
    required this.durationMinutes,
    required this.totalQuestions,
    required this.totalMarks,
    this.isFree = false,
    this.isLocked = false,
    this.isAttempted = false,
    this.bestScore,
    this.maxAttempts,
    this.attemptsTaken = 0,
  });

  factory SeriesQuiz.fromJson(Map<String, dynamic> json) => SeriesQuiz(
    id: json['id'] as int? ?? 0,
    testSeriesId: json['test_series_id'] as int? ?? 0,
    title: json['title'] as String? ?? '',
    durationMinutes: json['duration_minutes'] as int? ?? 0,
    totalQuestions: json['total_questions'] as int? ?? 0,
    totalMarks: (json['total_marks'] as num? ?? 0.0).toDouble(),
    isFree: json['is_free'] as bool? ?? false,
    isLocked: json['is_locked'] as bool? ?? false,
    isAttempted: json['is_attempted'] as bool? ?? false,
    bestScore: json['best_score'] as int?,
    maxAttempts: json['max_attempts'] as int?,
    attemptsTaken: json['attempts_taken'] as int? ?? 0,
  );

  Map<String, dynamic> toJson() => {
    'id': id,
    'test_series_id': testSeriesId,
    'title': title,
    'duration_minutes': durationMinutes,
    'total_questions': totalQuestions,
    'total_marks': totalMarks,
    'is_free': isFree,
    'is_locked': isLocked,
    'is_attempted': isAttempted,
    'best_score': bestScore,
    'max_attempts': maxAttempts,
    'attempts_taken': attemptsTaken,
  };
}

// 11. Quiz Summary
class QuizSummary {
  final int id;
  final String title;
  final String? subject;
  final int durationMinutes;
  final int totalQuestions;
  final double totalMarks;
  final bool isAttempted;

  QuizSummary({
    required this.id,
    required this.title,
    this.subject,
    required this.durationMinutes,
    required this.totalQuestions,
    required this.totalMarks,
    this.isAttempted = false,
  });

  factory QuizSummary.fromJson(Map<String, dynamic> json) => QuizSummary(
    id: json['id'] as int? ?? 0,
    title: json['title'] as String? ?? '',
    subject: json['subject'] as String?,
    durationMinutes: json['duration_minutes'] as int? ?? 0,
    totalQuestions: json['total_questions'] as int? ?? 0,
    totalMarks: (json['total_marks'] as num? ?? 0.0).toDouble(),
    isAttempted: json['is_attempted'] as bool? ?? false,
  );

  Map<String, dynamic> toJson() => {
    'id': id,
    'title': title,
    'subject': subject,
    'duration_minutes': durationMinutes,
    'total_questions': totalQuestions,
    'total_marks': totalMarks,
    'is_attempted': isAttempted,
  };
}

// 12. Quiz Paper (Loaded Exam)
class QuizPaper {
  final int id;
  final String title;
  final int durationMinutes;
  final double totalMarks;
  final double negativeMarks;
  final List<String> instructions;
  final List<QuizQuestion> questions;

  QuizPaper({
    required this.id,
    required this.title,
    required this.durationMinutes,
    required this.totalMarks,
    this.negativeMarks = 0.0,
    this.instructions = const [],
    required this.questions,
  });

  factory QuizPaper.fromJson(Map<String, dynamic> json) => QuizPaper(
    id: json['id'] as int? ?? 0,
    title: json['title'] as String? ?? '',
    durationMinutes: json['duration_minutes'] as int? ?? 0,
    totalMarks: (json['total_marks'] as num? ?? 0.0).toDouble(),
    negativeMarks: (json['negative_marks'] as num? ?? 0.0).toDouble(),
    instructions: (json['instructions'] as List? ?? []).cast<String>(),
    questions: (json['questions'] as List? ?? []).map((e) => QuizQuestion.fromJson(Map<String, dynamic>.from(e as Map))).toList(),
  );

  Map<String, dynamic> toJson() => {
    'id': id,
    'title': title,
    'duration_minutes': durationMinutes,
    'total_marks': totalMarks,
    'negative_marks': negativeMarks,
    'instructions': instructions,
    'questions': questions.map((e) => e.toJson()).toList(),
  };
}

// 13. Quiz Question
class QuizQuestion {
  final int id;
  final int questionNumber;
  final String questionText;
  final String? questionImageUrl;
  final List<String> options;
  final List<String>? optionImages;
  final int? correctOption;
  final String? explanation;
  final String? subject;
  final String? topic;
  final double marks;
  final double negativeMarks;

  QuizQuestion({
    required this.id,
    required this.questionNumber,
    required this.questionText,
    this.questionImageUrl,
    required this.options,
    this.optionImages,
    this.correctOption,
    this.explanation,
    this.subject,
    this.topic,
    this.marks = 1.0,
    this.negativeMarks = 0.25,
  });

  factory QuizQuestion.fromJson(Map<String, dynamic> json) => QuizQuestion(
    id: json['id'] as int? ?? 0,
    questionNumber: json['question_number'] as int? ?? 0,
    questionText: json['question_text'] as String? ?? '',
    questionImageUrl: json['question_image_url'] as String?,
    options: (json['options'] as List? ?? []).map((e) => e.toString()).toList(),
    optionImages: (json['option_images'] as List?)?.map((e) => e.toString()).toList(),
    correctOption: json['correct_option'] as int?,
    explanation: json['explanation'] as String?,
    subject: json['subject'] as String?,
    topic: json['topic'] as String?,
    marks: (json['marks'] as num? ?? 1.0).toDouble(),
    negativeMarks: (json['negative_marks'] as num? ?? 0.0).toDouble(),
  );

  Map<String, dynamic> toJson() => {
    'id': id,
    'question_number': questionNumber,
    'question_text': questionText,
    'question_image_url': questionImageUrl,
    'options': options,
    'option_images': optionImages,
    'correct_option': correctOption,
    'explanation': explanation,
    'subject': subject,
    'topic': topic,
    'marks': marks,
    'negative_marks': negativeMarks,
  };
}

// 14. Quiz Result
class QuizResult {
  final int attemptId;
  final int quizId;
  final String quizTitle;
  final double score;
  final double totalMarks;
  final int correctAnswers;
  final int incorrectAnswers;
  final int unattempted;
  final double accuracy;
  final int timeTakenSeconds;
  final int rank;
  final int totalParticipants;
  final double percentile;
  final bool isPassed;
  final String? certificateUrl;

  QuizResult({
    required this.attemptId,
    required this.quizId,
    required this.quizTitle,
    required this.score,
    required this.totalMarks,
    required this.correctAnswers,
    required this.incorrectAnswers,
    required this.unattempted,
    required this.accuracy,
    required this.timeTakenSeconds,
    this.rank = 1,
    this.totalParticipants = 1,
    this.percentile = 100.0,
    this.isPassed = true,
    this.certificateUrl,
  });

  factory QuizResult.fromJson(Map<String, dynamic> json) => QuizResult(
    attemptId: json['attempt_id'] as int? ?? 0,
    quizId: json['quiz_id'] as int? ?? 0,
    quizTitle: json['quiz_title'] as String? ?? '',
    score: (json['score'] as num? ?? 0.0).toDouble(),
    totalMarks: (json['total_marks'] as num? ?? 0.0).toDouble(),
    correctAnswers: json['correct_answers'] as int? ?? 0,
    incorrectAnswers: json['incorrect_answers'] as int? ?? 0,
    unattempted: json['unattempted'] as int? ?? 0,
    accuracy: (json['accuracy'] as num? ?? 0.0).toDouble(),
    timeTakenSeconds: json['time_taken_seconds'] as int? ?? 0,
    rank: json['rank'] as int? ?? 1,
    totalParticipants: json['total_participants'] as int? ?? 1,
    percentile: (json['percentile'] as num? ?? 100.0).toDouble(),
    isPassed: json['is_passed'] as bool? ?? true,
    certificateUrl: json['certificate_url'] as String?,
  );

  Map<String, dynamic> toJson() => {
    'attempt_id': attemptId,
    'quiz_id': quizId,
    'quiz_title': quizTitle,
    'score': score,
    'total_marks': totalMarks,
    'correct_answers': correctAnswers,
    'incorrect_answers': incorrectAnswers,
    'unattempted': unattempted,
    'accuracy': accuracy,
    'time_taken_seconds': timeTakenSeconds,
    'rank': rank,
    'total_participants': totalParticipants,
    'percentile': percentile,
    'is_passed': isPassed,
    'certificate_url': certificateUrl,
  };
}

// 15. Quiz Attempt Summary
class QuizAttemptSummary {
  final int id;
  final int quizId;
  final String quizTitle;
  final double score;
  final double totalMarks;
  final double accuracy;
  final DateTime completedAt;

  QuizAttemptSummary({
    required this.id,
    required this.quizId,
    required this.quizTitle,
    required this.score,
    required this.totalMarks,
    required this.accuracy,
    required this.completedAt,
  });

  factory QuizAttemptSummary.fromJson(Map<String, dynamic> json) => QuizAttemptSummary(
    id: json['id'] as int? ?? 0,
    quizId: json['quiz_id'] as int? ?? 0,
    quizTitle: json['quiz_title'] as String? ?? '',
    score: (json['score'] as num? ?? 0.0).toDouble(),
    totalMarks: (json['total_marks'] as num? ?? 0.0).toDouble(),
    accuracy: (json['accuracy'] as num? ?? 0.0).toDouble(),
    completedAt: DateTime.tryParse(json['completed_at']?.toString() ?? '') ?? DateTime.now(),
  );

  Map<String, dynamic> toJson() => {
    'id': id,
    'quiz_id': quizId,
    'quiz_title': quizTitle,
    'score': score,
    'total_marks': totalMarks,
    'accuracy': accuracy,
    'completed_at': completedAt.toIso8601String(),
  };
}

// 16. Attempt Summary
class AttemptSummary {
  final int attemptId;
  final int quizId;
  final String title;
  final double score;
  final double totalMarks;
  final DateTime date;

  AttemptSummary({
    required this.attemptId,
    required this.quizId,
    required this.title,
    required this.score,
    required this.totalMarks,
    required this.date,
  });

  factory AttemptSummary.fromJson(Map<String, dynamic> json) => AttemptSummary(
    attemptId: json['attempt_id'] as int? ?? 0,
    quizId: json['quiz_id'] as int? ?? 0,
    title: json['title'] as String? ?? '',
    score: (json['score'] as num? ?? 0.0).toDouble(),
    totalMarks: (json['total_marks'] as num? ?? 0.0).toDouble(),
    date: DateTime.tryParse(json['date']?.toString() ?? '') ?? DateTime.now(),
  );

  Map<String, dynamic> toJson() => {
    'attempt_id': attemptId,
    'quiz_id': quizId,
    'title': title,
    'score': score,
    'total_marks': totalMarks,
    'date': date.toIso8601String(),
  };
}

// 17. Question Review
class QuestionReview {
  final QuizQuestion question;
  final int? selectedOption;
  final bool isCorrect;
  final int timeSpentSeconds;
  final bool markedForReview;

  QuestionReview({
    required this.question,
    this.selectedOption,
    required this.isCorrect,
    this.timeSpentSeconds = 0,
    this.markedForReview = false,
  });

  factory QuestionReview.fromJson(Map<String, dynamic> json) => QuestionReview(
    question: QuizQuestion.fromJson(Map<String, dynamic>.from(json['question'] as Map)),
    selectedOption: json['selected_option'] as int?,
    isCorrect: json['is_correct'] as bool? ?? false,
    timeSpentSeconds: json['time_spent_seconds'] as int? ?? 0,
    markedForReview: json['marked_for_review'] as bool? ?? false,
  );

  Map<String, dynamic> toJson() => {
    'question': question.toJson(),
    'selected_option': selectedOption,
    'is_correct': isCorrect,
    'time_spent_seconds': timeSpentSeconds,
    'marked_for_review': markedForReview,
  };
}

// 18. Focus Area
class FocusArea {
  final String topic;
  final String subject;
  final double accuracyPercentage;
  final int questionsAttempted;
  final String status;

  FocusArea({
    required this.topic,
    required this.subject,
    required this.accuracyPercentage,
    required this.questionsAttempted,
    required this.status,
  });

  factory FocusArea.fromJson(Map<String, dynamic> json) => FocusArea(
    topic: json['topic'] as String? ?? '',
    subject: json['subject'] as String? ?? '',
    accuracyPercentage: (json['accuracy_percentage'] as num? ?? 0.0).toDouble(),
    questionsAttempted: json['questions_attempted'] as int? ?? 0,
    status: json['status'] as String? ?? 'moderate',
  );

  Map<String, dynamic> toJson() => {
    'topic': topic,
    'subject': subject,
    'accuracy_percentage': accuracyPercentage,
    'questions_attempted': questionsAttempted,
    'status': status,
  };
}

// 19. Score Point
class ScorePoint {
  final String label;
  final double score;
  final double accuracy;

  ScorePoint({
    required this.label,
    required this.score,
    required this.accuracy,
  });

  factory ScorePoint.fromJson(Map<String, dynamic> json) => ScorePoint(
    label: json['label'] as String? ?? '',
    score: (json['score'] as num? ?? 0.0).toDouble(),
    accuracy: (json['accuracy'] as num? ?? 0.0).toDouble(),
  );

  Map<String, dynamic> toJson() => {
    'label': label,
    'score': score,
    'accuracy': accuracy,
  };
}

// 20. Series Performance
class SeriesPerformance {
  final int testSeriesId;
  final String seriesTitle;
  final int testsCompleted;
  final int totalTests;
  final double avgScore;
  final double bestScore;
  final double avgAccuracy;
  final List<ScorePoint> history;

  SeriesPerformance({
    required this.testSeriesId,
    required this.seriesTitle,
    required this.testsCompleted,
    required this.totalTests,
    required this.avgScore,
    required this.bestScore,
    required this.avgAccuracy,
    required this.history,
  });

  factory SeriesPerformance.fromJson(Map<String, dynamic> json) => SeriesPerformance(
    testSeriesId: json['test_series_id'] as int? ?? 0,
    seriesTitle: json['series_title'] as String? ?? '',
    testsCompleted: json['tests_completed'] as int? ?? 0,
    totalTests: json['total_tests'] as int? ?? 0,
    avgScore: (json['avg_score'] as num? ?? 0.0).toDouble(),
    bestScore: (json['best_score'] as num? ?? 0.0).toDouble(),
    avgAccuracy: (json['avg_accuracy'] as num? ?? 0.0).toDouble(),
    history: (json['history'] as List? ?? []).map((e) => ScorePoint.fromJson(Map<String, dynamic>.from(e as Map))).toList(),
  );

  Map<String, dynamic> toJson() => {
    'test_series_id': testSeriesId,
    'series_title': seriesTitle,
    'tests_completed': testsCompleted,
    'total_tests': totalTests,
    'avg_score': avgScore,
    'best_score': bestScore,
    'avg_accuracy': avgAccuracy,
    'history': history.map((e) => e.toJson()).toList(),
  };
}

// 21. Test Analytics
class TestAnalytics {
  final int totalTestsAttempted;
  final int totalQuestionsAnswered;
  final double overallAccuracy;
  final int overallRank;
  final List<ScorePoint> scoreTrend;
  final List<FocusArea> focusAreas;

  TestAnalytics({
    required this.totalTestsAttempted,
    required this.totalQuestionsAnswered,
    required this.overallAccuracy,
    required this.overallRank,
    required this.scoreTrend,
    required this.focusAreas,
  });

  factory TestAnalytics.fromJson(Map<String, dynamic> json) => TestAnalytics(
    totalTestsAttempted: json['total_tests_attempted'] as int? ?? 0,
    totalQuestionsAnswered: json['total_questions_answered'] as int? ?? 0,
    overallAccuracy: (json['overall_accuracy'] as num? ?? 0.0).toDouble(),
    overallRank: json['overall_rank'] as int? ?? 1,
    scoreTrend: (json['score_trend'] as List? ?? []).map((e) => ScorePoint.fromJson(Map<String, dynamic>.from(e as Map))).toList(),
    focusAreas: (json['focus_areas'] as List? ?? []).map((e) => FocusArea.fromJson(Map<String, dynamic>.from(e as Map))).toList(),
  );

  Map<String, dynamic> toJson() => {
    'total_tests_attempted': totalTestsAttempted,
    'total_questions_answered': totalQuestionsAnswered,
    'overall_accuracy': overallAccuracy,
    'overall_rank': overallRank,
    'score_trend': scoreTrend.map((e) => e.toJson()).toList(),
    'focus_areas': focusAreas.map((e) => e.toJson()).toList(),
  };
}

// 22. Doubt Model
class Doubt {
  final int id;
  final int studentId;
  final String studentName;
  final String? studentAvatar;
  final String subject;
  final String question;
  final String? imageUrl;
  final String status;
  final DateTime createdAt;
  final List<DoubtReply>? replies;

  Doubt({
    required this.id,
    required this.studentId,
    required this.studentName,
    this.studentAvatar,
    required this.subject,
    required this.question,
    this.imageUrl,
    this.status = 'pending',
    required this.createdAt,
    this.replies,
  });

  factory Doubt.fromJson(Map<String, dynamic> json) => Doubt(
    id: json['id'] as int? ?? 0,
    studentId: json['student_id'] as int? ?? 0,
    studentName: json['student_name'] as String? ?? '',
    studentAvatar: json['student_avatar'] as String?,
    subject: json['subject'] as String? ?? '',
    question: json['question'] as String? ?? '',
    imageUrl: json['image_url'] as String?,
    status: json['status'] as String? ?? 'pending',
    createdAt: DateTime.tryParse(json['created_at']?.toString() ?? '') ?? DateTime.now(),
    replies: (json['replies'] as List?)?.map((e) => DoubtReply.fromJson(Map<String, dynamic>.from(e as Map))).toList(),
  );

  Map<String, dynamic> toJson() => {
    'id': id,
    'student_id': studentId,
    'student_name': studentName,
    'student_avatar': studentAvatar,
    'subject': subject,
    'question': question,
    'image_url': imageUrl,
    'status': status,
    'created_at': createdAt.toIso8601String(),
    if (replies != null) 'replies': replies!.map((e) => e.toJson()).toList(),
  };
}

// 23. Doubt Reply
class DoubtReply {
  final int id;
  final int doubtId;
  final int authorId;
  final String authorName;
  final String? authorAvatar;
  final String authorType;
  final String message;
  final String? imageUrl;
  final DateTime createdAt;

  DoubtReply({
    required this.id,
    required this.doubtId,
    required this.authorId,
    required this.authorName,
    this.authorAvatar,
    this.authorType = 'teacher',
    required this.message,
    this.imageUrl,
    required this.createdAt,
  });

  factory DoubtReply.fromJson(Map<String, dynamic> json) => DoubtReply(
    id: json['id'] as int? ?? 0,
    doubtId: json['doubt_id'] as int? ?? 0,
    authorId: json['author_id'] as int? ?? 0,
    authorName: json['author_name'] as String? ?? '',
    authorAvatar: json['author_avatar'] as String?,
    authorType: json['author_type'] as String? ?? 'teacher',
    message: json['message'] as String? ?? '',
    imageUrl: json['image_url'] as String?,
    createdAt: DateTime.tryParse(json['created_at']?.toString() ?? '') ?? DateTime.now(),
  );

  Map<String, dynamic> toJson() => {
    'id': id,
    'doubt_id': doubtId,
    'author_id': authorId,
    'author_name': authorName,
    'author_avatar': authorAvatar,
    'author_type': authorType,
    'message': message,
    'image_url': imageUrl,
    'created_at': createdAt.toIso8601String(),
  };
}

// 24. Community Post
class CommunityPost {
  final int id;
  final int authorId;
  final String authorName;
  final String? authorAvatar;
  final String content;
  final String? imageUrl;
  final int likeCount;
  final int replyCount;
  final bool isLiked;
  final DateTime createdAt;

  CommunityPost({
    required this.id,
    required this.authorId,
    required this.authorName,
    this.authorAvatar,
    required this.content,
    this.imageUrl,
    this.likeCount = 0,
    this.replyCount = 0,
    this.isLiked = false,
    required this.createdAt,
  });

  factory CommunityPost.fromJson(Map<String, dynamic> json) => CommunityPost(
    id: json['id'] as int? ?? 0,
    authorId: json['author_id'] as int? ?? 0,
    authorName: json['author_name'] as String? ?? '',
    authorAvatar: json['author_avatar'] as String?,
    content: json['content'] as String? ?? '',
    imageUrl: json['image_url'] as String?,
    likeCount: json['like_count'] as int? ?? 0,
    replyCount: json['reply_count'] as int? ?? 0,
    isLiked: json['is_liked'] as bool? ?? false,
    createdAt: DateTime.tryParse(json['created_at']?.toString() ?? '') ?? DateTime.now(),
  );

  Map<String, dynamic> toJson() => {
    'id': id,
    'author_id': authorId,
    'author_name': authorName,
    'author_avatar': authorAvatar,
    'content': content,
    'image_url': imageUrl,
    'like_count': likeCount,
    'reply_count': replyCount,
    'is_liked': isLiked,
    'created_at': createdAt.toIso8601String(),
  };
}

// 25. Live Class
class LiveClass {
  final int id;
  final String title;
  final String subject;
  final String instructorName;
  final String? thumbnailUrl;
  final DateTime scheduledAt;
  final int durationMinutes;
  final String status;
  final String? streamUrl;

  LiveClass({
    required this.id,
    required this.title,
    required this.subject,
    required this.instructorName,
    this.thumbnailUrl,
    required this.scheduledAt,
    this.durationMinutes = 60,
    this.status = 'upcoming',
    this.streamUrl,
  });

  factory LiveClass.fromJson(Map<String, dynamic> json) => LiveClass(
    id: json['id'] as int? ?? 0,
    title: json['title'] as String? ?? '',
    subject: json['subject'] as String? ?? '',
    instructorName: json['instructor_name'] as String? ?? '',
    thumbnailUrl: json['thumbnail_url'] as String?,
    scheduledAt: DateTime.tryParse(json['scheduled_at']?.toString() ?? '') ?? DateTime.now(),
    durationMinutes: json['duration_minutes'] as int? ?? 60,
    status: json['status'] as String? ?? 'upcoming',
    streamUrl: json['stream_url'] as String?,
  );

  Map<String, dynamic> toJson() => {
    'id': id,
    'title': title,
    'subject': subject,
    'instructor_name': instructorName,
    'thumbnail_url': thumbnailUrl,
    'scheduled_at': scheduledAt.toIso8601String(),
    'duration_minutes': durationMinutes,
    'status': status,
    'stream_url': streamUrl,
  };
}

// 26. Ebook Model
class Ebook {
  final int id;
  final String title;
  final String? author;
  final String? description;
  final String? coverUrl;
  final String pdfUrl;
  final int pageCount;
  final String fileSize;
  final bool isFree;

  Ebook({
    required this.id,
    required this.title,
    this.author,
    this.description,
    this.coverUrl,
    required this.pdfUrl,
    this.pageCount = 0,
    this.fileSize = '0 MB',
    this.isFree = true,
  });

  factory Ebook.fromJson(Map<String, dynamic> json) => Ebook(
    id: json['id'] as int? ?? 0,
    title: json['title'] as String? ?? '',
    author: json['author'] as String?,
    description: json['description'] as String?,
    coverUrl: json['cover_url'] as String?,
    pdfUrl: json['pdf_url'] as String? ?? '',
    pageCount: json['page_count'] as int? ?? 0,
    fileSize: json['file_size'] as String? ?? '0 MB',
    isFree: json['is_free'] as bool? ?? true,
  );

  Map<String, dynamic> toJson() => {
    'id': id,
    'title': title,
    'author': author,
    'description': description,
    'cover_url': coverUrl,
    'pdf_url': pdfUrl,
    'page_count': pageCount,
    'file_size': fileSize,
    'is_free': isFree,
  };
}

// 27. Resource Model
class Resource {
  final int id;
  final String title;
  final String type;
  final String fileUrl;
  final String fileSize;
  final DateTime createdAt;

  Resource({
    required this.id,
    required this.title,
    required this.type,
    required this.fileUrl,
    this.fileSize = '0 MB',
    required this.createdAt,
  });

  factory Resource.fromJson(Map<String, dynamic> json) => Resource(
    id: json['id'] as int? ?? 0,
    title: json['title'] as String? ?? '',
    type: json['type'] as String? ?? 'pdf',
    fileUrl: json['file_url'] as String? ?? '',
    fileSize: json['file_size'] as String? ?? '0 MB',
    createdAt: DateTime.tryParse(json['created_at']?.toString() ?? '') ?? DateTime.now(),
  );

  Map<String, dynamic> toJson() => {
    'id': id,
    'title': title,
    'type': type,
    'file_url': fileUrl,
    'file_size': fileSize,
    'created_at': createdAt.toIso8601String(),
  };
}

// 28. AI Message
class AiMessage {
  final String id;
  final String sender;
  final String text;
  final DateTime timestamp;

  AiMessage({
    required this.id,
    required this.sender,
    required this.text,
    required this.timestamp,
  });

  factory AiMessage.fromJson(Map<String, dynamic> json) => AiMessage(
    id: json['id'] as String? ?? '',
    sender: json['sender'] as String? ?? 'user',
    text: json['text'] as String? ?? '',
    timestamp: DateTime.tryParse(json['timestamp']?.toString() ?? '') ?? DateTime.now(),
  );

  Map<String, dynamic> toJson() => {
    'id': id,
    'sender': sender,
    'text': text,
    'timestamp': timestamp.toIso8601String(),
  };
}

// 29. AI Reply
class AiReply {
  final String message;
  final List<String> suggestions;

  AiReply({
    required this.message,
    this.suggestions = const [],
  });

  factory AiReply.fromJson(Map<String, dynamic> json) => AiReply(
    message: json['message'] as String? ?? '',
    suggestions: (json['suggestions'] as List? ?? []).cast<String>(),
  );

  Map<String, dynamic> toJson() => {
    'message': message,
    'suggestions': suggestions,
  };
}

// 30. Checkout Session & Razorpay Options
class CheckoutSession {
  final String orderId;
  final double amount;
  final String currency;
  final String keyId;
  final String itemName;
  final String? userEmail;
  final String? userPhone;

  CheckoutSession({
    required this.orderId,
    required this.amount,
    this.currency = 'INR',
    required this.keyId,
    required this.itemName,
    this.userEmail,
    this.userPhone,
  });

  factory CheckoutSession.fromJson(Map<String, dynamic> json) => CheckoutSession(
    orderId: json['order_id'] as String? ?? '',
    amount: (json['amount'] as num? ?? 0.0).toDouble(),
    currency: json['currency'] as String? ?? 'INR',
    keyId: json['key_id'] as String? ?? '',
    itemName: json['item_name'] as String? ?? '',
    userEmail: json['user_email'] as String?,
    userPhone: json['user_phone'] as String?,
  );

  Map<String, dynamic> toJson() => {
    'order_id': orderId,
    'amount': amount,
    'currency': currency,
    'key_id': keyId,
    'item_name': itemName,
    'user_email': userEmail,
    'user_phone': userPhone,
  };
}

class RazorpayOptions {
  final String key;
  final int amount;
  final String name;
  final String orderId;
  final String description;
  final Map<String, String> prefill;

  RazorpayOptions({
    required this.key,
    required this.amount,
    required this.name,
    required this.orderId,
    required this.description,
    required this.prefill,
  });

  Map<String, dynamic> toMap() => {
    'key': key,
    'amount': amount,
    'name': name,
    'order_id': orderId,
    'description': description,
    'prefill': prefill,
  };

  Map<String, dynamic> toJson() => toMap();

  factory RazorpayOptions.fromJson(Map<String, dynamic> json) => RazorpayOptions(
    key: json['key'] as String? ?? '',
    amount: json['amount'] as int? ?? 0,
    name: json['name'] as String? ?? '',
    orderId: json['order_id'] as String? ?? '',
    description: json['description'] as String? ?? '',
    prefill: (json['prefill'] as Map? ?? {}).map((k, v) => MapEntry(k.toString(), v.toString())),
  );
}
