'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  BookOpen,
  FolderPlus,
  Plus,
  Trash2,
  Video,
  Save,
  Clock,
  FileText,
  Sparkles,
  HelpCircle,
  Eye,
  CheckCircle2,
  Layers,
} from 'lucide-react';

interface LessonInput {
  title: string;
  description: string;
  videoId: string;
  durationMinutes: number;
  isFreePreview: boolean;
  pdfUrl: string;
}

interface FolderInput {
  title: string;
  lessons: LessonInput[];
}

interface CategoryOption {
  id: number;
  name: string;
}

export default function NewCoursePage() {
  const router = useRouter();

  // Categories
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Metadata form state
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [price, setPrice] = useState('1999');
  const [discountPrice, setDiscountPrice] = useState('799');
  const [instructorName, setInstructorName] = useState('Dr. Ananya Sen (Ex-AIIMS)');
  const [validityDays, setValidityDays] = useState('365');
  const [thumbnailUrl, setThumbnailUrl] = useState(
    'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=500'
  );
  const [isPublished, setIsPublished] = useState(true);

  // Multi-folder syllabus state with sample initial module
  const [folders, setFolders] = useState<FolderInput[]>([
    {
      title: 'Module 1: Foundations & Core Concepts',
      lessons: [
        {
          title: '1.1 Comprehensive Overview & Orientation',
          description: 'Introduction to curriculum milestones and study strategy.',
          videoId: 'M7lc1UVf-VE',
          durationMinutes: 30,
          isFreePreview: true,
          pdfUrl: '',
        },
      ],
    },
  ]);

  useEffect(() => {
    fetch('/api/admin/categories')
      .then((res) => res.json())
      .then((json) => {
        if (json.status === 'success' && Array.isArray(json.data)) {
          setCategories(json.data);
          if (json.data.length > 0) {
            setCategoryId(json.data[0].id.toString());
          }
        }
      })
      .catch((err) => console.error('Failed to load categories', err));
  }, []);

  // Auto-slug generator on title blur if empty
  const handleTitleBlur = () => {
    if (title && !slug) {
      setSlug(
        title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
      );
    }
  };

  // Folder operations
  const addFolder = () => {
    setFolders((prev) => [
      ...prev,
      {
        title: `Module ${prev.length + 1}: Advanced Topics`,
        lessons: [
          {
            title: `${prev.length + 1}.1 Key Lecture`,
            description: '',
            videoId: 'dQw4w9WgXcQ',
            durationMinutes: 45,
            isFreePreview: false,
            pdfUrl: '',
          },
        ],
      },
    ]);
  };

  const removeFolder = (index: number) => {
    if (folders.length === 1) {
      alert('Course must have at least one module folder.');
      return;
    }
    setFolders((prev) => prev.filter((_, i) => i !== index));
  };

  const updateFolderTitle = (index: number, newTitle: string) => {
    setFolders((prev) =>
      prev.map((f, i) => (i === index ? { ...f, title: newTitle } : f))
    );
  };

  // Lesson operations within folder
  const addLesson = (folderIndex: number) => {
    setFolders((prev) =>
      prev.map((f, i) => {
        if (i !== folderIndex) return f;
        return {
          ...f,
          lessons: [
            ...f.lessons,
            {
              title: `${i + 1}.${f.lessons.length + 1} Lecture Title`,
              description: '',
              videoId: 'dQw4w9WgXcQ',
              durationMinutes: 30,
              isFreePreview: false,
              pdfUrl: '',
            },
          ],
        };
      })
    );
  };

  const removeLesson = (folderIndex: number, lessonIndex: number) => {
    setFolders((prev) =>
      prev.map((f, i) => {
        if (i !== folderIndex) return f;
        if (f.lessons.length === 1) {
          alert('Folder must have at least one lesson.');
          return f;
        }
        return {
          ...f,
          lessons: f.lessons.filter((_, lIdx) => lIdx !== lessonIndex),
        };
      })
    );
  };

  const updateLesson = (
    folderIndex: number,
    lessonIndex: number,
    field: keyof LessonInput,
    value: any
  ) => {
    setFolders((prev) =>
      prev.map((f, i) => {
        if (i !== folderIndex) return f;
        return {
          ...f,
          lessons: f.lessons.map((l, lIdx) =>
            lIdx === lessonIndex ? { ...l, [field]: value } : l
          ),
        };
      })
    );
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!title.trim()) {
      setErrorMsg('Course title is required.');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        title: title.trim(),
        slug: slug.trim() || undefined,
        description: description.trim() || undefined,
        thumbnailUrl: thumbnailUrl.trim() || undefined,
        price: parseFloat(price) || 0,
        discountPrice: discountPrice ? parseFloat(discountPrice) : null,
        instructorName: instructorName.trim() || undefined,
        categoryId: categoryId ? parseInt(categoryId, 10) : undefined,
        validityDays: parseInt(validityDays, 10) || 365,
        isPublished,
        folders: folders.map((f, fIdx) => ({
          title: f.title,
          order: fIdx + 1,
          lessons: f.lessons.map((l, lIdx) => ({
            title: l.title,
            description: l.description,
            videoId: l.videoId,
            durationMinutes: l.durationMinutes || 0,
            isFreePreview: l.isFreePreview,
            order: lIdx + 1,
            pdfUrl: l.pdfUrl || undefined,
          })),
        })),
      };

      const res = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || data.status !== 'success') {
        throw new Error(data.message || 'Failed to create course');
      }

      router.push('/admin/courses');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Breadcrumb & Action bar */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/admin/courses"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-[#e0a028] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Courses Catalog</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#e0a028] to-[#f3c25b] hover:from-[#d09020] hover:to-[#e0a028] text-[#061432] font-bold text-sm shadow-lg shadow-[#e0a028]/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            <Save className="w-4 h-4 stroke-[2.5]" />
            <span>{isSubmitting ? 'Saving Course...' : 'Save & Publish Course'}</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Step 1: Course Metadata Card */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#09214b]/60 to-[#061432]/80 backdrop-blur-md p-6 sm:p-8 shadow-xl space-y-6">
          <div className="border-b border-white/10 pb-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e0a028]/15 border border-[#e0a028]/30 text-xs font-semibold text-[#e0a028] mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Step 1 of 2</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Course Information & Pricing
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Configure course metadata, category association, pricing tiers, and instructor.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Course Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleBlur}
                placeholder="e.g. Master Organic Chemistry for NEET 2026"
                className="w-full px-4 py-2.5 rounded-xl bg-[#061432] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#e0a028] transition-colors"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                URL Slug
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. organic-chemistry-neet-2026"
                className="w-full px-4 py-2.5 rounded-xl bg-[#061432] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#e0a028] transition-colors font-mono"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Target Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#061432] border border-white/10 text-white text-sm focus:outline-none focus:border-[#e0a028] transition-colors"
              >
                <option value="">None / General</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id.toString()}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Instructor Name */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Instructor Name
              </label>
              <input
                type="text"
                value={instructorName}
                onChange={(e) => setInstructorName(e.target.value)}
                placeholder="e.g. Dr. Ananya Sen (Ex-AIIMS)"
                className="w-full px-4 py-2.5 rounded-xl bg-[#061432] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#e0a028] transition-colors"
              />
            </div>

            {/* Validity Days */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Validity (Days)
              </label>
              <input
                type="number"
                value={validityDays}
                onChange={(e) => setValidityDays(e.target.value)}
                placeholder="365"
                className="w-full px-4 py-2.5 rounded-xl bg-[#061432] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#e0a028] transition-colors"
              />
            </div>

            {/* Price (MRP) */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Original Price (₹ MRP)
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="1999"
                className="w-full px-4 py-2.5 rounded-xl bg-[#061432] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#e0a028] transition-colors"
              />
            </div>

            {/* Discount Price */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Offer Price (₹ Discount)
              </label>
              <input
                type="number"
                value={discountPrice}
                onChange={(e) => setDiscountPrice(e.target.value)}
                placeholder="799"
                className="w-full px-4 py-2.5 rounded-xl bg-[#061432] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#e0a028] transition-colors"
              />
            </div>

            {/* Thumbnail URL */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Course Thumbnail URL
              </label>
              <input
                type="url"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-4 py-2.5 rounded-xl bg-[#061432] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#e0a028] transition-colors"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Course Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Comprehensive breakdown of syllabus, learning outcomes, test papers..."
                className="w-full px-4 py-2.5 rounded-xl bg-[#061432] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#e0a028] transition-colors"
              />
            </div>

            {/* Published Toggle */}
            <div className="md:col-span-2 flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="isPublished"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="w-4 h-4 rounded text-[#e0a028] focus:ring-[#e0a028] bg-[#061432] border-white/20"
              />
              <label htmlFor="isPublished" className="text-sm font-medium text-slate-200">
                Immediately publish course to mobile app and student catalog
              </label>
            </div>
          </div>
        </div>

        {/* Step 2: Multi-folder Curriculum Builder */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#09214b]/60 to-[#061432]/80 backdrop-blur-md p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e0a028]/15 border border-[#e0a028]/30 text-xs font-semibold text-[#e0a028] mb-2">
                <Layers className="w-3.5 h-3.5" />
                <span>Step 2 of 2</span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Curriculum & Multi-Folder Syllabus Builder
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Organize lessons into chapter modules. Set duration, video URLs, and free previews.
              </p>
            </div>

            <button
              type="button"
              onClick={addFolder}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#061432] hover:bg-white/10 text-white border border-white/15 text-xs font-semibold transition-colors shrink-0"
            >
              <FolderPlus className="w-4 h-4 text-[#e0a028]" />
              <span>+ Add Module Folder</span>
            </button>
          </div>

          {/* Folders List */}
          <div className="space-y-6">
            {folders.map((folder, fIdx) => (
              <div
                key={fIdx}
                className="rounded-xl border border-white/10 bg-[#061432]/90 p-5 space-y-4"
              >
                {/* Folder Header */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="w-6 h-6 rounded-md bg-[#e0a028]/20 text-[#e0a028] text-xs font-bold flex items-center justify-center shrink-0">
                      {fIdx + 1}
                    </span>
                    <input
                      type="text"
                      value={folder.title}
                      onChange={(e) => updateFolderTitle(fIdx, e.target.value)}
                      placeholder="Folder / Module Title"
                      className="flex-1 font-bold text-white text-sm bg-transparent border-b border-transparent hover:border-white/20 focus:border-[#e0a028] px-1 py-0.5 focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => addLesson(fIdx)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#e0a028]/15 hover:bg-[#e0a028]/25 text-[#e0a028] text-xs font-semibold border border-[#e0a028]/30 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Lesson</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => removeFolder(fIdx)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Remove Folder"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Lessons within Folder */}
                <div className="space-y-3 pl-3 sm:pl-8 border-l border-white/10">
                  {folder.lessons.map((lesson, lIdx) => (
                    <div
                      key={lIdx}
                      className="rounded-xl border border-white/5 bg-[#09214b]/40 p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1">
                          <Video className="w-4 h-4 text-blue-400 shrink-0" />
                          <input
                            type="text"
                            value={lesson.title}
                            onChange={(e) =>
                              updateLesson(fIdx, lIdx, 'title', e.target.value)
                            }
                            placeholder="Lesson Title"
                            className="flex-1 text-sm font-semibold text-white bg-transparent border-b border-transparent hover:border-white/20 focus:border-[#e0a028] px-1 py-0.5 focus:outline-none transition-colors"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => removeLesson(fIdx, lIdx)}
                          className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors"
                          title="Remove Lesson"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Lesson details inputs */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                            Video ID or Stream URL
                          </label>
                          <input
                            type="text"
                            value={lesson.videoId}
                            onChange={(e) =>
                              updateLesson(fIdx, lIdx, 'videoId', e.target.value)
                            }
                            placeholder="e.g. M7lc1UVf-VE"
                            className="w-full px-3 py-1.5 rounded-lg bg-[#061432] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#e0a028] font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                            Duration (Minutes)
                          </label>
                          <input
                            type="number"
                            value={lesson.durationMinutes}
                            onChange={(e) =>
                              updateLesson(
                                fIdx,
                                lIdx,
                                'durationMinutes',
                                parseInt(e.target.value, 10) || 0
                              )
                            }
                            placeholder="30"
                            className="w-full px-3 py-1.5 rounded-lg bg-[#061432] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#e0a028]"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                            Optional PDF Notes URL
                          </label>
                          <input
                            type="url"
                            value={lesson.pdfUrl}
                            onChange={(e) =>
                              updateLesson(fIdx, lIdx, 'pdfUrl', e.target.value)
                            }
                            placeholder="https://.../notes.pdf"
                            className="w-full px-3 py-1.5 rounded-lg bg-[#061432] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#e0a028]"
                          />
                        </div>
                      </div>

                      {/* Free Preview Toggle */}
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="checkbox"
                          id={`preview-${fIdx}-${lIdx}`}
                          checked={lesson.isFreePreview}
                          onChange={(e) =>
                            updateLesson(fIdx, lIdx, 'isFreePreview', e.target.checked)
                          }
                          className="w-3.5 h-3.5 rounded text-[#e0a028] focus:ring-[#e0a028] bg-[#061432] border-white/20"
                        />
                        <label
                          htmlFor={`preview-${fIdx}-${lIdx}`}
                          className="text-xs text-emerald-400 font-semibold cursor-pointer"
                        >
                          Enable Free Demo Preview (Accessible without course purchase)
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Save Bar */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-white/10">
          <Link
            href="/admin/courses"
            className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-sm transition-colors"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-8 py-2.5 rounded-xl bg-gradient-to-r from-[#e0a028] to-[#f3c25b] hover:from-[#d09020] hover:to-[#e0a028] text-[#061432] font-bold text-sm shadow-xl shadow-[#e0a028]/25 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            <Save className="w-4 h-4 stroke-[2.5]" />
            <span>{isSubmitting ? 'Saving Course...' : 'Save & Publish Course'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
