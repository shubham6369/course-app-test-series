'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { AdminSidebar } from '@/components/admin-sidebar';
import { AdminHeader } from '@/components/admin-header';

interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: string;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);

  // If on login page, render clean layout without sidebar/header
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (!isLoginPage) {
      // Fetch authenticated admin details
      fetch('/api/admin/auth/me')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.status === 'success' && data.user) {
            setAdminUser(data.user);
          }
        })
        .catch(() => {
          // Graceful fallback to default owner display
        });
    }
  }, [isLoginPage]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#040e22] text-slate-100 flex relative overflow-x-hidden admin-ambient-canvas">
      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-[60rem] h-[40rem] rounded-full bg-[#09214b]/60 blur-[130px]" />
        <div className="absolute top-1/2 -left-40 w-[45rem] h-[35rem] rounded-full bg-[#061432]/90 blur-[120px]" />
        <div className="absolute -bottom-40 right-1/4 w-[50rem] h-[30rem] rounded-full bg-[#e0a028]/5 blur-[140px]" />
      </div>

      {/* 24-Section Navigation Sidebar */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 z-10 min-h-screen">
        <AdminHeader
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          adminName={adminUser?.name || 'Neeraj Kumar Mahato'}
          adminRole={adminUser?.role || 'owner'}
          adminEmail={adminUser?.email || 'neerajkumarmahato740@gmail.com'}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
