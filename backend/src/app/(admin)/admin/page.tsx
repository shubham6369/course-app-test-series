import Link from 'next/link';
import prisma from '@/lib/prisma';
import {
  Sparkles,
  Users2,
  HelpCircle,
  TrendingUp,
  FileQuestion,
  BookOpen,
  ShoppingBag,
  ArrowRight,
  ExternalLink,
  Layers,
  Clock,
  CheckCircle2,
  AlertCircle,
  PlayCircle,
} from 'lucide-react';
import { KpiCard } from '@/components/admin/kpi-card';
import { RevenueChart, RevenueDataPoint } from '@/components/admin/revenue-chart';

// Force dynamic rendering so latest DB changes reflect immediately
export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  // 1. Fetch live metrics from Prisma in parallel
  const [
    totalStudents,
    activeStudents,
    totalAttempts,
    openDoubts,
    totalDoubts,
    paidOrdersAgg,
    allOrders,
    recentDoubts,
    recentSales,
    topCourses,
  ] = await Promise.all([
    prisma.student.count(),
    prisma.student.count({ where: { isActive: true } }),
    prisma.quizAttempt.count(),
    prisma.doubt.count({ where: { status: { in: ['open', 'pending'] } } }),
    prisma.doubt.count(),
    prisma.order.aggregate({
      _sum: { amount: true },
      where: { status: 'paid' },
    }),
    prisma.order.findMany({
      where: { status: 'paid' },
      select: { amount: true, createdAt: true },
    }),
    prisma.doubt.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        student: { select: { name: true, avatarUrl: true, email: true } },
      },
    }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        student: { select: { name: true, email: true } },
      },
    }),
    prisma.course.findMany({
      take: 4,
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        folders: {
          include: {
            lessons: true,
          },
        },
        enrollments: true,
      },
    }),
  ]);

  const totalRevenue = paidOrdersAgg._sum.amount || 0;

  // 2. Build 14-day rolling revenue data
  const now = new Date();
  const dailyMap = new Map<string, { revenue: number; count: number }>();

  // Initialize the past 14 days
  const chartDays: { dateStr: string; displayStr: string }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const displayStr = d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    chartDays.push({ dateStr, displayStr });
    dailyMap.set(dateStr, { revenue: 0, count: 0 });
  }

  // Populate from real orders
  allOrders.forEach((o) => {
    const oDateStr = o.createdAt.toISOString().split('T')[0];
    if (dailyMap.has(oDateStr)) {
      const cur = dailyMap.get(oDateStr)!;
      dailyMap.set(oDateStr, {
        revenue: cur.revenue + o.amount,
        count: cur.count + 1,
      });
    }
  });

  const chartData: RevenueDataPoint[] = chartDays.map(({ dateStr, displayStr }) => {
    const item = dailyMap.get(dateStr) || { revenue: 0, count: 0 };
    return {
      date: dateStr,
      displayDate: displayStr,
      revenue: item.revenue,
      ordersCount: item.count,
    };
  });

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-[#09214b]/80 via-[#061432]/90 to-[#09214b]/70 backdrop-blur-xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 rounded-full bg-[#e0a028]/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e0a028]/15 border border-[#e0a028]/30 text-xs font-semibold text-[#e0a028] mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Webphiser Education Command Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Welcome back, Neeraj Kumar Mahato
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Platform status is normal. 24 administration modules are online and synchronized with mobile clients.
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-2">
            <span className="px-3.5 py-1.5 rounded-xl bg-[#e0a028]/20 border border-[#e0a028]/40 text-[#e0a028] text-xs font-bold uppercase tracking-wider">
              Role: Owner
            </span>
          </div>
        </div>
      </div>

      {/* 4 Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Students"
          value={totalStudents.toLocaleString()}
          subtitle={`${activeStudents} active profiles`}
          change="+14% this month"
          isPositive={true}
          icon={Users2}
          colorScheme="gold"
          badge="Live Roster"
        />
        <KpiCard
          title="Test Attempts"
          value={totalAttempts.toLocaleString()}
          subtitle="CBT exams submitted"
          change="+28% submissions"
          isPositive={true}
          icon={FileQuestion}
          colorScheme="blue"
          badge="Live NTA"
        />
        <KpiCard
          title="Open Doubts"
          value={openDoubts}
          subtitle={`${totalDoubts} total recorded`}
          change={openDoubts > 0 ? `${openDoubts} need reply` : 'All resolved'}
          isPositive={openDoubts === 0}
          icon={HelpCircle}
          colorScheme={openDoubts > 0 ? 'purple' : 'emerald'}
          badge="Desk"
        />
        <KpiCard
          title="Total Revenue"
          value={`₹${totalRevenue.toLocaleString('en-IN')}`}
          subtitle="Direct payment gateway"
          change="+18.4% growth"
          isPositive={true}
          icon={TrendingUp}
          colorScheme="emerald"
          badge="Razorpay"
        />
      </div>

      {/* 14-Day Revenue Analytics Chart */}
      <RevenueChart data={chartData} totalRevenue={totalRevenue} />

      {/* Grid: Recent Doubts & Recent Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Doubts Table */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#09214b]/50 to-[#061432]/70 backdrop-blur-xl p-5 sm:p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#e0a028]/15 border border-[#e0a028]/30 flex items-center justify-center text-[#e0a028]">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Recent Doubts</h3>
                  <p className="text-xs text-slate-400">Student queries pending resolution</p>
                </div>
              </div>
              <Link
                href="/admin/doubts"
                className="text-xs text-[#e0a028] hover:underline flex items-center gap-1 font-medium"
              >
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-white/5 overflow-hidden">
              {recentDoubts.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-sm">
                  No student doubts reported yet.
                </div>
              ) : (
                recentDoubts.map((doubt) => {
                  const isOpen = doubt.status === 'open' || doubt.status === 'pending';
                  return (
                    <div
                      key={doubt.id}
                      className="py-3.5 flex items-start justify-between gap-3 group hover:bg-white/[0.02] -mx-2 px-2 rounded-xl transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-white truncate">
                            {doubt.student?.name || doubt.studentName}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/5">
                            {doubt.subject}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 line-clamp-1 group-hover:text-white transition-colors">
                          {doubt.question}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(doubt.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full uppercase border ${
                          isOpen
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}
                      >
                        {doubt.status}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          <div className="pt-4 border-t border-white/5 mt-2">
            <Link
              href="/admin/doubts"
              className="w-full py-2 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-colors text-center block"
            >
              Open Doubts Desk
            </Link>
          </div>
        </div>

        {/* Recent Sales Table */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#09214b]/50 to-[#061432]/70 backdrop-blur-xl p-5 sm:p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Recent Transactions</h3>
                  <p className="text-xs text-slate-400">Settled purchases via Razorpay</p>
                </div>
              </div>
              <Link
                href="/admin/orders"
                className="text-xs text-[#e0a028] hover:underline flex items-center gap-1 font-medium"
              >
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-white/5 overflow-hidden">
              {recentSales.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-sm">
                  No orders recorded yet.
                </div>
              ) : (
                recentSales.map((order) => {
                  const isPaid = order.status === 'paid';
                  return (
                    <div
                      key={order.id}
                      className="py-3.5 flex items-start justify-between gap-3 group hover:bg-white/[0.02] -mx-2 px-2 rounded-xl transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-white truncate">
                            {order.student?.name || 'Student'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {order.orderNumber}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 truncate">
                          {order.itemName}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 font-mono">
                          {order.razorpayPaymentId || 'PG-DIRECT'} •{' '}
                          {new Date(order.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-white">
                          ₹{order.amount.toLocaleString('en-IN')}
                        </p>
                        <span
                          className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase mt-1 border ${
                            isPaid
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          <div className="pt-4 border-t border-white/5 mt-2">
            <Link
              href="/admin/orders"
              className="w-full py-2 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-colors text-center block"
            >
              Open Orders & Transactions
            </Link>
          </div>
        </div>
      </div>

      {/* Top Courses Section */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#09214b]/50 to-[#061432]/70 backdrop-blur-xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Featured Courses Catalog</h3>
              <p className="text-xs text-slate-400">Active curriculum tracks & student enrollments</p>
            </div>
          </div>
          <Link
            href="/admin/courses"
            className="text-xs text-[#e0a028] hover:underline flex items-center gap-1 font-medium"
          >
            Manage all courses <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {topCourses.map((course) => {
            const lessonsCount = course.folders.reduce(
              (acc, f) => acc + f.lessons.length,
              0
            );
            return (
              <div
                key={course.id}
                className="rounded-xl border border-white/10 bg-[#061432]/60 hover:border-[#e0a028]/40 p-4 transition-all hover:-translate-y-0.5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-2">
                    <span className="px-2 py-0.5 rounded-md bg-[#e0a028]/15 text-[#e0a028] font-medium border border-[#e0a028]/25">
                      {course.category?.name || 'General'}
                    </span>
                    <span className="text-slate-400 flex items-center gap-1">
                      <PlayCircle className="w-3 h-3 text-slate-400" />
                      {lessonsCount} lessons
                    </span>
                  </div>

                  <h4 className="font-semibold text-sm text-white line-clamp-2 mt-1">
                    {course.title}
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                    {course.description || 'Comprehensive video curriculum.'}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Enrolled</span>
                    <span className="text-xs font-bold text-white">
                      {course.enrollments.length} Students
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-[#e0a028]">
                      {course.discountPrice && course.discountPrice > 0
                        ? `₹${course.discountPrice.toLocaleString('en-IN')}`
                        : course.price > 0
                        ? `₹${course.price.toLocaleString('en-IN')}`
                        : 'FREE'}
                    </span>
                    {course.discountPrice && course.discountPrice < course.price && (
                      <span className="text-[10px] text-slate-400 line-through block">
                        ₹{course.price.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Launch Shortcuts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'New Course Builder', href: '/admin/courses/new', icon: BookOpen, desc: 'Multi-folder syllabus' },
          { label: 'CBT Quiz Question Bank', href: '/admin/quizzes', icon: FileQuestion, desc: 'Positive/negative marking' },
          { label: 'Test Series Packages', href: '/admin/test-series', icon: Layers, desc: 'Exam bundle manager' },
          { label: 'Platform Test Analytics', href: '/admin/test-analytics', icon: TrendingUp, desc: 'Rankings & distribution' },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <Link
              key={idx}
              href={item.href}
              className="p-4 rounded-xl border border-white/10 bg-[#09214b]/30 hover:border-[#e0a028]/40 hover:bg-[#09214b]/50 transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-[#061432] border border-white/10 group-hover:border-[#e0a028] flex items-center justify-center text-[#e0a028] mb-2.5 transition-colors">
                <Icon className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-semibold text-white group-hover:text-[#e0a028] transition-colors">
                {item.label}
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
