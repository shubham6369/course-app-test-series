'use client';

import { useState } from 'react';
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  ExternalLink,
  Eye,
  ArrowUpDown,
  X,
  Loader2,
} from 'lucide-react';
import { KpiCard } from '@/components/admin/kpi-card';

interface BannerItem {
  id: number;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  actionType: string | null;
  actionValue: string | null;
  order: number;
  isActive: boolean;
  createdAt: string | Date;
}

interface BannersClientProps {
  initialBanners: BannerItem[];
}

export function BannersClient({ initialBanners }: BannersClientProps) {
  const [banners, setBanners] = useState<BannerItem[]>(initialBanners);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [actionType, setActionType] = useState('test_series');
  const [actionValue, setActionValue] = useState('1');
  const [order, setOrder] = useState('1');

  const activeCount = banners.filter((b) => b.isActive).length;

  const handleToggleActive = async (id: number, current: boolean) => {
    setTogglingId(id);
    try {
      const res = await fetch('/api/admin/banners', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: !current }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setBanners(
          banners.map((b) => (b.id === id ? { ...b, isActive: !current } : b))
        );
      }
    } catch (err) {
      console.error('Error toggling banner status:', err);
    } finally {
      setTogglingId(null);
    }
  };

  const handleCreateBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !imageUrl.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          subtitle,
          imageUrl,
          actionType,
          actionValue,
          order,
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setBanners([...banners, data.data]);
        setIsModalOpen(false);
        setTitle('');
        setSubtitle('');
        setImageUrl('');
      }
    } catch (err) {
      console.error('Error creating banner:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this promotional banner?')) return;
    try {
      const res = await fetch(`/api/admin/banners?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setBanners(banners.filter((b) => b.id !== id));
      }
    } catch (err) {
      console.error('Error deleting banner:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Home Carousel & Promotional Banners
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Design and organize hero banner slides displayed at the top of the mobile app home screen.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#e0a028] to-[#d49018] text-[#061432] font-semibold text-sm hover:brightness-110 shadow-lg shadow-[#e0a028]/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Banner</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Banners"
          value={banners.length}
          subtitle="Configured carousel slides"
          icon={ImageIcon}
          colorScheme="gold"
        />
        <KpiCard
          title="Active in App"
          value={activeCount}
          subtitle="Visible to aspirants"
          icon={Eye}
          colorScheme="emerald"
        />
        <KpiCard
          title="Auto-Rotation"
          value="4.5s"
          subtitle="Optimal engagement dwell"
          icon={ArrowUpDown}
          colorScheme="blue"
        />
        <KpiCard
          title="Banner Clicks"
          value="~1.4k"
          subtitle="Monthly deep-link taps"
          icon={ExternalLink}
          colorScheme="purple"
        />
      </div>

      {/* Banners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {banners.map((item) => (
          <div
            key={item.id}
            className={`rounded-2xl border backdrop-blur-md overflow-hidden flex flex-col justify-between transition-all group shadow-lg ${
              item.isActive
                ? 'border-white/10 bg-[#061432]/80 hover:border-[#e0a028]/40'
                : 'border-white/5 bg-[#061432]/40 opacity-70'
            }`}
          >
            {/* Banner Image Preview */}
            <div className="relative h-44 w-full bg-[#040e22] overflow-hidden">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#061432] via-[#061432]/30 to-transparent" />

              <div className="absolute top-3 left-3">
                <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-[#040e22]/80 text-[#e0a028] border border-[#e0a028]/30">
                  Priority #{item.order}
                </span>
              </div>

              <div className="absolute top-3 right-3">
                <button
                  onClick={() => handleToggleActive(item.id, item.isActive)}
                  disabled={togglingId === item.id}
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    item.isActive
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                  }`}
                >
                  {item.isActive ? 'Active' : 'Hidden'}
                </button>
              </div>

              {item.actionType && (
                <div className="absolute bottom-3 left-3">
                  <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-semibold bg-[#09214b]/90 text-slate-200 border border-white/20 uppercase tracking-wide">
                    Action: {item.actionType} {item.actionValue ? `(${item.actionValue})` : ''}
                  </span>
                </div>
              )}
            </div>

            {/* Banner Details */}
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-sm text-white group-hover:text-[#e0a028] transition-colors line-clamp-1">
                  {item.title}
                </h3>
                {item.subtitle && (
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {item.subtitle}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                <span className="text-[11px] text-slate-500 truncate max-w-[200px]">
                  {item.imageUrl}
                </span>

                <button
                  onClick={() => handleDelete(item.id)}
                  title="Delete Banner"
                  className="p-1.5 rounded-lg text-rose-400 hover:text-rose-200 hover:bg-rose-950/40 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Banner Modal */}
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
              Add New Carousel Banner
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Configure promo graphics and click target destinations.
            </p>

            <form onSubmit={handleCreateBanner} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Banner Headline *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. All India NEET 2026 Mock Test Series"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#040e22] border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#e0a028]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Subtitle / Promo Text
                </label>
                <input
                  type="text"
                  placeholder="e.g. Test your preparation against thousands of aspirants nationwide"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#040e22] border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#e0a028]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Image URL * (Recommended 16:9 ratio)
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#040e22] border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#e0a028]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Click Action Target
                  </label>
                  <select
                    value={actionType}
                    onChange={(e) => setActionType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#040e22] border border-white/10 text-sm text-white focus:outline-none focus:border-[#e0a028]"
                  >
                    <option value="test_series">Test Series</option>
                    <option value="course">Video Course</option>
                    <option value="ai_chat">AI Tutor Chat</option>
                    <option value="url">External Link</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Target ID / Value
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 1 or URL"
                    value={actionValue}
                    onChange={(e) => setActionValue(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#040e22] border border-white/10 text-sm text-white focus:outline-none focus:border-[#e0a028]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Carousel Order Position
                </label>
                <input
                  type="number"
                  min="1"
                  value={order}
                  onChange={(e) => setOrder(e.target.value)}
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
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Add to Carousel</span>
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
