'use client';

import React from 'react';
import Sidebar from '@/components/merchant/Sidebar';
import Topbar from '@/components/merchant/Topbar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full flex bg-slate-50">
      {/* Sol menü - tüm (dashboard) sayfalarında kalıcı */}
      <aside className="hidden md:flex w-64 min-h-screen flex-col bg-slate-900 text-slate-100">
        <Sidebar />
      </aside>

      {/* İçerik + Topbar */}
      <div className="flex-1 flex flex-col">
        <header className="sticky top-0 z-10">
          <Topbar />
        </header>
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
