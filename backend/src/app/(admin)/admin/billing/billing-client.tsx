'use client';

import { useState } from 'react';
import {
  CreditCard,
  ShieldCheck,
  Download,
  Calendar,
  CheckCircle2,
  HardDrive,
  Users,
  Zap,
  TrendingUp,
} from 'lucide-react';
import { KpiCard } from '@/components/admin/kpi-card';

interface BillingData {
  plan: {
    name: string;
    status: string;
    renewalDate: string;
    storageQuota: string;
    seatsAllowed: string;
  };
  metrics: {
    totalRevenue: number;
    paidOrdersCount: number;
    activeSeats: number;
    registeredStudents: number;
  };
  invoices: {
    id: string;
    period: string;
    tier: string;
    amount: number;
    status: string;
    date: string;
    receiptUrl: string;
  }[];
}

interface BillingClientProps {
  initialData: BillingData;
}

export function BillingClient({ initialData }: BillingClientProps) {
  const { plan, metrics, invoices } = initialData;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <span>Platform Billing, Tier & License</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Active Enterprise
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Overview of your infrastructure license, student seat quotas, and payment gateway settlement summaries.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Gross Revenue"
          value={`₹${metrics.totalRevenue.toLocaleString('en-IN')}`}
          subtitle="Processed through platform"
          icon={TrendingUp}
          colorScheme="gold"
        />
        <KpiCard
          title="Active Enrolled Seats"
          value={metrics.activeSeats}
          subtitle="Enrolled student licenses"
          icon={Users}
          colorScheme="blue"
        />
        <KpiCard
          title="Successful Orders"
          value={metrics.paidOrdersCount}
          subtitle="Direct Razorpay sales"
          icon={CreditCard}
          colorScheme="emerald"
        />
        <KpiCard
          title="Gateway Settlement"
          value="T+2 Schedule"
          subtitle="Direct bank transfers"
          icon={ShieldCheck}
          colorScheme="purple"
        />
      </div>

      {/* Plan Card */}
      <div className="rounded-2xl border border-[#e0a028]/30 bg-gradient-to-r from-[#09214b]/80 via-[#061432]/90 to-[#09214b]/70 backdrop-blur-md p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 rounded-xl bg-[#e0a028] text-[#061432] font-black text-xs uppercase tracking-wider shadow-md">
                CURRENT TIER
              </span>
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Next Renewal: {plan.renewalDate}</span>
              </span>
            </div>

            <h2 className="text-2xl font-extrabold text-white mt-3">
              {plan.name}
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
              Full-featured LMS & CBT Exam Software suite with AI Academic Tutor, automated NTA scoring algorithms, unlimited student enrollments, and customized branding.
            </p>

            <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-300">
              <span className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-[#e0a028]" />
                <span>{plan.seatsAllowed}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <HardDrive className="w-4 h-4 text-[#e0a028]" />
                <span>{plan.storageQuota}</span>
              </span>
            </div>
          </div>

          <div className="shrink-0 p-4 rounded-xl bg-[#040e22]/90 border border-white/10 text-right">
            <span className="text-[11px] text-slate-400 uppercase font-semibold">
              License Status
            </span>
            <p className="text-xl font-bold text-emerald-400">
              Verified & Active
            </p>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">
              Ref: LIC-AIM-2026-X992
            </p>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="rounded-2xl border border-white/10 bg-[#061432]/60 backdrop-blur-md overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="font-semibold text-sm text-white">
            Platform Hosting Invoices & Tax Receipts
          </h3>
          <span className="text-xs text-slate-400">
            {invoices.length} historical statements
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#09214b]/40 text-slate-400 uppercase tracking-wider text-[10px] border-b border-white/10">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Invoice Reference</th>
                <th className="py-3.5 px-4 font-semibold">Billing Period</th>
                <th className="py-3.5 px-4 font-semibold">Plan Tier</th>
                <th className="py-3.5 px-4 font-semibold">Amount (INR)</th>
                <th className="py-3.5 px-4 font-semibold text-center">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {invoices.map((inv) => (
                <tr
                  key={inv.id}
                  className="hover:bg-white/[0.02] transition-colors"
                >
                  <td className="py-3.5 px-4 font-mono font-semibold text-white">
                    {inv.id}
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">
                    {inv.period}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    {inv.tier}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-white">
                    ₹{inv.amount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      PAID
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => alert(`Downloading invoice receipt for ${inv.id}...`)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-200 hover:text-white hover:bg-white/10 text-xs transition-colors"
                    >
                      <Download className="w-3.5 h-3.5 text-[#e0a028]" />
                      <span>PDF</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
