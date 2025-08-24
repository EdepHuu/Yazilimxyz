"use client";
import React, { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface AdminLayoutProps {
  children: ReactNode; // Burası mutlaka olmalı
  onPageChange?: (page: string) => void;
  currentPage?: string;
  isSidebarOpen?: boolean;
  toggleSidebar?: () => void;
}

interface IconProps extends React.SVGProps<SVGSVGElement> {}

interface SidebarMenuItem {
  page: string;
  label: string;
  icon: React.ReactNode;
}

const HamburgerIcon: React.FC<IconProps> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" x2="20" y1="12" y2="12" />
    <line x1="4" x2="20" y1="6" y2="6" />
    <line x1="4" x2="20" y1="18" y2="18" />
  </svg>
);

const CloseIcon: React.FC<IconProps> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const sidebarMenuItems: SidebarMenuItem[] = [
  { page: "/admin", label: "Kontrol Paneli", icon: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3">
      <rect width="7" height="9" x="3" y="3" rx="1"></rect>
      <rect width="7" height="5" x="14" y="3" rx="1"></rect>
      <rect width="7" height="9" x="14" y="12" rx="1"></rect>
      <rect width="7" height="5" x="3" y="16" rx="1"></rect>
    </svg>
  )},
  { page: "/admin/products", label: "Ürün Yönetimi", icon: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3">
      <path d="M16 6.5V2l5 5-5 5V7.5M10.9 9.1 5.5 14.5m5.4 5.4-5.4-5.4m0 0a3 3 0 1 0-4.2-4.2M5.5 14.5a3 3 0 1 0 4.2 4.2"></path>
    </svg>
  )},
  { page: "/admin/orders", label: "Sipariş Yönetimi", icon: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3">
      <circle cx="8" cy="21" r="1"></circle>
      <circle cx="19" cy="21" r="1"></circle>
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>
    </svg>
  )},
  { page: "/admin/users", label: "Kullanıcı Yönetimi", icon: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3">
      <path d="M14 19a6 6 0 0 0-12 0"></path>
      <circle cx="8" cy="9" r="4"></circle>
      <path d="M22 19a6 6 0 0 0-12 0"></path>
      <circle cx="16" cy="9" r="4"></circle>
    </svg>
  )},
  { page: "/admin/categories", label: "Kategori Yönetimi", icon: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3">
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
      <path d="M8 7h6"></path>
      <path d="M8 11h8"></path>
    </svg>
  )},
  { page: "/admin/sellers", label: "Satıcı Yönetimi", icon: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3">
      <path d="m2 7 4.41-4.41A2 2 0 0 1 7.41 2h9.18a2 2 0 0 1 1.4.59L22 7"></path>
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
      <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"></path>
      <path d="M15 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"></path>
    </svg>
  )},
  { page: "/admin/brands", label: "Marka Yönetimi", icon: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3">
      <path d="M9 5H2.828A2 2 0 0 0 1.414 6.414L8.414 13.414A2 2 0 0 0 9.828 14.828L16.828 21.828A2 2 0 0 0 18.242 22.56L22.586 18.242A2 2 0 0 0 22.56 16.828L15.56 9.828A2 2 0 0 0 14.146 8.414L7.146 1.414A2 2 0 0 0 5.732 1.414L1.414 5.732A2 2 0 0 0 2.828 7.146L9 5Z"></path>
      <circle cx="8" cy="8" r="1"></circle>
    </svg>
  )},
  { page: "/admin/reports", label: "İstatistik & Raporlama", icon: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3">
      <line x1="12" x2="12" y1="20" y2="10"></line>
      <line x1="18" x2="18" y1="20" y2="4"></line>
      <line x1="6" x2="6" y1="20" y2="16"></line>
    </svg>
  )},
  { page: "/admin/reviews", label: "Yorum ve Değerlendirme", icon: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      <line x1="8" x2="8" y1="12" y2="12"></line>
      <line x1="12" x2="12" y1="12" y2="12"></line>
      <line x1="16" x2="16" y1="12" y2="12"></line>
    </svg>
  )},
  { page: "/admin/payments", label: "Fatura ve Ödeme", icon: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3">
      <path d="M12 21.41a2 2 0 0 1-2 0l-5-5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7.41a2 2 0 0 1-2 0l-5 5a2 2 0 0 1-2 0Z"></path>
      <path d="m14 14-2 2-2-2"></path>
      <path d="M8 10h8"></path>
    </svg>
  )},
  { page: "/admin/settings", label: "Genel Ayarlar", icon: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.39a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2.73l-.15.1a2 2 0 0 0-.73 2.73l.22.39a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1 0-2.73l.15-.1a2 2 0 0 0 .73-2.73l-.22-.39a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  )},
  { page: "/admin/contact", label: "İletişim & Mesajlar", icon: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  )},
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="bg-gray-100 min-h-screen flex font-sans">
      {/* Mobil kenar çubuğu arkaplanı (overlay) */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity duration-300 md:hidden ${
          isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={toggleSidebar}
      ></div>

      {/* Kenar Çubuğu - tamamen duyarlı */}
      <aside
        className={`bg-gray-800 text-gray-300 w-64 p-4 flex flex-col h-screen fixed top-0 left-0 z-40 transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:static md:shadow-lg md:flex`}
      >
        {/* Logo veya Başlık */}
        <div className="text-white text-2xl font-bold mb-8 px-2">
          ShopEase
        </div>
        {/* Navigasyon menüsü */}
        <nav className="flex-grow space-y-2">
          {sidebarMenuItems.map((item: SidebarMenuItem) => (
            <Link
              key={item.page}
              href={item.page}
              onClick={() => setIsSidebarOpen(false)} // Mobil menüde linke tıklandığında menüyü kapatır
              className={`flex items-center p-3 rounded-lg transition-colors duration-200 ${
                pathname === item.page ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
        {/* Çıkış yap butonu */}
        <div className="mt-auto pt-4 border-t border-gray-700">
          <Link
            href="#"
            className="flex items-center p-3 rounded-lg hover:bg-red-600 text-gray-300 transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-log-out mr-3">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" x2="9" y1="12" y2="12"></line>
            </svg>
            Çıkış Yap
          </Link>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-10">
        <header className="flex items-center justify-between mb-6 md:hidden">
          <button
            onClick={toggleSidebar}
            className="text-gray-800 focus:outline-none"
          >
            {isSidebarOpen ? <CloseIcon className="w-6 h-6" /> : <HamburgerIcon className="w-6 h-6" />}
          </button>
          <h1 className="text-xl font-semibold">Admin Panel</h1>
        </header>
        {children}
      </main>
    </div>
  );
}
