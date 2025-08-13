// components/merchant/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

function cn(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(' ');
}

export default function Sidebar() {
  const pathname = usePathname();

  const items = [
    { href: "/merchant/dashboard/panel", label: "Kontrol Paneli" },
    { href: "/merchant/dashboard/urunler", label: "Ürünler" },
    { href: "/merchant/dashboard/siparisler", label: "Siparişler" },
    { href: "/merchant/dashboard/musteriler", label: "Müşteriler" },
    { href: "/merchant/dashboard/ayarlar", label: "Ayarlar" },
  ];

  return (
    <aside className="hidden md:flex w-64 min-h-screen flex-col bg-slate-900 text-slate-100 p-4">
      {/* Başlık */}
      <div className="px-2 mb-6">
        <div className="text-xl font-bold tracking-wide">Satıcı Paneli</div>
        <div className="text-xs text-slate-400">ShopEase</div>
      </div>

      {/* Menü */}
      <nav className="space-y-1.5">
        {items.map((it) => {
          const active = pathname.startsWith(it.href);

          return (
            <Link
              key={it.href}
              href={it.href}
              className={cn(
                // temel görünüm
                'group relative flex items-center gap-2 rounded-xl px-3 py-2.5 text-[15px] font-medium transition-all duration-200',
                // aktif — büyük, belirgin
                active
                  ? 'bg-slate-800 text-white shadow-sm ring-1 ring-slate-700'
                  : 'hover:bg-slate-800/60 hover:translate-x-[2px]'
              )}
            >
              {/* solda ince vurgu çubuğu (aktif/hover) */}
              <span
                className={cn(
                  'pointer-events-none absolute left-1 top-1.5 bottom-1.5 rounded-full transition-all duration-200',
                  active
                    ? 'w-1.5 bg-slate-300'
                    : 'w-1 opacity-0 group-hover:opacity-100 group-hover:bg-slate-400'
                )}
              />
              <span className="pl-3">{it.label}</span>

              {/* sağda hafif ok animasyonu */}
              <span className="ml-auto opacity-0 translate-x-[-4px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200">
                ›
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Çıkış butonu */}
      <div className="mt-auto pt-4">
        <button
          onClick={() => {
            if (typeof window !== 'undefined') {
              localStorage.removeItem('token');
              localStorage.removeItem('role');
              sessionStorage.removeItem('token');
              sessionStorage.removeItem('role');
              document.cookie = 'token=; Max-Age=0; path=/';
              document.cookie = 'role=; Max-Age=0; path=/';
              window.location.href = '/merchant/giris';
            }
          }}
          className="w-full rounded-xl px-3 py-2.5 text-[15px] font-semibold bg-slate-800/90 hover:bg-slate-700 active:scale-[0.99] transition-all duration-150"
        >
          Çıkış Yap
        </button>
      </div>
    </aside>
  );
}
