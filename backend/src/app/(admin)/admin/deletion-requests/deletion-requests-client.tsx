'use client';

import { useState } from 'react';
import {
  UserX,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldAlert,
  AlertTriangle,
  Search,
  Check,
  X,
  Loader2,
} from 'lucide-react';
import { KpiCard } from '@/components/admin/kpi-card';

interface DeletionItem {
  id: number;
  studentId: number;
  reason: string | null;
  status: string;
  requestedAt: string | Date;
  resolvedAt: string | Date | null;
  student?: {
    id: number;
    name: string;
    email: string;
    phone: string;
    avatarUrl: string | null;
    isActive: boolean;
    targetExam: string | null;
    _count?: {
      enrollments: number;
      quizAttempts: number;
    };
  };
}

interface DeletionRequestsClientProps {
  initialRequests: DeletionItem[];
}

export function DeletionRequestsClient({
  initialRequests,
}: DeletionRequestsClientProps) {
  const [requests, setRequests] = useState<DeletionItem[]>(initialRequests);
  const [statusTab, setStatusTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [search, setSearch] = useState('');
  const [processingId, setProcessingId] = useState<number | null>(null);

  const filteredRequests = requests.filter((r) => {
    let matchesStatus = true;
    if (statusTab !== 'all') {
      matchesStatus = r.status.toLowerCase() === statusTab;
    }
    const matchesSearch =
      (r.student?.name && r.student.name.toLowerCase().includes(search.toLowerCase())) ||
      (r.student?.email && r.student.email.toLowerCase().includes(search.toLowerCase())) ||
      (r.reason && r.reason.toLowerCase().includes(search.toLowerCase()));

    return matchesStatus && matchesSearch;
  });

  const pendingCount = requests.filter((r) => r.status.toLowerCase() === 'pending').length;
  const approvedCount = requests.filter((r) => r.status.toLowerCase() === 'approved').length;
  const rejectedCount = requests.filter((r) => r.status.toLowerCase() === 'rejected').length;

  const handleAction = async (id: number, action: 'approve' | 'reject') => {
    const confirmMsg =
      action === 'approve'
        ? 'Are you sure you want to approve this deletion request? The student account will be deactivated.'
        : 'Reject this deletion request?';
    if (!confirm(confirmMsg)) return;

    setProcessingId(id);
    try {
      const res = await fetch('/api/admin/deletion-requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setRequests(
          requests.map((r) =>
            r.id === id
              ? {
                  ...r,
                  status: action === 'approve' ? 'approved' : 'rejected',
                  resolvedAt: new Date().toISOString(),
                  student: r.student
                    ? {
                        ...r.student,
                        isActive: action === 'approve' ? false : r.student.isActive,
                      }
                    : undefined,
                }
              : r
          )
        );
      }
    } catch (err) {
      console.error('Error updating deletion request:', err);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Account Deletion Requests & Compliance
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Review GDPR / DPDP compliance deletion requests submitted by students from the mobile app.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Pending Queue"
          value={pendingCount}
          subtitle="Awaiting action"
          icon={Clock}
          colorScheme="gold"
        />
        <KpiCard
          title="Approved Deletions"
          value={approvedCount}
          subtitle="Accounts deactivated"
          icon={CheckCircle2}
          colorScheme="emerald"
        />
        <KpiCard
          title="Rejected Requests"
          value={rejectedCount}
          subtitle="Retained accounts"
          icon={XCircle}
          colorScheme="purple"
        />
        <KpiCard
          title="Total Inquiries"
          value={requests.length}
          subtitle="Lifetime requests logged"
          icon={UserX}
          colorScheme="blue"
        />
      </div>

      {/* Filter and Search Container */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#061432]/60 backdrop-blur-md p-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#040e22] border border-white/10 self-start">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                statusTab === tab
                  ? 'bg-gradient-to-r from-[#e0a028] to-[#d49018] text-[#061432] shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab === 'pending'
                ? `Pending (${pendingCount})`
                : tab === 'approved'
                ? `Approved (${approvedCount})`
                : tab}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search student name, email, or reason..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#040e22] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#e0a028] transition-colors"
          />
        </div>
      </div>

      {/* Requests Table */}
      <div className="rounded-2xl border border-white/10 bg-[#061432]/60 backdrop-blur-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#09214b]/40 text-slate-400 uppercase tracking-wider text-[10px] border-b border-white/10">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Student Profile</th>
                <th className="py-3.5 px-4 font-semibold">Stated Reason</th>
                <th className="py-3.5 px-4 font-semibold">Enrolled / Tests</th>
                <th className="py-3.5 px-4 font-semibold">Date Submitted</th>
                <th className="py-3.5 px-4 font-semibold text-center">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Review Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No deletion requests found matching current filter.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((r) => (
                  <tr
                    key={r.id}
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    {/* Student Info */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#09214b] to-[#e0a028] flex items-center justify-center font-bold text-white text-xs border border-[#e0a028]/30 shrink-0">
                          {r.student?.name?.charAt(0) || 'S'}
                        </div>
                        <div>
                          <p className="font-semibold text-white group-hover:text-[#e0a028] transition-colors">
                            {r.student?.name || `Student #${r.studentId}`}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {r.student?.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Stated Reason */}
                    <td className="py-3.5 px-4">
                      <p className="text-slate-300 max-w-xs leading-relaxed italic">
                        "{r.reason || 'No specific reason provided'}"
                      </p>
                    </td>

                    {/* Active Assets */}
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-300">
                      {r.student?._count?.enrollments || 0} Courses •{' '}
                      {r.student?._count?.quizAttempts || 0} Submissions
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-slate-400">
                      {new Date(r.requestedAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4 text-center">
                      {r.status === 'pending' ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-[#e0a028]/20 text-[#e0a028] border border-[#e0a028]/30">
                          PENDING
                        </span>
                      ) : r.status === 'approved' ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          APPROVED
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          REJECTED
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      {r.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleAction(r.id, 'approve')}
                            disabled={processingId === r.id}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold hover:bg-emerald-500/25 transition-colors disabled:opacity-50"
                          >
                            {processingId === r.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Check className="w-3.5 h-3.5" />
                            )}
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleAction(r.id, 'reject')}
                            disabled={processingId === r.id}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold hover:bg-rose-500/25 transition-colors disabled:opacity-50"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500 italic">
                          Resolved {r.resolvedAt ? new Date(r.resolvedAt).toLocaleDateString('en-IN') : ''}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
