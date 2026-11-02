'use client';

import { useState } from 'react';
import {
  Radio,
  Plus,
  Search,
  Calendar,
  Clock,
  User,
  Trash2,
  ExternalLink,
  PlayCircle,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
} from 'lucide-react';
import { KpiCard } from '@/components/admin/kpi-card';

interface LiveClassItem {
  id: number;
  title: string;
  subject: string;
  instructorName: string;
  thumbnailUrl: string | null;
  scheduledAt: string | Date;
  durationMinutes: number;
  status: string;
  streamUrl: string | null;
  createdAt: string | Date;
}

interface LiveClientProps {
  initialClasses: LiveClassItem[];
}

export function LiveClient({ initialClasses }: LiveClientProps) {
  const [classes, setClasses] = useState<LiveClassItem[]>(initialClasses);
  const [filterTab, setFilterTab] = useState<'all' | 'upcoming' | 'live' | 'completed'>('all');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Physics');
  const [instructorName, setInstructorName] = useState('Prof. Rajesh Verma');
  const [scheduledAt, setScheduledAt] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('60');
  const [streamUrl, setStreamUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');

  const filteredClasses = classes.filter((c) => {
    const matchesFilter = filterTab === 'all' || c.status.toLowerCase() === filterTab;
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.subject.toLowerCase().includes(search.toLowerCase()) ||
      c.instructorName.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const liveNowCount = classes.filter((c) => c.status.toLowerCase() === 'live').length;
  const upcomingCount = classes.filter((c) => c.status.toLowerCase() === 'upcoming').length;
  const completedCount = classes.filter((c) => c.status.toLowerCase() === 'completed').length;

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !scheduledAt) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/live', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          subject,
          instructorName,
          scheduledAt,
          durationMinutes,
          streamUrl,
          thumbnailUrl,
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setClasses([...classes, data.data]);
        setIsModalOpen(false);
        setTitle('');
        setStreamUrl('');
        setScheduledAt('');
      }
    } catch (err) {
      console.error('Error creating live class:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch('/api/admin/live', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setClasses(
          classes.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
        );
      }
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this live class session?')) return;
    try {
      const res = await fetch(`/api/admin/live?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setClasses(classes.filter((c) => c.id !== id));
      }
    } catch (err) {
      console.error('Error deleting live class:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Live Interactive Classes Scheduler
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Broadcast interactive faculty lectures, doubt clearing webinars, and revision sessions.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#e0a028] to-[#d49018] text-[#061432] font-semibold text-sm hover:brightness-110 shadow-lg shadow-[#e0a028]/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Live Class</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Scheduled"
          value={classes.length}
          subtitle="All webinar sessions"
          icon={Radio}
          colorScheme="gold"
        />
        <KpiCard
          title="Live Streaming Now"
          value={liveNowCount}
          subtitle="Active student broadcasts"
          icon={PlayCircle}
          colorScheme="emerald"
        />
        <KpiCard
          title="Upcoming Classes"
          value={upcomingCount}
          subtitle="Next 7 days schedule"
          icon={Calendar}
          colorScheme="blue"
        />
        <KpiCard
          title="Completed Archives"
          value={completedCount}
          subtitle="Recordings available"
          icon={CheckCircle2}
          colorScheme="purple"
        />
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#061432]/60 backdrop-blur-md p-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#040e22] border border-white/10 self-start">
          {(['all', 'upcoming', 'live', 'completed'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                filterTab === tab
                  ? 'bg-gradient-to-r from-[#e0a028] to-[#d49018] text-[#061432] shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search class title, subject, instructor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#040e22] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#e0a028] transition-colors"
          />
        </div>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredClasses.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400 border border-white/5 rounded-2xl bg-[#061432]/30">
            No live classes found matching current filter.
          </div>
        ) : (
          filteredClasses.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-white/10 bg-[#061432]/70 backdrop-blur-md overflow-hidden flex flex-col hover:border-[#e0a028]/40 transition-all group shadow-lg"
            >
              {/* Thumbnail / Header */}
              <div className="relative h-44 w-full bg-[#040e22] overflow-hidden">
                <img
                  src={
                    item.thumbnailUrl ||
                    'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=500'
                  }
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#061432] via-[#061432]/40 to-transparent" />

                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  {item.status.toLowerCase() === 'live' ? (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                      LIVE NOW
                    </span>
                  ) : item.status.toLowerCase() === 'completed' ? (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-500/20 text-slate-300 border border-slate-500/30">
                      COMPLETED
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#e0a028]/20 text-[#e0a028] border border-[#e0a028]/30">
                      UPCOMING
                    </span>
                  )}
                </div>

                {/* Subject Pill */}
                <div className="absolute bottom-3 left-3">
                  <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-semibold bg-[#09214b]/80 border border-white/20 text-white backdrop-blur-sm">
                    {item.subject}
                  </span>
                </div>
              </div>

              {/* Class Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-semibold text-sm text-white group-hover:text-[#e0a028] transition-colors line-clamp-2 leading-snug">
                    {item.title}
                  </h3>
                  <div className="mt-2.5 space-y-1.5 text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-[#e0a028]" />
                      <span>{item.instructorName}</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-[11px]">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {new Date(item.scheduledAt).toLocaleString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.durationMinutes} Minutes</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {item.status.toLowerCase() === 'upcoming' && (
                      <button
                        onClick={() => handleStatusChange(item.id, 'live')}
                        disabled={updatingId === item.id}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold hover:bg-emerald-500/25 transition-colors"
                      >
                        Start Live
                      </button>
                    )}
                    {item.status.toLowerCase() === 'live' && (
                      <button
                        onClick={() => handleStatusChange(item.id, 'completed')}
                        disabled={updatingId === item.id}
                        className="px-2.5 py-1 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-300 text-[11px] font-semibold hover:bg-blue-500/25 transition-colors"
                      >
                        End Session
                      </button>
                    )}
                    {item.status.toLowerCase() === 'completed' && (
                      <button
                        onClick={() => handleStatusChange(item.id, 'upcoming')}
                        disabled={updatingId === item.id}
                        className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300 text-[11px] font-semibold hover:bg-white/10 transition-colors"
                      >
                        Reopen
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {item.streamUrl && (
                      <a
                        href={item.streamUrl}
                        target="_blank"
                        rel="noreferrer"
                        title="Open Stream"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    <button
                      onClick={() => handleDelete(item.id)}
                      title="Delete Class"
                      className="p-1.5 rounded-lg text-rose-400 hover:text-rose-200 hover:bg-rose-950/40 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Schedule Live Class Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-[#061432] border border-white/10 p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">
              Schedule New Live Class
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Broadcast webinars via YouTube Live, Zoom, or HLS stream links.
            </p>

            <form onSubmit={handleCreateClass} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Class Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Live Doubt Clearing: Ray Optics & Wave Optics"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#040e22] border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#e0a028]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Subject *
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#040e22] border border-white/10 text-sm text-white focus:outline-none focus:border-[#e0a028]"
                  >
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="General">General / Strategy</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Instructor Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={instructorName}
                    onChange={(e) => setInstructorName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#040e22] border border-white/10 text-sm text-white focus:outline-none focus:border-[#e0a028]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Scheduled Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#040e22] border border-white/10 text-sm text-white focus:outline-none focus:border-[#e0a028]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min="15"
                    step="15"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#040e22] border border-white/10 text-sm text-white focus:outline-none focus:border-[#e0a028]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Stream URL (YouTube Live / HLS / Zoom)
                </label>
                <input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={streamUrl}
                  onChange={(e) => setStreamUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#040e22] border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#e0a028]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Thumbnail Image URL
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#040e22] border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#e0a028]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-[#e0a028] to-[#d49018] text-[#061432] font-semibold text-xs hover:brightness-110 shadow-lg shadow-[#e0a028]/20 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Scheduling...</span>
                    </>
                  ) : (
                    <span>Schedule Class</span>
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
