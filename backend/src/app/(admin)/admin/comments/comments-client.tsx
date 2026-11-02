'use client';

import { useState } from 'react';
import {
  MessagesSquare,
  Search,
  Trash2,
  Reply,
  Heart,
  Video,
  User,
  ShieldCheck,
  X,
  Loader2,
} from 'lucide-react';
import { KpiCard } from '@/components/admin/kpi-card';

interface CommentItem {
  id: number;
  lessonId: number;
  studentName: string;
  studentAvatar: string | null;
  comment: string;
  likesCount: number;
  isTeacherReply: boolean;
  videoId: string | null;
  createdAt: string | Date;
  lesson?: {
    id: number;
    title: string;
    videoId: string;
    folder?: {
      title: string;
      course?: {
        id: number;
        title: string;
      };
    };
  };
}

interface CommentsClientProps {
  initialComments: CommentItem[];
}

export function CommentsClient({ initialComments }: CommentsClientProps) {
  const [comments, setComments] = useState<CommentItem[]>(initialComments);
  const [filterTab, setFilterTab] = useState<'all' | 'students' | 'faculty'>('all');
  const [search, setSearch] = useState('');
  const [replyingComment, setReplyingComment] = useState<CommentItem | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const filteredComments = comments.filter((c) => {
    let matchesTab = true;
    if (filterTab === 'students') matchesTab = !c.isTeacherReply;
    if (filterTab === 'faculty') matchesTab = c.isTeacherReply;

    const matchesSearch =
      c.comment.toLowerCase().includes(search.toLowerCase()) ||
      c.studentName.toLowerCase().includes(search.toLowerCase()) ||
      (c.lesson?.title && c.lesson.title.toLowerCase().includes(search.toLowerCase()));

    return matchesTab && matchesSearch;
  });

  const facultyCount = comments.filter((c) => c.isTeacherReply).length;
  const studentCount = comments.length - facultyCount;
  const totalLikes = comments.reduce((sum, c) => sum + c.likesCount, 0);

  const handlePostReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyingComment || !replyText.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId: replyingComment.lessonId,
          videoId: replyingComment.videoId || replyingComment.lesson?.videoId,
          comment: replyText,
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setComments([data.data, ...comments]);
        setReplyingComment(null);
        setReplyText('');
      }
    } catch (err) {
      console.error('Error posting teacher reply:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/comments?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setComments(comments.filter((c) => c.id !== id));
      }
    } catch (err) {
      console.error('Error deleting comment:', err);
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
            Video Lesson Comments Moderation
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Review student inquiries directly posted under curriculum video lectures.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Comments"
          value={comments.length}
          subtitle="Across all course lessons"
          icon={MessagesSquare}
          colorScheme="gold"
        />
        <KpiCard
          title="Student Questions"
          value={studentCount}
          subtitle="Feedback & inquiries"
          icon={User}
          colorScheme="blue"
        />
        <KpiCard
          title="Teacher Answers"
          value={facultyCount}
          subtitle="Official faculty replies"
          icon={ShieldCheck}
          colorScheme="purple"
        />
        <KpiCard
          title="Total Upvotes"
          value={totalLikes}
          subtitle="Helpful community votes"
          icon={Heart}
          colorScheme="emerald"
        />
      </div>

      {/* Filter and Search Container */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#061432]/60 backdrop-blur-md p-4">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#040e22] border border-white/10 self-start">
          {(['all', 'students', 'faculty'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                filterTab === tab
                  ? 'bg-gradient-to-r from-[#e0a028] to-[#d49018] text-[#061432] shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab === 'all'
                ? 'All Comments'
                : tab === 'students'
                ? `Student Queries (${studentCount})`
                : `Faculty (${facultyCount})`}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search comment, student, or lesson..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#040e22] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#e0a028] transition-colors"
          />
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-3.5">
        {filteredComments.length === 0 ? (
          <div className="py-16 text-center text-slate-400 border border-white/5 rounded-2xl bg-[#061432]/30">
            No video comments match the current filters.
          </div>
        ) : (
          filteredComments.map((c) => (
            <div
              key={c.id}
              className={`rounded-2xl border p-4 backdrop-blur-md transition-all ${
                c.isTeacherReply
                  ? 'border-[#e0a028]/30 bg-[#09214b]/30'
                  : 'border-white/10 bg-[#061432]/70 hover:border-white/20'
              }`}
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#09214b] to-[#e0a028] flex items-center justify-center font-bold text-white text-xs border border-[#e0a028]/30 overflow-hidden shrink-0">
                    {c.studentAvatar ? (
                      <img
                        src={c.studentAvatar}
                        alt={c.studentName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      c.studentName.charAt(0)
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-white">
                        {c.studentName}
                      </span>
                      {c.isTeacherReply && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#e0a028]/20 text-[#e0a028] border border-[#e0a028]/30">
                          FACULTY
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {new Date(c.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                {/* Lesson Context Tag */}
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {c.lesson?.title && (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] bg-white/5 border border-white/10 text-slate-300 max-w-xs truncate">
                      <Video className="w-3.5 h-3.5 text-[#e0a028] shrink-0" />
                      <span className="truncate">{c.lesson.title}</span>
                    </span>
                  )}

                  <button
                    onClick={() => handleDelete(c.id)}
                    disabled={deletingId === c.id}
                    title="Delete Comment"
                    className="p-1.5 rounded-lg text-rose-400 hover:text-rose-200 hover:bg-rose-950/40 transition-colors disabled:opacity-50"
                  >
                    {deletingId === c.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Comment Content */}
              <p className="mt-3 text-xs text-slate-200 leading-relaxed">
                {c.comment}
              </p>

              {/* Footer Actions */}
              <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1 text-slate-400">
                  <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-500/20" />
                  <span>{c.likesCount} Likes</span>
                </span>

                {!c.isTeacherReply && (
                  <button
                    onClick={() => {
                      setReplyingComment(c);
                      setReplyText('');
                    }}
                    className="flex items-center gap-1.5 text-[#e0a028] hover:underline font-medium text-xs"
                  >
                    <Reply className="w-3.5 h-3.5" />
                    <span>Reply as Faculty</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Reply Modal */}
      {replyingComment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-[#061432] border border-white/10 p-6 shadow-2xl relative">
            <button
              onClick={() => setReplyingComment(null)}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-1">
              Reply as Faculty Instructor
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Responding to {replyingComment.studentName} on "{replyingComment.lesson?.title || 'Lesson'}"
            </p>

            <div className="p-3 rounded-xl bg-[#040e22] border border-white/5 text-xs text-slate-300 italic mb-4">
              "{replyingComment.comment}"
            </div>

            <form onSubmit={handlePostReply} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Your Explanation / Response *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Type clear explanation..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#040e22] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#e0a028]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setReplyingComment(null)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !replyText.trim()}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#e0a028] to-[#d49018] text-[#061432] font-semibold text-xs hover:brightness-110 shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Posting...</span>
                    </>
                  ) : (
                    <span>Post Official Reply</span>
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
