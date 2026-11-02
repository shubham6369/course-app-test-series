'use client';

import { useState } from 'react';
import {
  UserCheck,
  Plus,
  Search,
  BookOpen,
  Layers,
  Calendar,
  Trash2,
  CheckCircle2,
  X,
  Loader2,
} from 'lucide-react';
import { KpiCard } from '@/components/admin/kpi-card';

interface EnrollmentItem {
  id: number;
  studentId: number;
  itemType: string;
  itemId: number;
  validUntil: string | Date;
  isActive: boolean;
  createdAt: string | Date;
  student?: {
    id: number;
    name: string;
    email: string;
    phone: string;
    avatarUrl: string | null;
  };
  course?: {
    id: number;
    title: string;
    thumbnailUrl: string | null;
  } | null;
  testSeries?: {
    id: number;
    title: string;
    thumbnailUrl: string | null;
  } | null;
}

interface StudentOption {
  id: number;
  name: string;
  email: string;
}

interface CourseOption {
  id: number;
  title: string;
}

interface TestSeriesOption {
  id: number;
  title: string;
}

interface EnrollmentsClientProps {
  initialEnrollments: EnrollmentItem[];
  students: StudentOption[];
  courses: CourseOption[];
  testSeriesList: TestSeriesOption[];
}

export function EnrollmentsClient({
  initialEnrollments,
  students,
  courses,
  testSeriesList,
}: EnrollmentsClientProps) {
  const [enrollments, setEnrollments] = useState<EnrollmentItem[]>(initialEnrollments);
  const [filterTab, setFilterTab] = useState<'all' | 'course' | 'test_series'>('all');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Form state
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    students[0]?.id?.toString() || ''
  );
  const [itemType, setItemType] = useState<'course' | 'test_series'>('course');
  const [selectedItemId, setSelectedItemId] = useState<string>(
    courses[0]?.id?.toString() || ''
  );
  const [validityDays, setValidityDays] = useState('365');

  const filteredEnrollments = enrollments.filter((e) => {
    let matchesTab = true;
    if (filterTab !== 'all') {
      matchesTab = e.itemType.toLowerCase() === filterTab;
    }
    const itemTitle = e.itemType === 'course' ? e.course?.title : e.testSeries?.title;
    const matchesSearch =
      (e.student?.name && e.student.name.toLowerCase().includes(search.toLowerCase())) ||
      (e.student?.email && e.student.email.toLowerCase().includes(search.toLowerCase())) ||
      (itemTitle && itemTitle.toLowerCase().includes(search.toLowerCase()));

    return matchesTab && matchesSearch;
  });

  const activeCount = enrollments.filter((e) => e.isActive).length;
  const courseCount = enrollments.filter((e) => e.itemType === 'course').length;
  const seriesCount = enrollments.filter((e) => e.itemType === 'test_series').length;

  const handleToggleActive = async (id: number, current: boolean) => {
    setTogglingId(id);
    try {
      const res = await fetch('/api/admin/enrollments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: !current }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setEnrollments(
          enrollments.map((e) => (e.id === id ? { ...e, isActive: !current } : e))
        );
      }
    } catch (err) {
      console.error('Error toggling enrollment:', err);
    } finally {
      setTogglingId(null);
    }
  };

  const handleGrantEnrollment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !selectedItemId) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudentId,
          itemType,
          itemId: selectedItemId,
          validityDays,
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        // Refresh or update local state
        setEnrollments([data.data, ...enrollments]);
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error('Error creating enrollment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevoke = async (id: number) => {
    if (!confirm('Are you sure you want to revoke this student enrollment?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/enrollments?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setEnrollments(enrollments.filter((e) => e.id !== id));
      }
    } catch (err) {
      console.error('Error revoking enrollment:', err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Student Course & Test Series Enrollments
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Grant manual package access, manage expiration dates, and revoke licenses.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#e0a028] to-[#d49018] text-[#061432] font-semibold text-sm hover:brightness-110 shadow-lg shadow-[#e0a028]/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Grant Manual Access</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Active Enrollments"
          value={activeCount}
          subtitle="Permitted package licenses"
          icon={UserCheck}
          colorScheme="gold"
        />
        <KpiCard
          title="Course Subscriptions"
          value={courseCount}
          subtitle="Curriculum video access"
          icon={BookOpen}
          colorScheme="blue"
        />
        <KpiCard
          title="Test Series Packages"
          value={seriesCount}
          subtitle="CBT mock test series"
          icon={Layers}
          colorScheme="purple"
        />
        <KpiCard
          title="Total Grants"
          value={enrollments.length}
          subtitle="Manual & paid enrollments"
          icon={CheckCircle2}
          colorScheme="emerald"
        />
      </div>

      {/* Filter and Search Container */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#061432]/60 backdrop-blur-md p-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#040e22] border border-white/10 self-start">
          {(['all', 'course', 'test_series'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                filterTab === tab
                  ? 'bg-gradient-to-r from-[#e0a028] to-[#d49018] text-[#061432] shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab === 'course'
                ? `Courses (${courseCount})`
                : tab === 'test_series'
                ? `Test Series (${seriesCount})`
                : 'All Enrollments'}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search student or course/series..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#040e22] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#e0a028] transition-colors"
          />
        </div>
      </div>

      {/* Enrollments Table */}
      <div className="rounded-2xl border border-white/10 bg-[#061432]/60 backdrop-blur-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#09214b]/40 text-slate-400 uppercase tracking-wider text-[10px] border-b border-white/10">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Student Profile</th>
                <th className="py-3.5 px-4 font-semibold">Enrolled Item</th>
                <th className="py-3.5 px-4 font-semibold">Package Type</th>
                <th className="py-3.5 px-4 font-semibold">Validity Until</th>
                <th className="py-3.5 px-4 font-semibold text-center">Access Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Revoke</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredEnrollments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No enrollments found matching the criteria.
                  </td>
                </tr>
              ) : (
                filteredEnrollments.map((item) => {
                  const title =
                    item.itemType === 'course'
                      ? item.course?.title || `Course #${item.itemId}`
                      : item.testSeries?.title || `Test Series #${item.itemId}`;
                  const isCourse = item.itemType === 'course';

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      {/* Student Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#09214b] to-[#e0a028] flex items-center justify-center font-bold text-white text-xs border border-[#e0a028]/30 shrink-0">
                            {item.student?.name?.charAt(0) || 'S'}
                          </div>
                          <div>
                            <p className="font-semibold text-white group-hover:text-[#e0a028] transition-colors">
                              {item.student?.name || `Student #${item.studentId}`}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              {item.student?.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Enrolled Item */}
                      <td className="py-3.5 px-4 font-medium text-slate-200 max-w-sm truncate">
                        {title}
                      </td>

                      {/* Package Type */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isCourse
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          }`}
                        >
                          {isCourse ? 'Full Course' : 'Test Series'}
                        </span>
                      </td>

                      {/* Validity Date */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-300">
                        {new Date(item.validUntil).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Access Status Toggle */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleToggleActive(item.id, item.isActive)}
                          disabled={togglingId === item.id}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${
                            item.isActive
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25'
                              : 'bg-slate-500/15 text-slate-400 border border-slate-500/30 hover:bg-slate-500/25'
                          }`}
                        >
                          {togglingId === item.id ? (
                            <Loader2 className="w-3 h-3 animate-spin inline" />
                          ) : item.isActive ? (
                            'Active'
                          ) : (
                            'Expired / Paused'
                          )}
                        </button>
                      </td>

                      {/* Revoke Action */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleRevoke(item.id)}
                          disabled={deletingId === item.id}
                          title="Revoke Enrollment"
                          className="p-1.5 rounded-lg text-rose-400 hover:text-rose-200 hover:bg-rose-950/40 transition-colors disabled:opacity-50"
                        >
                          {deletingId === item.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grant Manual Enrollment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-[#061432] border border-white/10 p-6 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">
              Grant Manual Package Access
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Assign full curriculum course or mock test series to a registered student.
            </p>

            <form onSubmit={handleGrantEnrollment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Select Student *
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#040e22] border border-white/10 text-sm text-white focus:outline-none focus:border-[#e0a028]"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Package Type
                  </label>
                  <select
                    value={itemType}
                    onChange={(e) => {
                      const newType = e.target.value as 'course' | 'test_series';
                      setItemType(newType);
                      setSelectedItemId(
                        newType === 'course'
                          ? courses[0]?.id?.toString() || ''
                          : testSeriesList[0]?.id?.toString() || ''
                      );
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-[#040e22] border border-white/10 text-sm text-white focus:outline-none focus:border-[#e0a028]"
                  >
                    <option value="course">Video Course</option>
                    <option value="test_series">Test Series</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Validity (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={validityDays}
                    onChange={(e) => setValidityDays(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#040e22] border border-white/10 text-sm text-white focus:outline-none focus:border-[#e0a028]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Select {itemType === 'course' ? 'Course' : 'Test Series'} *
                </label>
                <select
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#040e22] border border-white/10 text-sm text-white focus:outline-none focus:border-[#e0a028]"
                >
                  {itemType === 'course'
                    ? courses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title}
                        </option>
                      ))
                    : testSeriesList.map((ts) => (
                        <option key={ts.id} value={ts.id}>
                          {ts.title}
                        </option>
                      ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-[#e0a028] to-[#d49018] text-[#061432] font-semibold text-xs hover:brightness-110 shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Granting...</span>
                    </>
                  ) : (
                    <span>Grant Access Now</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
