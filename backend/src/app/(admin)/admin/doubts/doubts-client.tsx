'use client';

import { useState } from 'react';
import {
  HelpCircle,
  Search,
  CheckCircle2,
  Clock,
  Send,
  Trash2,
  User,
  GraduationCap,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react';
import { KpiCard } from '@/components/admin/kpi-card';

interface DoubtReplyItem {
  id: number;
  authorName: string;
  authorType: string;
  message: string;
  createdAt: string | Date;
}

interface DoubtItem {
  id: number;
  studentId: number;
  studentName: string;
  studentAvatar: string | null;
  subject: string;
  question: string;
  imageUrl: string | null;
  status: string;
  createdAt: string | Date;
  student?: {
    targetExam?: string | null;
    email?: string | null;
  };
  replies: DoubtReplyItem[];
}

interface DoubtsClientProps {
  initialDoubts: DoubtItem[];
}

export function DoubtsClient({ initialDoubts }: DoubtsClientProps) {
  const [doubts, setDoubts] = useState<DoubtItem[]>(initialDoubts);
  const [statusTab, setStatusTab] = useState<'all' | 'open' | 'answered' | 'closed'>('all');
  const [search, setSearch] = useState('');
  const [activeReplyId, setActiveReplyId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState<number | null>(null);

  const filteredDoubts = doubts.filter((d) => {
    let matchesStatus = true;
    if (statusTab === 'open') {
      matchesStatus = d.status === 'open' || d.status === 'pending';
    } else if (statusTab === 'answered') {
      matchesStatus = d.status === 'solved';
    } else if (statusTab === 'closed') {
      matchesStatus = d.status === 'closed';
    }

    const matchesSearch =
      d.question.toLowerCase().includes(search.toLowerCase()) ||
      d.studentName.toLowerCase().includes(search.toLowerCase()) ||
      d.subject.toLowerCase().includes(search.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const totalOpen = doubts.filter((d) => d.status === 'open' || d.status === 'pending').length;
  const totalSolved = doubts.filter((d) => d.status === 'solved').length;
  const totalClosed = doubts.filter((d) => d.status === 'closed').length;
  const totalReplies = doubts.reduce((sum, d) => sum + (d.replies?.length || 0), 0);

  const handlePostReply = async (doubtId: number) => {
    if (!replyText.trim()) return;
    setIsSubmittingReply(true);
    try {
      const res = await fetch('/api/admin/doubts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doubtId,
          message: replyText,
          markSolved: true,
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        const { reply } = data.data;
        setDoubts(
          doubts.map((d) =>
            d.id === doubtId
              ? {
                  ...d,
                  status: 'solved',
                  replies: [...(d.replies || []), reply],
                }
              : d
          )
        );
        setReplyText('');
        setActiveReplyId(null);
      }
    } catch (err) {
      console.error('Error posting faculty reply:', err);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    setUpdatingStatusId(id);
    try {
      const res = await fetch('/api/admin/doubts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setDoubts(
          doubts.map((d) => (d.id === id ? { ...d, status: newStatus } : d))
        );
      }
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this doubt inquiry?')) return;
    try {
      const res = await fetch(`/api/admin/doubts?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setDoubts(doubts.filter((d) => d.id !== id));
      }
    } catch (err) {
      console.error('Error deleting doubt:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Academic Doubts Resolution Desk
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Faculty desk to review student questions, post conceptual explanations, and mark inquiries solved.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Inquiries"
          value={doubts.length}
          subtitle="All received questions"
          icon={HelpCircle}
          colorScheme="gold"
        />
        <KpiCard
          title="Pending / Open"
          value={totalOpen}
          subtitle="Awaiting teacher reply"
          icon={Clock}
          colorScheme="purple"
        />
        <KpiCard
          title="Solved Doubts"
          value={totalSolved}
          subtitle="Answered by faculty"
          icon={CheckCircle2}
          colorScheme="emerald"
        />
        <KpiCard
          title="Faculty Responses"
          value={totalReplies}
          subtitle="Total explanation threads"
          icon={Sparkles}
          colorScheme="blue"
        />
      </div>

      {/* Filter Tabs and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#061432]/60 backdrop-blur-md p-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#040e22] border border-white/10 self-start">
          {(['all', 'open', 'answered', 'closed'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                statusTab === tab
                  ? 'bg-gradient-to-r from-[#e0a028] to-[#d49018] text-[#061432] shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab === 'open'
                ? `Open (${totalOpen})`
                : tab === 'answered'
                ? `Answered (${totalSolved})`
                : tab}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search doubt text, student, or subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#040e22] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#e0a028] transition-colors"
          />
        </div>
      </div>

      {/* Doubts List */}
      <div className="space-y-4">
        {filteredDoubts.length === 0 ? (
          <div className="py-16 text-center text-slate-400 border border-white/5 rounded-2xl bg-[#061432]/30">
            No doubts match the selected criteria.
          </div>
        ) : (
          filteredDoubts.map((item) => {
            const isSolved = item.status === 'solved';
            const isOpen = item.status === 'open' || item.status === 'pending';
            const isReplying = activeReplyId === item.id;

            return (
              <div
                key={item.id}
                className={`rounded-2xl border p-5 backdrop-blur-md transition-all shadow-lg ${
                  isOpen
                    ? 'border-[#e0a028]/40 bg-[#09214b]/30'
                    : 'border-white/10 bg-[#061432]/70'
                }`}
              >
                {/* Header: Student Profile, Subject, Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#09214b] to-[#e0a028] flex items-center justify-center font-bold text-white text-sm border border-[#e0a028]/30 overflow-hidden shrink-0">
                      {item.studentAvatar ? (
                        <img
                          src={item.studentAvatar}
                          alt={item.studentName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        item.studentName.charAt(0)
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-white">
                          {item.studentName}
                        </span>
                        {item.student?.targetExam && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/5 border border-white/10 text-slate-300">
                            {item.student.targetExam}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400">
                        Submitted {new Date(item.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    {/* Subject Tag */}
                    <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#09214b] text-[#e0a028] border border-[#e0a028]/30">
                      {item.subject}
                    </span>

                    {/* Status Badge */}
                    {isSolved ? (
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        SOLVED
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase bg-[#e0a028]/20 text-[#e0a028] border border-[#e0a028]/30">
                        PENDING ANSWER
                      </span>
                    )}

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(item.id)}
                      title="Delete Doubt"
                      className="p-1.5 rounded-lg text-rose-400 hover:text-rose-200 hover:bg-rose-950/40 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Question Statement */}
                <div className="mt-4 p-4 rounded-xl bg-[#040e22]/80 border border-white/5 text-sm text-slate-100 font-medium leading-relaxed">
                  {item.question}

                  {item.imageUrl && (
                    <div className="mt-3">
                      <img
                        src={item.imageUrl}
                        alt="Question diagram"
                        className="rounded-lg max-h-60 border border-white/10 object-contain bg-black/40"
                      />
                    </div>
                  )}
                </div>

                {/* Faculty Replies Thread */}
                {item.replies && item.replies.length > 0 && (
                  <div className="mt-4 space-y-3 pt-3 border-t border-white/10">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#e0a028]">
                      Faculty Answers ({item.replies.length})
                    </p>
                    {item.replies.map((r) => (
                      <div
                        key={r.id}
                        className="p-3.5 rounded-xl bg-[#09214b]/40 border border-[#e0a028]/20"
                      >
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="font-semibold text-white flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#e0a028]" />
                            {r.authorName} ({r.authorType})
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(r.createdAt).toLocaleDateString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line">
                          {r.message}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Faculty Reply Box / Drawer */}
                <div className="mt-4 pt-3 border-t border-white/5 flex flex-col gap-3">
                  {!isReplying ? (
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => {
                          setActiveReplyId(item.id);
                          setReplyText('');
                        }}
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#e0a028] to-[#d49018] text-[#061432] font-semibold text-xs hover:brightness-110 shadow-md transition-all"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Write Teacher Explanation</span>
                      </button>

                      <div className="flex items-center gap-2">
                        {isSolved ? (
                          <button
                            onClick={() => handleStatusChange(item.id, 'open')}
                            className="px-2.5 py-1 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                          >
                            Mark Reopened
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStatusChange(item.id, 'solved')}
                            className="px-2.5 py-1 rounded-lg text-xs text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                          >
                            Mark as Solved
                          </button>
                        )}
                        <button
                          onClick={() => handleStatusChange(item.id, 'closed')}
                          className="px-2.5 py-1 rounded-lg text-xs text-slate-400 hover:bg-white/5 transition-colors"
                        >
                          Close Ticket
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 p-4 rounded-xl bg-[#040e22] border border-[#e0a028]/30">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-[#e0a028]">
                          Faculty Answer to {item.studentName}:
                        </label>
                        <button
                          onClick={() => setActiveReplyId(null)}
                          className="text-xs text-slate-400 hover:text-white"
                        >
                          Cancel
                        </button>
                      </div>

                      <textarea
                        rows={3}
                        required
                        placeholder="Provide clear step-by-step conceptual answer and formulas..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#061432] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#e0a028]"
                      />

                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          Will automatically mark doubt as SOLVED
                        </span>

                        <button
                          onClick={() => handlePostReply(item.id)}
                          disabled={isSubmittingReply || !replyText.trim()}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#e0a028] to-[#d49018] text-[#061432] font-semibold text-xs hover:brightness-110 shadow-md transition-all disabled:opacity-50"
                        >
                          {isSubmittingReply ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Posting...</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-3.5 h-3.5" />
                              <span>Submit & Resolve</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
