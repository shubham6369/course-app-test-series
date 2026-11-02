import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: string;
  isPositive?: boolean;
  icon: LucideIcon;
  badge?: string;
  colorScheme?: 'gold' | 'blue' | 'emerald' | 'purple';
}

export function KpiCard({
  title,
  value,
  subtitle,
  change,
  isPositive = true,
  icon: Icon,
  badge,
  colorScheme = 'gold',
}: KpiCardProps) {
  const schemeStyles = {
    gold: {
      iconBg: 'bg-[#e0a028]/15',
      iconBorder: 'border-[#e0a028]/30',
      iconColor: 'text-[#e0a028]',
      accentGlow: 'from-[#e0a028]/10',
    },
    blue: {
      iconBg: 'bg-blue-500/15',
      iconBorder: 'border-blue-500/30',
      iconColor: 'text-blue-400',
      accentGlow: 'from-blue-500/10',
    },
    emerald: {
      iconBg: 'bg-emerald-500/15',
      iconBorder: 'border-emerald-500/30',
      iconColor: 'text-emerald-400',
      accentGlow: 'from-emerald-500/10',
    },
    purple: {
      iconBg: 'bg-purple-500/15',
      iconBorder: 'border-purple-500/30',
      iconColor: 'text-purple-400',
      accentGlow: 'from-purple-500/10',
    },
  }[colorScheme];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#09214b]/60 to-[#061432]/80 backdrop-blur-md p-5 transition-all hover:border-[#e0a028]/40 hover:-translate-y-0.5 shadow-lg group">
      {/* Background ambient radial highlight */}
      <div
        className={`absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-gradient-to-br ${schemeStyles.accentGlow} to-transparent blur-2xl pointer-events-none`}
      />

      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            {title}
          </p>
          <h3 className="text-2xl sm:text-3xl font-bold text-white mt-2 tracking-tight group-hover:text-white">
            {value}
          </h3>
        </div>
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center border ${schemeStyles.iconBg} ${schemeStyles.iconBorder} ${schemeStyles.iconColor} transition-transform group-hover:scale-105`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs relative z-10 border-t border-white/5 pt-3">
        {change && (
          <div
            className={`inline-flex items-center gap-1 font-medium ${
              isPositive ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {isPositive ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            <span>{change}</span>
          </div>
        )}
        {subtitle && (
          <span className="text-slate-400 truncate ml-auto">{subtitle}</span>
        )}
        {badge && (
          <span className="ml-auto px-2 py-0.5 rounded-full bg-white/5 text-slate-300 font-medium text-[10px] border border-white/10">
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}
