'use client';

import React, { useState } from 'react';
import { Calendar, DollarSign, TrendingUp, Sparkles } from 'lucide-react';

export interface RevenueDataPoint {
  date: string;         // 'YYYY-MM-DD'
  displayDate: string;  // 'Oct 20' or '20 Oct'
  revenue: number;
  ordersCount: number;
}

interface RevenueChartProps {
  data: RevenueDataPoint[];
  totalRevenue: number;
  currency?: string;
}

export function RevenueChart({
  data,
  totalRevenue,
  currency = '₹',
}: RevenueChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Chart dimensions inside SVG viewBox
  const width = 800;
  const height = 260;
  const paddingX = 40;
  const paddingTop = 25;
  const paddingBottom = 40;

  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingTop - paddingBottom;

  const maxVal = Math.max(...data.map((d) => d.revenue), 1000);
  const roundedMax = Math.ceil(maxVal / 1000) * 1000;

  // Compute point coordinates
  const points = data.map((d, i) => {
    const x = paddingX + (i / (Math.max(data.length - 1, 1))) * chartWidth;
    const y = paddingTop + chartHeight - (d.revenue / roundedMax) * chartHeight;
    return { x, y, ...d };
  });

  // Construct SVG path for line and area fill
  const linePath = points.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    // Simple smooth curve control points
    const prev = points[i - 1];
    const cpx1 = prev.x + (p.x - prev.x) / 2;
    const cpy1 = prev.y;
    const cpx2 = prev.x + (p.x - prev.x) / 2;
    const cpy2 = p.y;
    return `${acc} C ${cpx1} ${cpy1}, ${cpx2} ${cpy2}, ${p.x} ${p.y}`;
  }, '');

  const areaPath = `${linePath} L ${points[points.length - 1]?.x ?? 0} ${
    paddingTop + chartHeight
  } L ${points[0]?.x ?? 0} ${paddingTop + chartHeight} Z`;

  const averageDaily = Math.round(totalRevenue / Math.max(data.length, 1));
  const peakDay = points.reduce(
    (max, p) => (p.revenue > max.revenue ? p : max),
    points[0] || { revenue: 0, displayDate: '-' }
  );

  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#09214b]/60 via-[#061432]/70 to-[#061432]/90 backdrop-blur-xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-[#e0a028]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#e0a028]/10 border border-[#e0a028]/25 text-[11px] font-semibold text-[#e0a028] mb-2">
            <Sparkles className="w-3 h-3" />
            <span>14-Day Financial Analytics</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            Revenue Performance
            <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
              Live Gateway
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time aggregate of settled student enrollments and course purchases.
          </p>
        </div>

        {/* Quick summary stats */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-[#061432]/90 border border-white/10 text-right">
            <p className="text-[10px] uppercase font-semibold text-slate-400">14-Day Total</p>
            <p className="text-base font-bold text-[#e0a028]">
              {currency}{totalRevenue.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-[#061432]/90 border border-white/10 text-right">
            <p className="text-[10px] uppercase font-semibold text-slate-400">Daily Average</p>
            <p className="text-base font-bold text-white">
              {currency}{averageDaily.toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="relative w-full overflow-x-auto">
        <div className="min-w-[600px] w-full">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto overflow-visible select-none"
          >
            <defs>
              {/* Gradient for area fill */}
              <linearGradient id="revenueAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#e0a028" stopOpacity="0.32" />
                <stop offset="65%" stopColor="#e0a028" stopOpacity="0.05" />
                <stop offset="100%" stopColor="#09214b" stopOpacity="0.0" />
              </linearGradient>

              {/* Gradient for line stroke */}
              <linearGradient id="revenueLineGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#e0a028" />
                <stop offset="50%" stopColor="#f3c25b" />
                <stop offset="100%" stopColor="#e0a028" />
              </linearGradient>

              {/* Glow filter */}
              <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Horizontal Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
              const y = paddingTop + chartHeight * ratio;
              const val = Math.round(roundedMax * (1 - ratio));
              return (
                <g key={idx}>
                  <line
                    x1={paddingX}
                    y1={y}
                    x2={width - paddingX}
                    y2={y}
                    stroke="rgba(255, 255, 255, 0.07)"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={paddingX - 10}
                    y={y + 4}
                    textAnchor="end"
                    fill="rgba(148, 163, 184, 0.6)"
                    fontSize="10"
                    fontWeight="500"
                  >
                    {currency}{val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
                  </text>
                </g>
              );
            })}

            {/* Filled Area */}
            <path d={areaPath} fill="url(#revenueAreaGrad)" />

            {/* Main Trend Line */}
            <path
              d={linePath}
              fill="none"
              stroke="url(#revenueLineGrad)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#goldGlow)"
            />

            {/* Interactive Data Points & Hover Target */}
            {points.map((p, i) => (
              <g
                key={i}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* Vertical hover line */}
                {hoveredIdx === i && (
                  <line
                    x1={p.x}
                    y1={paddingTop}
                    x2={p.x}
                    y2={paddingTop + chartHeight}
                    stroke="#e0a028"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                    opacity="0.8"
                  />
                )}

                {/* Point circle */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={hoveredIdx === i ? 6 : 4}
                  fill={hoveredIdx === i ? '#ffffff' : '#09214b'}
                  stroke="#e0a028"
                  strokeWidth={hoveredIdx === i ? 3 : 2}
                  className="transition-all duration-150"
                />

                {/* Invisible hover capture area */}
                <rect
                  x={p.x - 20}
                  y={paddingTop}
                  width="40"
                  height={chartHeight + paddingBottom}
                  fill="transparent"
                />

                {/* X-axis date labels */}
                {(i % 2 === 0 || i === points.length - 1) && (
                  <text
                    x={p.x}
                    y={height - 12}
                    textAnchor="middle"
                    fill="rgba(148, 163, 184, 0.7)"
                    fontSize="10"
                    fontWeight="500"
                  >
                    {p.displayDate}
                  </text>
                )}
              </g>
            ))}
          </svg>
        </div>

        {/* Floating Tooltip */}
        {hoveredIdx !== null && points[hoveredIdx] && (
          <div
            className="absolute pointer-events-none transition-all duration-100 z-20"
            style={{
              left: `${(points[hoveredIdx].x / width) * 100}%`,
              top: `${(points[hoveredIdx].y / height) * 100}%`,
              transform: 'translate(-50%, -120%)',
            }}
          >
            <div className="bg-[#040e22]/95 border border-[#e0a028]/50 shadow-2xl backdrop-blur-md rounded-xl p-2.5 text-center min-w-[120px]">
              <p className="text-[10px] text-slate-400 font-medium">
                {points[hoveredIdx].date}
              </p>
              <p className="text-sm font-bold text-[#e0a028] mt-0.5">
                {currency}
                {points[hoveredIdx].revenue.toLocaleString('en-IN')}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {points[hoveredIdx].ordersCount} {points[hoveredIdx].ordersCount === 1 ? 'order' : 'orders'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer Insight */}
      <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
        <div className="flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-[#e0a028]" />
          <span>
            Highest single day:{' '}
            <strong className="text-white">
              {currency}{peakDay.revenue.toLocaleString('en-IN')}
            </strong>{' '}
            on {peakDay.displayDate}
          </span>
        </div>
        <div className="text-[11px] text-slate-400 flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>Rolling 14 Days window</span>
        </div>
      </div>
    </div>
  );
}
