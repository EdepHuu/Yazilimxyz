'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';


interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  console.log("Current pathname:", pathname); // Debug için

  // Giriş sayfası URL'leri
  const loginPaths = ['/admin/giris', '/admin/login'];

  const isLoginPage = loginPaths.includes(pathname);

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {!isLoginPage && (
        <AdminSidebar currentPage={pathname?.split('/').pop() || 'dashboard'} />
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
       

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

