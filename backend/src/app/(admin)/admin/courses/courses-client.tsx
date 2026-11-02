'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  FolderOpen,
  Video,
  Clock,
  Sparkles,
  Users,
  Eye,
  Trash2,
  ChevronDown,
  ChevronUp,
  Tag,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';

interface Lesson {
  id: number;
  title: string;
  videoId: string;
  durationMinutes: number;
  isFreePreview: boolean;
  order: number;
  pdfUrl?: string | null;
}

interface CourseFolder {
  id: number;
  title: string;
  order: number;
  lessons: Lesson[];
}

interface Category {
  id: number;
  name: string;
}

interface Course {
  id: number;
  title: string;
  slug: string;
  description?: string | null;
  thumbnailUrl?: string | null;
  price: number;
  discountPrice?: number | null;
  instructorName?: string | null;
  categoryId?: number | null;
  category?: Category | null;
  validityDays: number;
  isPublished: boolean;
  folders: CourseFolder[];
  enrollments: any[];
}

interface CoursesClientProps {
  initialCourses: Course[];
  categories: Category[];
}

export function CoursesClient({ initialCourses, categories }: CoursesClientProps) {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedCourseId, setExpandedCourseId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  // Filter courses based on search & category
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(search.toLowerCase()) ||
      (course.description && course.description.toLowerCase().includes(search.toLowerCase())) ||
      (course.instructorName && course.instructorName.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'all' ||
      (course.categoryId && course.categoryId.toString() === selectedCategory);

    return matchesSearch && matchesCategory;
  });

  // Aggregate stats
  const totalCourses = courses.length;
  const totalLessons = courses.reduce(
    (acc, c) => acc + c.folders.reduce((fAcc, f) => fAcc + f.lessons.length, 0),
    0
  );
  const totalEnrolled = courses.reduce((acc, c) => acc + c.enrollments.length, 0);
  const totalFreePreviews = courses.reduce(
    (acc, c) =>
      acc +
      c.folders.reduce(
        (fAcc, f) => fAcc + f.lessons.filter((l) => l.isFreePreview).length,
        0
      ),
    0
  );

  const handleDelete = async (courseId: number, courseTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${courseTitle}"? This cannot be undone.`)) {
      return;
    }

    try {
      setIsDeleting(courseId);
      const res = await fetch(`/api/admin/courses?id=${courseId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setCourses((prev) => prev.filter((c) => c.id !== courseId));
        router.refresh();
      } else {
        alert(data.message || 'Failed to delete course');
      }
    } catch (err: any) {
      alert(err.message || 'Error deleting course');
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e0a028]/15 border border-[#e0a028]/30 text-xs font-semibold text-[#e0a028] mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Academic Curriculum Manager</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Courses & Curriculum
          </h1>
          <p className="text-sm text-slate-300 mt-1">
            Configure multi-module video courses, free preview lessons, and pricing.
          </p>
        </div>

        <Link
          href="/admin/courses/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#e0a028] to-[#f3c25b] hover:from-[#d09020] hover:to-[#e0a028] text-[#061432] font-bold text-sm shadow-lg shadow-[#e0a028]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Course</span>
        </Link>
      </div>

      {/* Metric summary pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-white/10 bg-[#09214b]/40 backdrop-blur-md">
          <p className="text-xs text-slate-400 font-medium">Total Courses</p>
          <p className="text-2xl font-bold text-white mt-1">{totalCourses}</p>
        </div>
        <div className="p-4 rounded-xl border border-white/10 bg-[#09214b]/40 backdrop-blur-md">
          <p className="text-xs text-slate-400 font-medium">Video Lessons</p>
          <p className="text-2xl font-bold text-[#e0a028] mt-1">{totalLessons}</p>
        </div>
        <div className="p-4 rounded-xl border border-white/10 bg-[#09214b]/40 backdrop-blur-md">
          <p className="text-xs text-slate-400 font-medium">Enrolled Students</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{totalEnrolled}</p>
        </div>
        <div className="p-4 rounded-xl border border-white/10 bg-[#09214b]/40 backdrop-blur-md">
          <p className="text-xs text-slate-400 font-medium">Free Previews</p>
          <p className="text-2xl font-bold text-blue-400 mt-1">{totalFreePreviews}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, instructor, or keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#061432]/80 border border-white/10 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-[#e0a028] transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === 'all'
                ? 'bg-[#e0a028] text-[#061432]'
                : 'bg-[#061432]/80 text-slate-300 border border-white/10 hover:border-white/20'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id.toString())}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat.id.toString()
                  ? 'bg-[#e0a028] text-[#061432]'
                  : 'bg-[#061432]/80 text-slate-300 border border-white/10 hover:border-white/20'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Courses Catalog Grid */}
      {filteredCourses.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#09214b]/30 p-12 text-center">
          <BookOpen className="w-12 h-12 text-slate-500 mx-auto mb-3 opacity-60" />
          <h3 className="text-base font-semibold text-white">No courses found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search terms or create your first course.
          </p>
          <Link
            href="/admin/courses/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#e0a028] text-[#061432] font-bold text-xs mt-4"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Course</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredCourses.map((course) => {
            const courseLessonsCount = course.folders.reduce(
              (acc, f) => acc + f.lessons.length,
              0
            );
            const isExpanded = expandedCourseId === course.id;

            return (
              <div
                key={course.id}
                className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#09214b]/50 to-[#061432]/80 backdrop-blur-md overflow-hidden transition-all hover:border-white/20 shadow-lg"
              >
                {/* Course Header Row */}
                <div className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-[#061432] border border-white/10 flex items-center justify-center shrink-0 overflow-hidden relative">
                      {course.thumbnailUrl ? (
                        <img
                          src={course.thumbnailUrl}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <BookOpen className="w-7 h-7 text-[#e0a028]" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#e0a028]/15 border border-[#e0a028]/30 text-[#e0a028] text-[11px] font-bold">
                          {course.category?.name || 'General'}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            course.isPublished
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                          }`}
                        >
                          {course.isPublished ? 'PUBLISHED' : 'DRAFT'}
                        </span>
                        <span className="text-slate-400 text-xs font-mono">
                          /{course.slug}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-white tracking-tight">
                        {course.title}
                      </h3>

                      <p className="text-xs text-slate-300 line-clamp-1 mt-0.5">
                        {course.description || 'No description provided.'}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-2">
                        {course.instructorName && (
                          <span>Instructor: <strong className="text-white">{course.instructorName}</strong></span>
                        )}
                        <span>Validity: <strong className="text-white">{course.validityDays} Days</strong></span>
                        <span className="flex items-center gap-1">
                          <FolderOpen className="w-3.5 h-3.5 text-[#e0a028]" />
                          {course.folders.length} Folders
                        </span>
                        <span className="flex items-center gap-1">
                          <Video className="w-3.5 h-3.5 text-blue-400" />
                          {courseLessonsCount} Lessons
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-emerald-400" />
                          {course.enrollments.length} Enrolled
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Pricing & Actions */}
                  <div className="flex items-center justify-between lg:justify-end gap-4 border-t lg:border-t-0 border-white/5 pt-3 lg:pt-0">
                    <div className="text-left lg:text-right">
                      <div className="text-base sm:text-lg font-extrabold text-[#e0a028]">
                        {course.discountPrice && course.discountPrice > 0
                          ? `₹${course.discountPrice.toLocaleString('en-IN')}`
                          : course.price > 0
                          ? `₹${course.price.toLocaleString('en-IN')}`
                          : 'FREE'}
                      </div>
                      {course.discountPrice && course.discountPrice < course.price && (
                        <div className="text-xs text-slate-400 line-through">
                          MRP ₹{course.price.toLocaleString('en-IN')}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          setExpandedCourseId(isExpanded ? null : course.id)
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-200 transition-colors"
                      >
                        <span>Syllabus</span>
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        onClick={() => handleDelete(course.id, course.title)}
                        disabled={isDeleting === course.id}
                        className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors disabled:opacity-50"
                        title="Delete Course"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Syllabus View */}
                {isExpanded && (
                  <div className="border-t border-white/10 bg-[#061432]/90 p-5 sm:p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <FolderOpen className="w-4 h-4 text-[#e0a028]" />
                        <span>Curriculum Structure ({course.folders.length} Modules, {courseLessonsCount} Lessons)</span>
                      </h4>
                      <Link
                        href={`/admin/courses/new`}
                        className="text-xs text-[#e0a028] hover:underline flex items-center gap-1"
                      >
                        + Add modules in builder
                      </Link>
                    </div>

                    {course.folders.length === 0 ? (
                      <div className="py-4 text-center text-xs text-slate-400">
                        No syllabus folders created yet.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {course.folders.map((folder, fIdx) => (
                          <div
                            key={folder.id}
                            className="rounded-xl border border-white/5 bg-[#09214b]/30 p-3.5"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold text-white flex items-center gap-2">
                                <span className="w-5 h-5 rounded-md bg-[#e0a028]/15 text-[#e0a028] text-[10px] flex items-center justify-center font-bold">
                                  {fIdx + 1}
                                </span>
                                {folder.title}
                              </span>
                              <span className="text-[11px] text-slate-400">
                                {folder.lessons.length} {folder.lessons.length === 1 ? 'lesson' : 'lessons'}
                              </span>
                            </div>

                            <div className="space-y-1.5 pl-7">
                              {folder.lessons.length === 0 ? (
                                <p className="text-[11px] text-slate-500 italic">No lessons in this folder.</p>
                              ) : (
                                folder.lessons.map((lesson, lIdx) => (
                                  <div
                                    key={lesson.id}
                                    className="flex items-center justify-between py-1 px-2 rounded-lg bg-black/20 text-xs"
                                  >
                                    <div className="flex items-center gap-2">
                                      <Video className="w-3 h-3 text-blue-400" />
                                      <span className="text-slate-200">
                                        {lIdx + 1}. {lesson.title}
                                      </span>
                                      {lesson.isFreePreview && (
                                        <span className="px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 text-[9px] font-bold border border-emerald-500/25">
                                          FREE PREVIEW
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                                      <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {lesson.durationMinutes}m
                                      </span>
                                      <span className="font-mono text-[10px] text-slate-500">
                                        {lesson.videoId}
                                      </span>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
