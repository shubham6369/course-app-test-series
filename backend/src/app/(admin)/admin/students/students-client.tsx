'use client';

import { useState } from 'react';
import {
  GraduationCap,
  Plus,
  Search,
  UserCheck,
  UserX,
  Phone,
  Mail,
  BookOpen,
  Award,
  HelpCircle,
  Trash2,
  X,
  Loader2,
  Check,
} from 'lucide-react';
import { KpiCard } from '@/components/admin/kpi-card';

interface StudentItem {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatarUrl: string | null;
  classId: string | null;
  targetExam: string | null;
  isActive: boolean;
  createdAt: string | Date;
  _count: {
    enrollments: number;
    quizAttempts: number;
    doubts: number;
    orders: number;
  };
}

interface StudentsClientProps {
  initialStudents: StudentItem[];
}

export function StudentsClient({ initialStudents }: StudentsClientProps) {
  const [students, setStudents] = useState<StudentItem[]>(initialStudents);
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'inactive'>('all');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [targetExam, setTargetExam] = useState('NEET 2026');
  const [classId, setClassId] = useState('Class 12');
  const [password, setPassword] = useState('password123');

  const filteredStudents = students.filter((s) => {
    let matchesTab = true;
    if (filterTab === 'active') matchesTab = s.isActive;
    if (filterTab === 'inactive') matchesTab = !s.isActive;

    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.phone.includes(search) ||
      (s.targetExam && s.targetExam.toLowerCase().includes(search.toLowerCase()));

    return matchesTab && matchesSearch;
  });

  const activeCount = students.filter((s) => s.isActive).length;
  const inactiveCount = students.length - activeCount;
  const totalEnrollments = students.reduce((sum, s) => sum + s._count.enrollments, 0);
  const totalAttempts = students.reduce((sum, s) => sum + s._count.quizAttempts, 0);

  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    setTogglingId(id);
    try {
      const res = await fetch('/api/admin/students', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: !currentStatus }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setStudents(
          students.map((s) => (s.id === id ? { ...s, isActive: !currentStatus } : s))
        );
      }
    } catch (err) {
      console.error('Error toggling student active status:', err);
    } finally {
      setTogglingId(null);
    }
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          targetExam,
          classId,
          password,
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setStudents([data.data, ...students]);
        setIsModalOpen(false);
        setName('');
        setEmail('');
        setPhone('');
      } else {
        alert(data.message || 'Failed to create student');
      }
    } catch (err) {
      console.error('Error creating student:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this student account and related records?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/students?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setStudents(students.filter((s) => s.id !== id));
      }
    } catch (err) {
      console.error('Error deleting student:', err);
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
            Students Directory & Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Browse registered student profiles, verify course access, and manage account statuses.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#e0a028] to-[#d49018] text-[#061432] font-semibold text-sm hover:brightness-110 shadow-lg shadow-[#e0a028]/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Student</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Registered"
          value={students.length}
          subtitle="All student profiles"
          icon={GraduationCap}
          colorScheme="gold"
        />
        <KpiCard
          title="Active Students"
          value={activeCount}
          subtitle="Login permitted"
          icon={UserCheck}
          colorScheme="emerald"
        />
        <KpiCard
          title="Course Enrollments"
          value={totalEnrollments}
          subtitle="Active learning packages"
          icon={BookOpen}
          colorScheme="blue"
        />
        <KpiCard
          title="Test Submissions"
          value={totalAttempts}
          subtitle="Completed CBT exams"
          icon={Award}
          colorScheme="purple"
        />
      </div>

      {/* Filter and Search Container */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#061432]/60 backdrop-blur-md p-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#040e22] border border-white/10 self-start">
          {(['all', 'active', 'inactive'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                filterTab === tab
                  ? 'bg-gradient-to-r from-[#e0a028] to-[#d49018] text-[#061432] shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab === 'active'
                ? `Active (${activeCount})`
                : tab === 'inactive'
                ? `Inactive (${inactiveCount})`
                : 'All Students'}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, phone, exam..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#040e22] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#e0a028] transition-colors"
          />
        </div>
      </div>

      {/* Students Table Container */}
      <div className="rounded-2xl border border-white/10 bg-[#061432]/60 backdrop-blur-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#09214b]/40 text-slate-400 uppercase tracking-wider text-[10px] border-b border-white/10">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Student Profile</th>
                <th className="py-3.5 px-4 font-semibold">Contact Info</th>
                <th className="py-3.5 px-4 font-semibold">Academic Target</th>
                <th className="py-3.5 px-4 font-semibold">Activity Metrics</th>
                <th className="py-3.5 px-4 font-semibold text-center">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No students found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => (
                  <tr
                    key={s.id}
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    {/* Student Name & Avatar */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#09214b] to-[#e0a028] flex items-center justify-center font-bold text-white text-xs border border-[#e0a028]/30 overflow-hidden shrink-0">
                          {s.avatarUrl ? (
                            <img
                              src={s.avatarUrl}
                              alt={s.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            s.name.charAt(0)
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-white group-hover:text-[#e0a028] transition-colors">
                            {s.name}
                          </p>
                          <p className="text-[10px] text-slate-500 font-mono">
                            ID: #{s.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Contact Info */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <Phone className="w-3 h-3 text-[#e0a028]" />
                          <span>{s.phone}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Mail className="w-3 h-3 text-slate-500" />
                          <span className="truncate max-w-[160px]">{s.email}</span>
                        </div>
                      </div>
                    </td>

                    {/* Academic Target */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#09214b] border border-[#e0a028]/30 text-[#e0a028]">
                          {s.targetExam || 'General Aspirant'}
                        </span>
                        <p className="text-[11px] text-slate-400">
                          {s.classId || 'Class 12'}
                        </p>
                      </div>
                    </td>

                    {/* Activity Metrics */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3 text-[11px]">
                        <span
                          title="Course Enrollments"
                          className="flex items-center gap-1 text-blue-300"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                          <span>{s._count.enrollments}</span>
                        </span>
                        <span
                          title="Test Attempts"
                          className="flex items-center gap-1 text-purple-300"
                        >
                          <Award className="w-3.5 h-3.5 text-purple-400" />
                          <span>{s._count.quizAttempts}</span>
                        </span>
                        <span
                          title="Doubts Asked"
                          className="flex items-center gap-1 text-[#e0a028]"
                        >
                          <HelpCircle className="w-3.5 h-3.5 text-[#e0a028]" />
                          <span>{s._count.doubts}</span>
                        </span>
                      </div>
                    </td>

                    {/* Status Toggle */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleToggleActive(s.id, s.isActive)}
                        disabled={togglingId === s.id}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${
                          s.isActive
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25'
                            : 'bg-rose-500/15 text-rose-400 border border-rose-500/30 hover:bg-rose-500/25'
                        }`}
                      >
                        {togglingId === s.id ? (
                          <Loader2 className="w-3 h-3 animate-spin inline" />
                        ) : s.isActive ? (
                          'Active'
                        ) : (
                          'Suspended'
                        )}
                      </button>
                    </td>

                    {/* Delete */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDelete(s.id)}
                        disabled={deletingId === s.id}
                        title="Delete Student"
                        className="p-1.5 rounded-lg text-rose-400 hover:text-rose-200 hover:bg-rose-950/40 transition-colors disabled:opacity-50"
                      >
                        {deletingId === s.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Student Modal */}
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
              Add New Student Profile
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Create student login credentials and set target academic exam.
            </p>

            <form onSubmit={handleCreateStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ankit Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#040e22] border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#e0a028]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="student@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#040e22] border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#e0a028]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#040e22] border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#e0a028]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Target Exam
                  </label>
                  <select
                    value={targetExam}
                    onChange={(e) => setTargetExam(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#040e22] border border-white/10 text-sm text-white focus:outline-none focus:border-[#e0a028]"
                  >
                    <option value="NEET 2026">NEET 2026</option>
                    <option value="JEE Main 2026">JEE Main 2026</option>
                    <option value="JEE Advanced 2026">JEE Advanced 2026</option>
                    <option value="CUET UG 2026">CUET UG 2026</option>
                    <option value="Class 10 Foundation">Class 10 Foundation</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Class / Grade
                  </label>
                  <input
                    type="text"
                    value={classId}
                    onChange={(e) => setClassId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#040e22] border border-white/10 text-sm text-white focus:outline-none focus:border-[#e0a028]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Initial Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#040e22] border border-white/10 text-sm text-white focus:outline-none focus:border-[#e0a028]"
                />
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
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Create Student</span>
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
