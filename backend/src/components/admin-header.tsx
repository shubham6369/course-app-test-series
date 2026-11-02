'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Menu,
  Bell,
  LogOut,
  ChevronRight,
  Activity,
  User,
  Loader2,
} from 'lucide-react';

interface AdminHeaderProps {
  onToggleSidebar?: () => void;
  adminName?: string;
  adminRole?: string;
  adminEmail?: string;
}

const ROUTE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/admin': { title: 'Admin Dashboard', subtitle: 'Overview & 14-day analytics' },
  '/admin/courses': { title: 'Courses & Curriculum', subtitle: 'Manage video lessons, folders & syllabus' },
  '/admin/courses/new': { title: 'Create New Course', subtitle: 'Configure course syllabus & pricing' },
  '/admin/quizzes': { title: 'CBT Quizzes', subtitle: 'Question bank & NTA marking scheme' },
  '/admin/test-series': { title: 'Test Series', subtitle: 'Package tests by exam category' },
  '/admin/test-analytics': { title: 'Test Analytics', subtitle: 'Score distributions, percentiles & ranks' },
  '/admin/resources': { title: 'Notes & Videos', subtitle: 'PDF documents & study attachments' },
  '/admin/ebooks': { title: 'E-Books Store', subtitle: 'Digital reading material' },
  '/admin/live': { title: 'Live Classes', subtitle: 'Scheduled webinars & interactive streams' },
  '/admin/community': { title: 'Community Posts', subtitle: 'Student discussion feed moderation' },
  '/admin/doubts': { title: 'Doubts Desk', subtitle: 'Student inquiries & faculty replies' },
  '/admin/comments': { title: 'Video Comments', subtitle: 'Course video comment moderation' },
  '/admin/students': { title: 'Students Directory', subtitle: 'Profiles, enrollments & attempts' },
  '/admin/deletion-requests': { title: 'Deletion Requests', subtitle: 'Student account deletion compliance' },
  '/admin/enrollments': { title: 'Enrollments', subtitle: 'Manual course & test enrollments' },
  '/admin/orders': { title: 'Orders & Payments', subtitle: 'Razorpay transactions & receipts' },
  '/admin/coupons': { title: 'Coupons & Discounts', subtitle: 'Promotional discount codes' },
  '/admin/ai': { title: 'AI Academic Tutor', subtitle: 'Prompt controls & audit logs' },
  '/admin/banners': { title: 'Promotional Banners', subtitle: 'Mobile home carousel slides' },
  '/admin/notifications': { title: 'Push Notifications', subtitle: 'FCM push broadcasts' },
  '/admin/announcements': { title: 'Announcements', subtitle: 'System-wide marquee broadcasts' },
  '/admin/settings': { title: 'Platform Settings', subtitle: 'Global configurations' },
  '/admin/staff': { title: 'Team & Staff', subtitle: 'Faculty roles & permissions' },
  '/admin/setup': { title: 'Branding & Themes', subtitle: 'White-label colors & assets' },
  '/admin/billing': { title: 'Billing & Plan', subtitle: 'Subscription & license tier' },
};

export function AdminHeader({
  onToggleSidebar,
  adminName = 'Neeraj Kumar Mahato',
  adminRole = 'owner',
  adminEmail = 'neerajkumarmahato740@gmail.com',
}: AdminHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Match current route or fallback
  const currentInfo =
    ROUTE_TITLES[pathname] || {
      title: 'Admin Console',
      subtitle: pathname.replace('/admin/', '').replace('-', ' '),
    };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      router.push('/admin/login');
      router.refresh();
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#061432]/90 border-b border-white/10 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between shrink-0">
      {/* Left: Mobile Toggle & Breadcrumb / Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
          className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <span>Webphiser</span>
            <ChevronRight className="w-3 h-3 text-slate-600" />
            <span className="text-[#e0a028] font-medium truncate">
              {currentInfo.title}
            </span>
          </div>
          <h2 className="text-sm font-semibold text-white tracking-tight truncate hidden sm:block">
            {currentInfo.title}
          </h2>
        </div>
      </div>

      {/* Right: Status Pill, Notifications, User Chip & Logout */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {/* Live Status Pill */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-[11px] text-emerald-300">
          <Activity className="w-3 h-3 animate-pulse text-emerald-400" />
          <span>API Active</span>
        </div>

        {/* Notifications Icon with Badge */}
        <div className="relative">
          <button
            title="Notifications"
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#e0a028]" />
          </button>
        </div>

        {/* Admin Profile Chip */}
        <div
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#09214b]/60 border border-white/10"
          title={`${adminName} (${adminEmail})`}
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#09214b] to-[#e0a028] flex items-center justify-center font-bold text-xs text-white shadow-sm border border-[#e0a028]/40">
            {adminName.charAt(0).toUpperCase() || <User className="w-3.5 h-3.5" />}
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-semibold text-slate-200 leading-tight truncate max-w-[120px]">
              {adminName}
            </span>
            <span className="text-[10px] text-[#e0a028] font-medium uppercase tracking-wider">
              {adminRole}
            </span>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          title="Sign out of Admin"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-red-300 bg-red-950/30 border border-red-500/20 hover:bg-red-950/60 hover:border-red-500/40 hover:text-red-200 transition-all disabled:opacity-50"
        >
          {isLoggingOut ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <LogOut className="w-3.5 h-3.5" />
          )}
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}

export default AdminHeader;
