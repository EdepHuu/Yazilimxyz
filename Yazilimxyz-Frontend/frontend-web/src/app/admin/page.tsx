// src/app/admin/page.tsx
'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
}
export default function AdminDashboardPage() {

    const pathname = usePathname();
  
    // Giriş sayfası URL'leri
    const loginPaths = ['/admin/giris', '/admin/login'];
  
    const isLoginPage = loginPaths.includes(pathname);
    return (
      <div>
        {/* <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
        <p>Burası admin panelinin ana sayfasıdır.</p> */}
          {!isLoginPage && (
        <AdminSidebar currentPage={pathname?.split('/admin').pop() || 'dashboard'} />
      )}
      </div>
    );
  }
  