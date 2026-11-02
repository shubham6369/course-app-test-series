'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Layers,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Award,
  Users,
  FileQuestion,
  Trash2,
  ChevronDown,
  ChevronUp,
  X,
  Sparkles,
  BookOpen,
} from 'lucide-react';

interface Category {
  id: number;
  name: string;
}

interface AttachedQuiz {
  id: number;
  title: string;
  subject?: string | null;
  durationMinutes: number;
  totalMarks: number;
  isFree: boolean;
  _count?: {
    questions: number;
    attempts: number;
  };
}

interface TestSeriesItem {
  id: number;
  title: string;
  description?: string | null;
  categoryId?: number | null;
  category?: Category | null;
  thumbnailUrl?: string | null;
  price: number;
  discountPrice?: number | null;
  validityDays: number;
  isPublished: boolean;
  quizzes: AttachedQuiz[];
  enrollments: any[];
}

interface TestSeriesClientProps {
  initialSeries: TestSeriesItem[];
  categories: Category[];
  availableQuizzes: { id: number; title: string; testSeriesId?: number | null }[];
}

export function TestSeriesClient({
  initialSeries,
  categories,
  availableQuizzes,
}: TestSeriesClientProps) {
  const router = useRouter();
  const [seriesList, setSeriesList] = useState<TestSeriesItem[]>(initialSeries);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedSeriesId, setExpandedSeriesId] = useState<number | null>(null);

  // New Test Series Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('999');
  const [discountPrice, setDiscountPrice] = useState('499');
  const [validityDays, setValidityDays] = useState('365');
  const [thumbnailUrl, setThumbnailUrl] = useState(
    'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=500'
  );
  const [isPublished, setIsPublished] = useState(true);
  const [selectedQuizIds, setSelectedQuizIds] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter test series
  const filteredSeries = seriesList.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'all' ||
      (item.categoryId && item.categoryId.toString() === selectedCategory);

    return matchesSearch && matchesCategory;
  });

  // Aggregated Stats
  const totalPackages = seriesList.length;
  const totalEnrolled = seriesList.reduce((acc, s) => acc + s.enrollments.length, 0);
  const totalAttachedQuizzes = seriesList.reduce((acc, s) => acc + s.quizzes.length, 0);
  const activePackages = seriesList.filter((s) => s.isPublished).length;

  const handleCreateSeries = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Package title is required.');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        title: title.trim(),
        description: description.trim() || undefined,
        categoryId: categoryId ? parseInt(categoryId, 10) : undefined,
        price: parseFloat(price) || 0,
        discountPrice: discountPrice ? parseFloat(discountPrice) : null,
        validityDays: parseInt(validityDays, 10) || 365,
        thumbnailUrl: thumbnailUrl.trim() || undefined,
        isPublished,
        quizIds: selectedQuizIds,
      };

      const res = await fetch('/api/admin/test-series', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || data.status !== 'success') {
        throw new Error(data.message || 'Failed to create test series');
      }

      setSeriesList((prev) => [data.data, ...prev]);
      setIsModalOpen(false);
      setTitle('');
      setDescription('');
      setSelectedQuizIds([]);
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Error creating test series');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (seriesId: number, seriesTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${seriesTitle}"?`)) return;

    try {
      const res = await fetch(`/api/admin/test-series?id=${seriesId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setSeriesList((prev) => prev.filter((s) => s.id !== seriesId));
        router.refresh();
      } else {
        alert(data.message || 'Failed to delete test series');
      }
    } catch (err: any) {
      alert(err.message || 'Error deleting test series');
    }
  };

  const toggleQuizSelection = (qId: number) => {
    setSelectedQuizIds((prev) =>
      prev.includes(qId) ? prev.filter((id) => id !== qId) : [...prev, qId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e0a028]/15 border border-[#e0a028]/30 text-xs font-semibold text-[#e0a028] mb-2">
            <Layers className="w-3.5 h-3.5" />
            <span>Assessment Packages Manager</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Test Series Packages
          </h1>
          <p className="text-sm text-slate-300 mt-1">
            Bundle CBT exam papers into comprehensive all-India test series with pricing and validity.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#e0a028] to-[#f3c25b] hover:from-[#d09020] hover:to-[#e0a028] text-[#061432] font-bold text-sm shadow-lg shadow-[#e0a028]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Test Series</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-white/10 bg-[#09214b]/40 backdrop-blur-md">
          <p className="text-xs text-slate-400 font-medium">Total Packages</p>
          <p className="text-2xl font-bold text-white mt-1">{totalPackages}</p>
        </div>
        <div className="p-4 rounded-xl border border-white/10 bg-[#09214b]/40 backdrop-blur-md">
          <p className="text-xs text-slate-400 font-medium">Attached Quizzes</p>
          <p className="text-2xl font-bold text-[#e0a028] mt-1">{totalAttachedQuizzes}</p>
        </div>
        <div className="p-4 rounded-xl border border-white/10 bg-[#09214b]/40 backdrop-blur-md">
          <p className="text-xs text-slate-400 font-medium">Enrolled Students</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{totalEnrolled}</p>
        </div>
        <div className="p-4 rounded-xl border border-white/10 bg-[#09214b]/40 backdrop-blur-md">
          <p className="text-xs text-slate-400 font-medium">Active Packages</p>
          <p className="text-2xl font-bold text-blue-400 mt-1">{activePackages}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search test series packages..."
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

      {/* Packages Grid */}
      {filteredSeries.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#09214b]/30 p-12 text-center">
          <Layers className="w-12 h-12 text-slate-500 mx-auto mb-3 opacity-60" />
          <h3 className="text-base font-semibold text-white">No test series found</h3>
          <p className="text-xs text-slate-400 mt-1">
            Create a test series bundle to start attaching CBT mock exams.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredSeries.map((series) => {
            const isExpanded = expandedSeriesId === series.id;

            return (
              <div
                key={series.id}
                className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#09214b]/50 to-[#061432]/80 backdrop-blur-md overflow-hidden transition-all hover:border-white/20 shadow-lg flex flex-col justify-between"
              >
                <div className="p-5 sm:p-6 space-y-4">
                  {/* Top Row: Thumbnail + Category & Status */}
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-xl bg-[#061432] border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                      {series.thumbnailUrl ? (
                        <img
                          src={series.thumbnailUrl}
                          alt={series.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Layers className="w-8 h-8 text-[#e0a028]" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded-full bg-[#e0a028]/15 border border-[#e0a028]/30 text-[#e0a028] text-[10px] font-bold">
                          {series.category?.name || 'General'}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            series.isPublished
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                          }`}
                        >
                          {series.isPublished ? 'ACTIVE' : 'DRAFT'}
                        </span>
                      </div>

                      <h3 className="font-bold text-base text-white line-clamp-2">
                        {series.title}
                      </h3>

                      <p className="text-xs text-slate-300 line-clamp-2 mt-1">
                        {series.description || 'Comprehensive all-India test series.'}
                      </p>
                    </div>
                  </div>

                  {/* Metadata Indicators */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5 text-center">
                    <div className="p-2 rounded-lg bg-black/20">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                        Validity
                      </span>
                      <span className="text-xs font-bold text-white">
                        {series.validityDays} Days
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-black/20">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                        Quizzes
                      </span>
                      <span className="text-xs font-bold text-[#e0a028]">
                        {series.quizzes.length} Tests
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-black/20">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                        Students
                      </span>
                      <span className="text-xs font-bold text-emerald-400">
                        {series.enrollments.length} Enrolled
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Pricing & Actions */}
                <div className="p-4 bg-[#061432]/90 border-t border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-base font-extrabold text-[#e0a028]">
                      {series.discountPrice && series.discountPrice > 0
                        ? `₹${series.discountPrice.toLocaleString('en-IN')}`
                        : series.price > 0
                        ? `₹${series.price.toLocaleString('en-IN')}`
                        : 'FREE'}
                    </span>
                    {series.discountPrice && series.discountPrice < series.price && (
                      <span className="text-xs text-slate-400 line-through ml-2">
                        ₹{series.price.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setExpandedSeriesId(isExpanded ? null : series.id)
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-200 transition-colors"
                    >
                      <span>{isExpanded ? 'Hide Quizzes' : 'View Quizzes'}</span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      onClick={() => handleDelete(series.id, series.title)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete Package"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded Quizzes View */}
                {isExpanded && (
                  <div className="border-t border-white/10 bg-[#040e22] p-4 space-y-2">
                    <p className="text-xs font-bold text-white flex items-center gap-1.5 mb-2">
                      <FileQuestion className="w-3.5 h-3.5 text-[#e0a028]" />
                      <span>Attached CBT Mock Tests ({series.quizzes.length})</span>
                    </p>

                    {series.quizzes.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">
                        No quizzes attached to this series yet.
                      </p>
                    ) : (
                      <div className="space-y-1.5">
                        {series.quizzes.map((quiz, qIdx) => (
                          <div
                            key={quiz.id}
                            className="p-2 rounded-lg bg-[#09214b]/40 border border-white/5 flex items-center justify-between text-xs"
                          >
                            <span className="font-medium text-slate-200">
                              {qIdx + 1}. {quiz.title}
                            </span>
                            <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                              <span>{quiz.durationMinutes}m</span>
                              <span className="text-[#e0a028]">{quiz.totalMarks}M</span>
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

      {/* New Test Series Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#09214b] border border-white/15 rounded-2xl max-w-xl w-full p-6 sm:p-8 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#e0a028]/15 border border-[#e0a028]/30 text-[11px] font-bold text-[#e0a028] mb-1">
                <Sparkles className="w-3 h-3" />
                <span>Create Bundle</span>
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                New Test Series Package
              </h3>
            </div>

            <form onSubmit={handleCreateSeries} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Series Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. All India NEET 2026 Test Series (15 Mocks)"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#061432] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#e0a028]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#061432] border border-white/10 text-white text-xs focus:outline-none focus:border-[#e0a028]"
                  >
                    <option value="">General</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id.toString()}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Validity (Days)
                  </label>
                  <input
                    type="number"
                    value={validityDays}
                    onChange={(e) => setValidityDays(e.target.value)}
                    placeholder="365"
                    className="w-full px-3 py-1.5 rounded-xl bg-[#061432] border border-white/10 text-xs text-white focus:outline-none focus:border-[#e0a028]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Original Price (₹ MRP)
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="999"
                    className="w-full px-3 py-1.5 rounded-lg bg-[#061432] border border-white/10 text-xs text-white focus:outline-none focus:border-[#e0a028]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Offer Price (₹ Discount)
                  </label>
                  <input
                    type="number"
                    value={discountPrice}
                    onChange={(e) => setDiscountPrice(e.target.value)}
                    placeholder="499"
                    className="w-full px-3 py-1.5 rounded-lg bg-[#061432] border border-white/10 text-xs text-white focus:outline-none focus:border-[#e0a028]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Attach Available Quizzes
                </label>
                <div className="max-h-36 overflow-y-auto space-y-1.5 p-2 rounded-xl bg-[#061432] border border-white/10">
                  {availableQuizzes.length === 0 ? (
                    <p className="text-xs text-slate-500 italic p-1">No quizzes available.</p>
                  ) : (
                    availableQuizzes.map((q) => (
                      <label
                        key={q.id}
                        className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/5 cursor-pointer text-xs"
                      >
                        <input
                          type="checkbox"
                          checked={selectedQuizIds.includes(q.id)}
                          onChange={() => toggleQuizSelection(q.id)}
                          className="w-3.5 h-3.5 text-[#e0a028] focus:ring-[#e0a028] bg-[#061432] border-white/20 rounded"
                        />
                        <span className="text-slate-200">{q.title}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Details about mock frequency, syllabus coverage, and ranking..."
                  className="w-full px-3.5 py-2 rounded-xl bg-[#061432] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#e0a028]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="publishPackage"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="w-4 h-4 rounded text-[#e0a028] focus:ring-[#e0a028] bg-[#061432] border-white/20"
                />
                <label htmlFor="publishPackage" className="text-xs text-slate-200 font-semibold cursor-pointer">
                  Publish package to student test catalog immediately
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 rounded-xl bg-[#e0a028] hover:bg-[#d09020] text-[#061432] font-bold text-xs shadow-lg transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Test Series'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
