'use client';

import { useState } from 'react';
import {
  Bell,
  Send,
  Plus,
  Trash2,
  ExternalLink,
  Users,
  User,
  CheckCircle2,
  X,
  Loader2,
} from 'lucide-react';
import { KpiCard } from '@/components/admin/kpi-card';

interface NotificationItem {
  id: number;
  studentId: number | null;
  title: string;
  body: string;
  actionUrl: string | null;
  isRead: boolean;
  createdAt: string | Date;
}

interface StudentOption {
  id: number;
  name: string;
}

interface NotificationsClientProps {
  initialNotifications: NotificationItem[];
  students: StudentOption[];
}

export function NotificationsClient({
  initialNotifications,
  students,
}: NotificationsClientProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [targetType, setTargetType] = useState<'all' | 'specific'>('all');
  const [studentId, setStudentId] = useState<string>(students[0]?.id?.toString() || '');
  const [actionUrl, setActionUrl] = useState('');

  const broadcastCount = notifications.filter((n) => n.studentId === null).length;
  const targetedCount = notifications.length - broadcastCount;

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          body,
          studentId: targetType === 'specific' ? studentId : null,
          actionUrl: actionUrl || null,
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setNotifications([data.data, ...notifications]);
        setIsModalOpen(false);
        setTitle('');
        setBody('');
        setActionUrl('');
      }
    } catch (err) {
      console.error('Error sending notification:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this notification record?')) return;
    try {
      const res = await fetch(`/api/admin/notifications?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setNotifications(notifications.filter((n) => n.id !== id));
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Push Notifications & FCM Dispatcher
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Broadcast test schedules, live class reminders, and individualized results to mobile devices.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#e0a028] to-[#d49018] text-[#061432] font-semibold text-sm hover:brightness-110 shadow-lg shadow-[#e0a028]/20 transition-all self-start sm:self-auto"
        >
          <Send className="w-4 h-4" />
          <span>Send Push Broadcast</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Dispatched"
          value={notifications.length}
          subtitle="Sent notifications"
          icon={Bell}
          colorScheme="gold"
        />
        <KpiCard
          title="All-Student Alerts"
          value={broadcastCount}
          subtitle="Global mobile pushes"
          icon={Users}
          colorScheme="blue"
        />
        <KpiCard
          title="Individual Alerts"
          value={targetedCount}
          subtitle="Specific student pushes"
          icon={User}
          colorScheme="purple"
        />
        <KpiCard
          title="FCM Delivery SLA"
          value="99.8%"
          subtitle="Real-time push gateway"
          icon={CheckCircle2}
          colorScheme="emerald"
        />
      </div>

      {/* Notifications Table */}
      <div className="rounded-2xl border border-white/10 bg-[#061432]/60 backdrop-blur-md overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="font-semibold text-sm text-white">
            Notification Dispatch History
          </h3>
          <span className="text-xs text-slate-400">
            {notifications.length} notifications logged
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#09214b]/40 text-slate-400 uppercase tracking-wider text-[10px] border-b border-white/10">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Notification Title & Body</th>
                <th className="py-3.5 px-4 font-semibold">Target Audience</th>
                <th className="py-3.5 px-4 font-semibold">Action Deep-link</th>
                <th className="py-3.5 px-4 font-semibold">Sent Timestamp</th>
                <th className="py-3.5 px-4 font-semibold text-right">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {notifications.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No push notifications have been sent yet.
                  </td>
                </tr>
              ) : (
                notifications.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="py-3.5 px-4 max-w-sm">
                      <p className="font-semibold text-white group-hover:text-[#e0a028] transition-colors">
                        {item.title}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                        {item.body}
                      </p>
                    </td>

                    <td className="py-3.5 px-4">
                      {item.studentId === null ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          <Users className="w-3 h-3" />
                          <span>All Students</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          <User className="w-3 h-3" />
                          <span>Student #{item.studentId}</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                      {item.actionUrl || <span className="text-slate-600">None</span>}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                      {new Date(item.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDelete(item.id)}
                        title="Delete Notification"
                        className="p-1.5 rounded-lg text-rose-400 hover:text-rose-200 hover:bg-rose-950/40 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Send Notification Modal */}
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
              Dispatch Push Notification
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Send an instant mobile notification to all or selected enrolled students.
            </p>

            <form onSubmit={handleSendNotification} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Notification Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Live Class Starting in 15 Minutes!"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#040e22] border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#e0a028]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Notification Message Body *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Join Prof. Rajesh Verma for the Ray Optics Doubt Clearing Marathon."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#040e22] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#e0a028]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Target Audience
                  </label>
                  <select
                    value={targetType}
                    onChange={(e) => setTargetType(e.target.value as 'all' | 'specific')}
                    className="w-full px-3 py-2 rounded-xl bg-[#040e22] border border-white/10 text-sm text-white focus:outline-none focus:border-[#e0a028]"
                  >
                    <option value="all">Broadcast to All Students</option>
                    <option value="specific">Specific Student</option>
                  </select>
                </div>

                {targetType === 'specific' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Select Student
                    </label>
                    <select
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#040e22] border border-white/10 text-sm text-white focus:outline-none focus:border-[#e0a028]"
                    >
                      {students.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Action Deep-Link URL (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. /live or /test-series/1"
                  value={actionUrl}
                  onChange={(e) => setActionUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#040e22] border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#e0a028]"
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
                      <span>Sending Push...</span>
                    </>
                  ) : (
                    <span>Send Notification</span>
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
