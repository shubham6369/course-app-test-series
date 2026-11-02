'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  FileQuestion,
  Layers,
  BarChart3,
  FileText,
  BookMarked,
  Radio,
  Users2,
  HelpCircle,
  MessagesSquare,
  GraduationCap,
  UserX,
  UserCheck,
  ShoppingBag,
  Ticket,
  Bot,
  Image as ImageIcon,
  Bell,
  Megaphone,
  Settings,
  ShieldCheck,
  Palette,
  CreditCard,
  X,
  Shield,
  ChevronRight,
} from 'lucide-react';

export interface NavSection {
  title: string;
  items: {
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }[];
}

export const ADMIN_NAV_SECTIONS: NavSection[] = [
  {
    title: 'Main Management',
    items: [
      { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
      { label: 'Courses & Curriculum', href: '/admin/courses', icon: BookOpen },
      { label: 'Quizzes', href: '/admin/quizzes', icon: FileQuestion },
      { label: 'Test Series', href: '/admin/test-series', icon: Layers },
      { label: 'Test Analytics', href: '/admin/test-analytics', icon: BarChart3 },
    ],
  },
  {
    title: 'Learning & Content',
    items: [
      { label: 'Notes & Videos', href: '/admin/resources', icon: FileText },
      { label: 'E-Books', href: '/admin/ebooks', icon: BookMarked },
      { label: 'Live Classes', href: '/admin/live', icon: Radio },
      { label: 'Community Posts', href: '/admin/community', icon: Users2 },
      { label: 'Doubts Desk', href: '/admin/doubts', icon: HelpCircle, badge: 'Desk' },
      { label: 'Video Comments', href: '/admin/comments', icon: MessagesSquare },
    ],
  },
  {
    title: 'Students & Commerce',
    items: [
      { label: 'Students Directory', href: '/admin/students', icon: GraduationCap },
      { label: 'Deletion Requests', href: '/admin/deletion-requests', icon: UserX },
      { label: 'Enrollments', href: '/admin/enrollments', icon: UserCheck },
      { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
      { label: 'Coupons', href: '/admin/coupons', icon: Ticket },
    ],
  },
  {
    title: 'Engagement & Operations',
    items: [
      { label: 'AI Tutor', href: '/admin/ai', icon: Bot, badge: 'AI' },
      { label: 'Banners', href: '/admin/banners', icon: ImageIcon },
      { label: 'Notifications', href: '/admin/notifications', icon: Bell },
      { label: 'Announcements', href: '/admin/announcements', icon: Megaphone },
    ],
  },
  {
    title: 'Configuration & System',
    items: [
      { label: 'Settings', href: '/admin/settings', icon: Settings },
      { label: 'Team / Staff', href: '/admin/staff', icon: ShieldCheck },
      { label: 'Branding', href: '/admin/setup', icon: Palette },
      { label: 'Billing', href: '/admin/billing', icon: CreditCard },
    ],
  },
];

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function AdminSidebar({ isOpen = false, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#061432]/95 border-r border-white/10 backdrop-blur-xl flex flex-col transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-white/10 flex items-center justify-between shrink-0">
          <Link href="/admin" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#09214b] to-[#061432] border border-[#e0a028]/40 flex items-center justify-center shadow-md shadow-[#09214b]/80 group-hover:border-[#e0a028] transition-colors">
              <Shield className="w-5 h-5 text-[#e0a028]" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
                Webphiser
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#e0a028]/20 text-[#e0a028] font-semibold">
                  PRO
                </span>
              </span>
              <span className="text-[11px] text-slate-400">AIM Edutech Admin</span>
            </div>
          </Link>

          {/* Mobile Close Button */}
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Scrollable Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {ADMIN_NAV_SECTIONS.map((section, idx) => (
            <div key={idx} className="space-y-1">
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                {section.title}
              </div>
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.href === '/admin'
                      ? pathname === '/admin'
                      : pathname === item.href || pathname.startsWith(`${item.href}/`);

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                          isActive
                            ? 'bg-gradient-to-r from-[#e0a028]/20 to-[#09214b]/40 text-[#e0a028] border-r-2 border-[#e0a028] shadow-sm'
                            : 'text-slate-300 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon
                            className={`w-4 h-4 shrink-0 transition-colors ${
                              isActive
                                ? 'text-[#e0a028]'
                                : 'text-slate-400 group-hover:text-slate-200'
                            }`}
                          />
                          <span className="truncate">{item.label}</span>
                        </div>
                        {item.badge ? (
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${
                              item.badge === 'AI'
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                : 'bg-[#e0a028]/15 text-[#e0a028]'
                            }`}
                          >
                            {item.badge}
                          </span>
                        ) : isActive ? (
                          <ChevronRight className="w-3.5 h-3.5 text-[#e0a028] shrink-0" />
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* System Version Footer */}
        <div className="p-3 border-t border-white/10 text-[11px] text-slate-400 flex items-center justify-between shrink-0 bg-[#040e22]/50">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>v2.4 System Live</span>
          </div>
          <span className="font-mono text-[10px] text-slate-500">24 Sections</span>
        </div>
      </aside>
    </>
  );
}

export default AdminSidebar;
