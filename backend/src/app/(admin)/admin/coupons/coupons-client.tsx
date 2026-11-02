'use client';

import { useState } from 'react';
import {
  Ticket,
  Plus,
  Search,
  Percent,
  DollarSign,
  Calendar,
  Trash2,
  CheckCircle2,
  X,
  Loader2,
  Copy,
  Check,
} from 'lucide-react';
import { KpiCard } from '@/components/admin/kpi-card';

interface CouponItem {
  id: number;
  code: string;
  discountType: string;
  discountValue: number;
  minOrderAmount: number;
  maxDiscount: number | null;
  validUntil: string | Date | null;
  usageLimit: number | null;
  usedCount: number;
  isActive: boolean;
  createdAt: string | Date;
}

interface CouponsClientProps {
  initialCoupons: CouponItem[];
}

export function CouponsClient({ initialCoupons }: CouponsClientProps) {
  const [coupons, setCoupons] = useState<CouponItem[]>(initialCoupons);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Form state
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState('20');
  const [minOrderAmount, setMinOrderAmount] = useState('499');
  const [maxDiscount, setMaxDiscount] = useState('500');
  const [validUntil, setValidUntil] = useState('');
  const [usageLimit, setUsageLimit] = useState('500');

  const filteredCoupons = coupons.filter((c) =>
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = coupons.filter((c) => c.isActive).length;
  const totalRedemptions = coupons.reduce((sum, c) => sum + c.usedCount, 0);

  const handleToggleActive = async (id: number, current: boolean) => {
    setTogglingId(id);
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: !current }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setCoupons(
          coupons.map((c) => (c.id === id ? { ...c, isActive: !current } : c))
        );
      }
    } catch (err) {
      console.error('Error toggling coupon status:', err);
    } finally {
      setTogglingId(null);
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !discountValue) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          discountType,
          discountValue,
          minOrderAmount,
          maxDiscount: discountType === 'percentage' ? maxDiscount : null,
          validUntil: validUntil || null,
          usageLimit,
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setCoupons([data.data, ...coupons]);
        setIsModalOpen(false);
        setCode('');
      } else {
        alert(data.message || 'Failed to create coupon');
      }
    } catch (err) {
      console.error('Error creating coupon:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this promo coupon?')) return;
    try {
      const res = await fetch(`/api/admin/coupons?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCoupons(coupons.filter((c) => c.id !== id));
      }
    } catch (err) {
      console.error('Error deleting coupon:', err);
    }
  };

  const handleCopy = (couponCode: string) => {
    navigator.clipboard.writeText(couponCode);
    setCopiedCode(couponCode);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Coupons & Promotional Discounts
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure percentage discounts, fixed vouchers, usage caps, and validity windows.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#e0a028] to-[#d49018] text-[#061432] font-semibold text-sm hover:brightness-110 shadow-lg shadow-[#e0a028]/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Coupon Code</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Active Campaigns"
          value={activeCount}
          subtitle="Currently claimable"
          icon={Ticket}
          colorScheme="gold"
        />
        <KpiCard
          title="Total Redemptions"
          value={totalRedemptions}
          subtitle="Times claimed by students"
          icon={CheckCircle2}
          colorScheme="emerald"
        />
        <KpiCard
          title="Configured Codes"
          value={coupons.length}
          subtitle="Total marketing vouchers"
          icon={Percent}
          colorScheme="blue"
        />
        <KpiCard
          title="Conversion Impact"
          value="High"
          subtitle="Checkout incentive boost"
          icon={DollarSign}
          colorScheme="purple"
        />
      </div>

      {/* Search Input */}
      <div className="rounded-2xl border border-white/10 bg-[#061432]/60 backdrop-blur-md p-4 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search coupon code (e.g. FLAT50)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#040e22] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#e0a028] transition-colors"
          />
        </div>
        <span className="text-xs text-slate-400">
          Showing {filteredCoupons.length} coupons
        </span>
      </div>

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCoupons.map((coupon) => {
          const isPercentage = coupon.discountType === 'percentage';
          const usagePercent =
            coupon.usageLimit && coupon.usageLimit > 0
              ? Math.min(Math.round((coupon.usedCount / coupon.usageLimit) * 100), 100)
              : 0;

          return (
            <div
              key={coupon.id}
              className={`rounded-2xl border p-5 backdrop-blur-md transition-all flex flex-col justify-between shadow-lg relative overflow-hidden group ${
                coupon.isActive
                  ? 'border-[#e0a028]/40 bg-[#061432]/80 hover:border-[#e0a028]'
                  : 'border-white/10 bg-[#061432]/40 opacity-75'
              }`}
            >
              {/* Top Row: Code Badge & Copy */}
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-xl bg-[#e0a028]/15 border border-[#e0a028]/40 font-mono font-bold text-sm text-[#e0a028] tracking-wider flex items-center gap-1.5">
                      <Ticket className="w-4 h-4" />
                      {coupon.code}
                    </span>
                    <button
                      onClick={() => handleCopy(coupon.code)}
                      title="Copy Code"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      {copiedCode === coupon.code ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  <button
                    onClick={() => handleToggleActive(coupon.id, coupon.isActive)}
                    disabled={togglingId === coupon.id}
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      coupon.isActive
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                    }`}
                  >
                    {coupon.isActive ? 'Active' : 'Disabled'}
                  </button>
                </div>

                {/* Discount Value */}
                <div className="mt-4">
                  <p className="text-2xl font-extrabold text-white">
                    {isPercentage ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} FLAT OFF`}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Min order: ₹{coupon.minOrderAmount}
                    {coupon.maxDiscount ? ` • Max cap: ₹${coupon.maxDiscount}` : ''}
                  </p>
                </div>

                {/* Usage Bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
                    <span>Usage</span>
                    <span className="font-mono text-slate-300">
                      {coupon.usedCount} / {coupon.usageLimit || '∞'} ({usagePercent}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#040e22] overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#e0a028] to-emerald-400 rounded-full transition-all duration-300"
                      style={{ width: `${usagePercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Footer */}
              <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {coupon.validUntil
                      ? `Expires ${new Date(coupon.validUntil).toLocaleDateString('en-IN')}`
                      : 'Lifetime validity'}
                  </span>
                </span>

                <button
                  onClick={() => handleDelete(coupon.id)}
                  title="Delete Coupon"
                  className="p-1.5 rounded-lg text-rose-400 hover:text-rose-200 hover:bg-rose-950/40 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Coupon Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-[#061432] border border-white/10 p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">
              Create Promotional Coupon
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Add discount codes applicable to courses and CBT test series purchases.
            </p>

            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TARGET2026"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 rounded-xl bg-[#040e22] border border-white/10 text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-[#e0a028]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Discount Type
                  </label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as 'percentage' | 'fixed')}
                    className="w-full px-3 py-2 rounded-xl bg-[#040e22] border border-white/10 text-sm text-white focus:outline-none focus:border-[#e0a028]"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#040e22] border border-white/10 text-sm text-white focus:outline-none focus:border-[#e0a028]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Min Order Amount (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={minOrderAmount}
                    onChange={(e) => setMinOrderAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#040e22] border border-white/10 text-sm text-white focus:outline-none focus:border-[#e0a028]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Max Discount Cap (₹)
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Optional"
                    value={maxDiscount}
                    onChange={(e) => setMaxDiscount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#040e22] border border-white/10 text-sm text-white focus:outline-none focus:border-[#e0a028]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Valid Until Date
                  </label>
                  <input
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#040e22] border border-white/10 text-sm text-white focus:outline-none focus:border-[#e0a028]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Usage Cap Limit
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#040e22] border border-white/10 text-sm text-white focus:outline-none focus:border-[#e0a028]"
                  />
                </div>
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
                    <span>Publish Coupon</span>
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
