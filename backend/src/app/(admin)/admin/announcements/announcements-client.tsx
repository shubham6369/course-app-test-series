'use client';

import { useState } from 'react';
import {
  Megaphone,
  Plus,
  Trash2,
  Calendar,
  Users,
  CheckCircle2,
  Eye,
  EyeOff,
  X,
  Loader2,
} from 'lucide-react';
import { KpiCard } from '@/components/admin/kpi-card';

interface AnnouncementItem {
  id: number;
  title: string;
  content: string;
  targetAudience: string;
  targetId: number | null;
  isPublished: boolean;
  createdAt: string | Date;
}

interface AnnouncementsClientProps {
  initialAnnouncements: AnnouncementItem[];
}

export function AnnouncementsClient({
  initialAnnouncements,
}: AnnouncementsClientProps) {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(initialAnnouncements);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetAudience, setTargetAudience] = useState('all');
  const [isPublished, setIsPublished] = useState(true);

  const publishedCount = announcements.filter((a) => a.isPublished).length;

  const handleTogglePublish = async (id: number, current: boolean) => {
    setTogglingId(id);
    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isPublished: !current }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setAnnouncements(
          announcements.map((a) => (a.id === id ? { ...a, isPublished: !current } : a))
        );
      }
    } catch (err) {
      console.error('Error toggling publish status:', err);
    } finally {
      setTogglingId(null);
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          targetAudience,
          isPublished,
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setAnnouncements([data.data, ...announcements]);
        setIsModalOpen(false);
        setTitle('');
        setContent('');
      }
    } catch (err) {
      console.error('Error creating announcement:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this notice board announcement?')) return;
    try {
      const res = await fetch(`/api/admin/announcements?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setAnnouncements(announcements.filter((a) => a.id !== id));
      }
    } catch (err) {
      console.error('Error deleting announcement:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Notice Board & Broadcast Announcements
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Publish examination bulletins, schedule notices, and system alerts to student feeds.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#e0a028] to-[#d49018] text-[#061432] font-semibold text-sm hover:brightness-110 shadow-lg shadow-[#e0a028]/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Post Announcement</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Notices"
          value={announcements.length}
          subtitle="All notice board posts"
          icon={Megaphone}
          colorScheme="gold"
        />
        <KpiCard
          title="Live Published"
          value={publishedCount}
          subtitle="Visible to all students"
          icon={CheckCircle2}
          colorScheme="emerald"
        />
        <KpiCard
          title="Target Segments"
          value="All & Custom"
          subtitle="Audience routing"
          icon={Users}
          colorScheme="purple"
        />
        <KpiCard
          title="Marquee Ticker"
          value="Active"
          subtitle="Top banner broadcast"
          icon={Calendar}
          colorScheme="blue"
        />
      </div>

      {/* Announcements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {announcements.map((item) => (
          <div
            key={item.id}
            className={`rounded-2xl border p-5 backdrop-blur-md transition-all flex flex-col justify-between shadow-lg ${
              item.isPublished
                ? 'border-[#e0a028]/30 bg-[#061432]/80 hover:border-[#e0a028]/60'
                : 'border-white/5 bg-[#061432]/40 opacity-70'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#09214b] text-[#e0a028] border border-[#e0a028]/30 flex items-center gap-1.5">
                  <Users className="w-3 h-3" />
                  <span>Audience: {item.targetAudience}</span>
                </span>

                <button
                  onClick={() => handleTogglePublish(item.id, item.isPublished)}
                  disabled={togglingId === item.id}
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${
                    item.isPublished
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                  }`}
                >
                  {item.isPublished ? (
                    <>
                      <Eye className="w-3 h-3" />
                      <span>Live</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3 h-3" />
                      <span>Draft</span>
                    </>
                  )}
                </button>
              </div>

              <h3 className="font-semibold text-base text-white line-clamp-2">
                {item.title}
              </h3>

              <p className="mt-2 text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                {item.content}
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-mono text-[11px]">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>
                  {new Date(item.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </span>

              <button
                onClick={() => handleDelete(item.id)}
                title="Delete Announcement"
                className="p-1.5 rounded-lg text-rose-400 hover:text-rose-200 hover:bg-rose-950/40 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Post Announcement Modal */}
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
              Publish Notice Board Announcement
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Display crucial updates, test release dates, or maintenance windows.
            </p>

            <form onSubmit={handleCreateAnnouncement} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Announcement Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NEET 2026 Part Test 03 Schedule Released"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#040e22] border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#e0a028]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Content / Details *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide complete exam guidelines or notice information..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#040e22] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#e0a028]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Target Audience
                </label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#040e22] border border-white/10 text-sm text-white focus:outline-none focus:border-[#e0a028]"
                >
                  <option value="all">All Enrolled & Registered Students</option>
                  <option value="course">Video Course Students Only</option>
                  <option value="test_series">Test Series Aspirants Only</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isPub"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="w-4 h-4 rounded border-white/10 bg-[#040e22] text-[#e0a028] focus:ring-[#e0a028]"
                />
                <label htmlFor="isPub" className="text-xs font-medium text-slate-300">
                  Immediately publish live to mobile app notice board
                </label>
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
                      <span>Posting...</span>
                    </>
                  ) : (
                    <span>Broadcast Notice</span>
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
