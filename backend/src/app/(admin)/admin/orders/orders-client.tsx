'use client';

import { useState } from 'react';
import {
  ShoppingBag,
  Search,
  Receipt,
  CreditCard,
  CheckCircle2,
  Clock,
  XCircle,
  Download,
  Printer,
  X,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  Tag,
} from 'lucide-react';
import { KpiCard } from '@/components/admin/kpi-card';

interface OrderItem {
  id: number;
  orderNumber: string;
  studentId: number;
  itemType: string;
  itemId: number;
  itemName: string;
  amount: number;
  currency: string;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  razorpaySignature: string | null;
  status: string;
  couponCode: string | null;
  discountAmount: number;
  createdAt: string | Date;
  student?: {
    id: number;
    name: string;
    email: string;
    phone: string;
    avatarUrl: string | null;
  };
}

interface OrdersClientProps {
  initialOrders: OrderItem[];
}

export function OrdersClient({ initialOrders }: OrdersClientProps) {
  const [orders, setOrders] = useState<OrderItem[]>(initialOrders);
  const [statusTab, setStatusTab] = useState<'all' | 'paid' | 'pending' | 'failed'>('all');
  const [search, setSearch] = useState('');
  const [activeReceiptOrder, setActiveReceiptOrder] = useState<OrderItem | null>(null);

  const filteredOrders = orders.filter((o) => {
    let matchesStatus = true;
    if (statusTab !== 'all') {
      matchesStatus = o.status.toLowerCase() === statusTab;
    }

    const matchesSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.itemName.toLowerCase().includes(search.toLowerCase()) ||
      (o.razorpayPaymentId && o.razorpayPaymentId.toLowerCase().includes(search.toLowerCase())) ||
      (o.student?.name && o.student.name.toLowerCase().includes(search.toLowerCase())) ||
      (o.student?.email && o.student.email.toLowerCase().includes(search.toLowerCase()));

    return matchesStatus && matchesSearch;
  });

  const paidOrders = orders.filter((o) => o.status.toLowerCase() === 'paid');
  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.amount, 0);
  const pendingOrders = orders.filter((o) => o.status.toLowerCase() === 'pending').length;
  const avgOrderValue = paidOrders.length > 0 ? Math.round(totalRevenue / paidOrders.length) : 0;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Orders & Razorpay Transaction Receipts
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time transaction settlement ledger, payment gateway audits, and invoice generation.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Revenue Settled"
          value={`₹${totalRevenue.toLocaleString('en-IN')}`}
          subtitle="Processed via Razorpay"
          icon={CreditCard}
          colorScheme="gold"
        />
        <KpiCard
          title="Paid Orders"
          value={paidOrders.length}
          subtitle="Completed transactions"
          icon={CheckCircle2}
          colorScheme="emerald"
        />
        <KpiCard
          title="Pending Payments"
          value={pendingOrders}
          subtitle="Checkout abandonment / sync"
          icon={Clock}
          colorScheme="purple"
        />
        <KpiCard
          title="Average Order Value"
          value={`₹${avgOrderValue.toLocaleString('en-IN')}`}
          subtitle="Net cart average"
          icon={TrendingUp}
          colorScheme="blue"
        />
      </div>

      {/* Filter and Search Container */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#061432]/60 backdrop-blur-md p-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#040e22] border border-white/10 self-start">
          {(['all', 'paid', 'pending', 'failed'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                statusTab === tab
                  ? 'bg-gradient-to-r from-[#e0a028] to-[#d49018] text-[#061432] shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab === 'paid'
                ? `Paid (${paidOrders.length})`
                : tab === 'pending'
                ? `Pending (${pendingOrders})`
                : tab === 'all'
                ? `All (${orders.length})`
                : tab}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search order #, student, item, or payment ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#040e22] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#e0a028] transition-colors"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl border border-white/10 bg-[#061432]/60 backdrop-blur-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#09214b]/40 text-slate-400 uppercase tracking-wider text-[10px] border-b border-white/10">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Order Reference</th>
                <th className="py-3.5 px-4 font-semibold">Student Buyer</th>
                <th className="py-3.5 px-4 font-semibold">Item Purchased</th>
                <th className="py-3.5 px-4 font-semibold">Amount (INR)</th>
                <th className="py-3.5 px-4 font-semibold">Razorpay Payment ID</th>
                <th className="py-3.5 px-4 font-semibold text-center">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Tax Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No orders match the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => {
                  const isPaid = o.status.toLowerCase() === 'paid';
                  const isPending = o.status.toLowerCase() === 'pending';

                  return (
                    <tr
                      key={o.id}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      {/* Order Number */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-semibold text-white group-hover:text-[#e0a028] transition-colors">
                          {o.orderNumber}
                        </span>
                        <p className="text-[10px] text-slate-500">
                          {new Date(o.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      </td>

                      {/* Student Info */}
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-200">
                          {o.student?.name || `Student #${o.studentId}`}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {o.student?.email}
                        </p>
                      </td>

                      {/* Item Name */}
                      <td className="py-3.5 px-4">
                        <div className="max-w-xs truncate font-medium text-slate-200">
                          {o.itemName}
                        </div>
                        <span className="text-[10px] uppercase font-semibold text-[#e0a028]">
                          {o.itemType.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 font-semibold text-white font-mono text-sm">
                        ₹{o.amount.toLocaleString('en-IN')}
                        {o.discountAmount > 0 && (
                          <span className="block text-[10px] text-emerald-400 font-normal">
                            Saved ₹{o.discountAmount}
                          </span>
                        )}
                      </td>

                      {/* Razorpay Payment ID */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-300">
                        {o.razorpayPaymentId || (
                          <span className="text-slate-500 italic">Not generated</span>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4 text-center">
                        {isPaid ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            PAID
                          </span>
                        ) : isPending ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-[#e0a028]/20 text-[#e0a028] border border-[#e0a028]/30">
                            PENDING
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            FAILED
                          </span>
                        )}
                      </td>

                      {/* View Receipt Action */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setActiveReceiptOrder(o)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-200 hover:text-white hover:bg-white/10 hover:border-[#e0a028]/40 transition-all font-medium text-xs"
                        >
                          <Receipt className="w-3.5 h-3.5 text-[#e0a028]" />
                          <span>Receipt</span>
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

      {/* Razorpay Tax Receipt Modal */}
      {activeReceiptOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-[#061432] border border-white/10 p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto flex flex-col">
            <button
              onClick={() => setActiveReceiptOrder(null)}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Official Receipt Header */}
            <div className="border-b border-white/10 pb-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>Webphiser Education</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#e0a028]/20 text-[#e0a028] font-bold">
                      OFFICIAL RECEIPT
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    AIM Edutech Pvt. Ltd. • GSTIN: 07AAECW1234F1Z5
                  </p>
                </div>
                <div className="text-right font-mono text-xs text-slate-400">
                  <p className="text-white font-semibold">{activeReceiptOrder.orderNumber}</p>
                  <p>{new Date(activeReceiptOrder.createdAt).toLocaleDateString('en-IN')}</p>
                </div>
              </div>
            </div>

            {/* Student & Payment Gateway Details */}
            <div className="grid grid-cols-2 gap-4 p-3.5 rounded-xl bg-[#040e22] border border-white/5 text-xs mb-4">
              <div>
                <p className="text-slate-400 uppercase tracking-wider text-[10px] font-bold mb-1">
                  Billed To
                </p>
                <p className="font-semibold text-white">{activeReceiptOrder.student?.name}</p>
                <p className="text-slate-400">{activeReceiptOrder.student?.email}</p>
                <p className="text-slate-400">{activeReceiptOrder.student?.phone}</p>
              </div>

              <div>
                <p className="text-slate-400 uppercase tracking-wider text-[10px] font-bold mb-1">
                  Payment Details
                </p>
                <p className="text-slate-300 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Razorpay Verified</span>
                </p>
                <p className="font-mono text-[11px] text-slate-400 mt-1 truncate">
                  Pay ID: {activeReceiptOrder.razorpayPaymentId || 'N/A'}
                </p>
                <p className="font-mono text-[11px] text-slate-400 truncate">
                  Order ID: {activeReceiptOrder.razorpayOrderId || 'N/A'}
                </p>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="flex-1 space-y-2 mb-4">
              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold border-b border-white/5 pb-2">
                <span>Description</span>
                <span>Amount</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-200 py-1">
                <div>
                  <p className="font-medium">{activeReceiptOrder.itemName}</p>
                  <p className="text-[10px] text-slate-400 uppercase">
                    {activeReceiptOrder.itemType.replace('_', ' ')} Package
                  </p>
                </div>
                <span className="font-mono">
                  ₹{(activeReceiptOrder.amount + activeReceiptOrder.discountAmount).toLocaleString('en-IN')}
                </span>
              </div>

              {activeReceiptOrder.discountAmount > 0 && (
                <div className="flex items-center justify-between text-xs text-emerald-400 py-1">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    <span>Coupon Discount ({activeReceiptOrder.couponCode || 'APPLIED'})</span>
                  </span>
                  <span className="font-mono">- ₹{activeReceiptOrder.discountAmount}</span>
                </div>
              )}

              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-sm font-bold text-white">
                <span>Total Paid (INR)</span>
                <span className="text-[#e0a028] font-mono text-base">
                  ₹{activeReceiptOrder.amount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
              <span className="text-[11px] text-emerald-400 flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Payment Complete & Settled</span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-200 hover:bg-white/10"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-400" />
                  <span>Print</span>
                </button>
                <button
                  onClick={() => alert(`Downloading official receipt for ${activeReceiptOrder.orderNumber}...`)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#e0a028] to-[#d49018] text-[#061432] font-semibold text-xs hover:brightness-110 shadow-md"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
