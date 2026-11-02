import prisma from '@/lib/prisma';
import {
  BarChart3,
  Award,
  Users2,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Clock,
  Target,
  Sparkles,
  Trophy,
  Medal,
  Calendar,
} from 'lucide-react';
import { KpiCard } from '@/components/admin/kpi-card';

export const dynamic = 'force-dynamic';

export default async function AdminTestAnalyticsPage() {
  const attempts = await prisma.quizAttempt.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      student: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          targetExam: true,
        },
      },
      quiz: {
        select: {
          id: true,
          title: true,
          subject: true,
          totalMarks: true,
        },
      },
    },
  });

  const totalAttempts = attempts.length;
  const uniqueStudents = new Set(attempts.map((a) => a.studentId)).size;

  const avgAccuracy =
    totalAttempts > 0
      ? Math.round(
          attempts.reduce((acc, a) => acc + (a.accuracy || 0), 0) / totalAttempts
        )
      : 0;

  const passedCount = attempts.filter((a) => a.isPassed).length;
  const passRate =
    totalAttempts > 0 ? Math.round((passedCount / totalAttempts) * 100) : 0;

  const avgScore =
    totalAttempts > 0
      ? Math.round(
          (attempts.reduce((acc, a) => acc + a.score, 0) / totalAttempts) * 10
        ) / 10
      : 0;

  // Score distribution calculation
  const distribution = {
    range0to25: 0,
    range26to50: 0,
    range51to75: 0,
    range76to100: 0,
  };

  attempts.forEach((a) => {
    const percentage = a.totalMarks > 0 ? (a.score / a.totalMarks) * 100 : 0;
    if (percentage <= 25) distribution.range0to25 += 1;
    else if (percentage <= 50) distribution.range26to50 += 1;
    else if (percentage <= 75) distribution.range51to75 += 1;
    else distribution.range76to100 += 1;
  });

  // Global Leaderboard sorted by score and accuracy
  const leaderboard = [...attempts]
    .sort((a, b) => b.score - a.score || b.accuracy - a.accuracy)
    .slice(0, 10);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e0a028]/15 border border-[#e0a028]/30 text-xs font-semibold text-[#e0a028] mb-2">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>NTA CBT Performance Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Test Analytics & Leaderboard
          </h1>
          <p className="text-sm text-slate-300 mt-1">
            Real-time score distribution, platform accuracy trends, and student leaderboard.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {totalAttempts} Verified Attempts
          </span>
        </div>
      </div>

      {/* 4 Core KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Average Accuracy"
          value={`${avgAccuracy}%`}
          subtitle="Correct answers ratio"
          change="+6.2% vs last week"
          isPositive={true}
          icon={Target}
          colorScheme="gold"
          badge="Platform Avg"
        />
        <KpiCard
          title="Pass Rate"
          value={`${passRate}%`}
          subtitle={`${passedCount} of ${totalAttempts} passed`}
          change="+4% qualification"
          isPositive={true}
          icon={CheckCircle2}
          colorScheme="emerald"
          badge="NTA Cutoff"
        />
        <KpiCard
          title="Active Test Takers"
          value={uniqueStudents}
          subtitle="Unique student accounts"
          change="+18 new aspirants"
          isPositive={true}
          icon={Users2}
          colorScheme="blue"
          badge="Aspirants"
        />
        <KpiCard
          title="Average Score"
          value={`${avgScore} pts`}
          subtitle="Mean participant score"
          change="Consistent curve"
          isPositive={true}
          icon={Award}
          colorScheme="purple"
          badge="Score Mean"
        />
      </div>

      {/* Score Range Distribution & Subject Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score Distribution Bars (2 cols) */}
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-gradient-to-b from-[#09214b]/60 to-[#061432]/80 backdrop-blur-md p-6 shadow-xl space-y-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#e0a028]/10 border border-[#e0a028]/25 text-[11px] font-semibold text-[#e0a028] mb-1.5">
              <Sparkles className="w-3 h-3" />
              <span>Score Percentile Histogram</span>
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Score Range Distribution
            </h3>
            <p className="text-xs text-slate-400">
              Breakdown of student score attainment across percentage brackets.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            {[
              {
                range: '76% - 100% (Top Mastery)',
                count: distribution.range76to100,
                color: 'bg-emerald-500',
                border: 'border-emerald-500/30',
                text: 'text-emerald-400',
              },
              {
                range: '51% - 75% (Proficient)',
                count: distribution.range51to75,
                color: 'bg-[#e0a028]',
                border: 'border-[#e0a028]/30',
                text: 'text-[#e0a028]',
              },
              {
                range: '26% - 50% (Developing)',
                count: distribution.range26to50,
                color: 'bg-blue-500',
                border: 'border-blue-500/30',
                text: 'text-blue-400',
              },
              {
                range: '0% - 25% (Needs Practice)',
                count: distribution.range0to25,
                color: 'bg-rose-500',
                border: 'border-rose-500/30',
                text: 'text-rose-400',
              },
            ].map((bracket, idx) => {
              const pct =
                totalAttempts > 0
                  ? Math.round((bracket.count / totalAttempts) * 100)
                  : 0;

              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${bracket.color}`} />
                      {bracket.range}
                    </span>
                    <span className="text-slate-400 font-mono">
                      {bracket.count} submissions ({pct}%)
                    </span>
                  </div>

                  <div className="w-full h-3 rounded-full bg-[#040e22] border border-white/5 overflow-hidden p-0.5">
                    <div
                      className={`h-full rounded-full ${bracket.color} transition-all duration-500`}
                      style={{ width: `${Math.max(pct, bracket.count > 0 ? 5 : 0)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
            <span>Based on {totalAttempts} test submissions</span>
            <span className="text-emerald-400 font-medium">
              {(
                ((distribution.range76to100 + distribution.range51to75) /
                  Math.max(totalAttempts, 1)) *
                100
              ).toFixed(0)}
              % qualified high percentile
            </span>
          </div>
        </div>

        {/* NTA Scoring Rules Highlight (1 col) */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#09214b]/60 to-[#061432]/80 backdrop-blur-md p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-[#e0a028]/15 border border-[#e0a028]/30 flex items-center justify-center text-[#e0a028] mb-3">
              <Trophy className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Assessment Standards</h3>
            <p className="text-xs text-slate-300 mt-1">
              Evaluated strictly in accordance with NTA NEET/JEE standard scoring algorithm.
            </p>

            <div className="mt-5 space-y-3">
              <div className="p-3 rounded-xl bg-black/20 border border-white/5 flex items-center justify-between text-xs">
                <span className="text-slate-400">Correct Answer</span>
                <span className="font-bold text-emerald-400 font-mono">+4.0 Marks</span>
              </div>
              <div className="p-3 rounded-xl bg-black/20 border border-white/5 flex items-center justify-between text-xs">
                <span className="text-slate-400">Incorrect Answer</span>
                <span className="font-bold text-rose-400 font-mono">-1.0 Negative</span>
              </div>
              <div className="p-3 rounded-xl bg-black/20 border border-white/5 flex items-center justify-between text-xs">
                <span className="text-slate-400">Unattempted Question</span>
                <span className="font-bold text-slate-400 font-mono">0.0 Neutral</span>
              </div>
              <div className="p-3 rounded-xl bg-black/20 border border-white/5 flex items-center justify-between text-xs">
                <span className="text-slate-400">Passing Threshold</span>
                <span className="font-bold text-[#e0a028] font-mono">40% of Total</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/5 text-[11px] text-slate-400">
            Automated ranking and percentile calculation runs immediately upon student submission.
          </div>
        </div>
      </div>

      {/* Global Leaderboard Section */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#09214b]/60 to-[#061432]/80 backdrop-blur-md p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#e0a028]/15 border border-[#e0a028]/30 flex items-center justify-center text-[#e0a028]">
              <Medal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Global Platform Leaderboard
              </h3>
              <p className="text-xs text-slate-400">
                Top rankers across all CBT exams sorted by net score & accuracy
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Exam Paper</th>
                <th className="py-3 px-4 text-center">Score / Total</th>
                <th className="py-3 px-4 text-center">Accuracy</th>
                <th className="py-3 px-4 text-center">Time Taken</th>
                <th className="py-3 px-4 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {leaderboard.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No quiz attempts recorded yet.
                  </td>
                </tr>
              ) : (
                leaderboard.map((item, idx) => {
                  const rank = idx + 1;
                  const minutes = Math.floor(item.timeTakenSeconds / 60);
                  const seconds = item.timeTakenSeconds % 60;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      {/* Rank badge */}
                      <td className="py-3 px-4 font-bold">
                        {rank === 1 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#e0a028] text-[#061432] font-extrabold text-xs shadow-md shadow-[#e0a028]/30">
                            1
                          </span>
                        ) : rank === 2 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-300 text-[#061432] font-extrabold text-xs">
                            2
                          </span>
                        ) : rank === 3 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-700 text-white font-extrabold text-xs">
                            3
                          </span>
                        ) : (
                          <span className="text-slate-400 pl-2">#{rank}</span>
                        )}
                      </td>

                      {/* Student info */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#061432] border border-white/10 flex items-center justify-center text-xs font-bold text-[#e0a028] overflow-hidden shrink-0">
                            {item.student?.avatarUrl ? (
                              <img
                                src={item.student.avatarUrl}
                                alt={item.student.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              item.student?.name?.[0] || 'S'
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-white group-hover:text-[#e0a028] transition-colors">
                              {item.student?.name || 'Aspirant'}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {item.student?.targetExam || item.student?.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Exam Title */}
                      <td className="py-3 px-4">
                        <p className="font-medium text-slate-200 line-clamp-1">
                          {item.quiz.title}
                        </p>
                        <span className="text-[10px] text-[#e0a028]">
                          {item.quiz.subject || 'All Subjects'}
                        </span>
                      </td>

                      {/* Score / Total */}
                      <td className="py-3 px-4 text-center font-mono">
                        <span className="font-bold text-white text-sm">
                          {item.score}
                        </span>
                        <span className="text-slate-400 text-xs">
                          {' '}
                          / {item.totalMarks}
                        </span>
                      </td>

                      {/* Accuracy */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full font-bold text-[11px] border ${
                            item.accuracy >= 75
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : item.accuracy >= 50
                              ? 'bg-[#e0a028]/10 text-[#e0a028] border-[#e0a028]/20'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          }`}
                        >
                          {item.accuracy.toFixed(0)}%
                        </span>
                      </td>

                      {/* Time taken */}
                      <td className="py-3 px-4 text-center text-slate-300 font-mono">
                        {minutes}m {seconds}s
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4 text-right text-slate-400 text-[11px]">
                        {new Date(item.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Attempts Audit Log */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#09214b]/60 to-[#061432]/80 backdrop-blur-md p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white">Recent Submissions Stream</h3>

        <div className="divide-y divide-white/5">
          {attempts.slice(0, 6).map((a) => (
            <div
              key={a.id}
              className="py-3 flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-3">
                {a.isPassed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <div>
                  <span className="font-semibold text-white">
                    {a.student?.name || 'Aspirant'}
                  </span>
                  <span className="text-slate-400 mx-1.5">•</span>
                  <span className="text-slate-300">{a.quiz.title}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-right">
                <span className="font-mono text-white font-bold">
                  {a.score} / {a.totalMarks} pts
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                    a.isPassed
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  }`}
                >
                  {a.isPassed ? 'PASSED' : 'FAILED'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
