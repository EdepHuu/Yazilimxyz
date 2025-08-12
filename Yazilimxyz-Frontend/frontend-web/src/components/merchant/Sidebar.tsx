"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function cn(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

export default function Sidebar() {
  const pathname = usePathname();
  const items = [
    { href: "/merchant/panel", label: "Kontrol Paneli" },
    { href: "/merchant/urunler", label: "Ürünler" },
    { href: "/merchant/siparisler", label: "Siparişler" },
    { href: "/merchant/musteriler", label: "Müşteriler" },
    // { href: "/merchant/yorumlar", label: "Yorumlar" }, // kaldırıldı
    { href: "/merchant/ayarlar", label: "Ayarlar" },
  ];

  return (
    <aside className="hidden md:flex w-64 min-h-screen flex-col bg-slate-900 text-slate-100 p-4">
      <div className="text-lg font-semibold px-2 mb-6">Satıcı Paneli</div>

      <nav className="space-y-1">
        {items.map((it) => {
          const active = pathname.startsWith(it.href);
          return (
            <Link
              key={it.href}
              href={it.href}
              className={cn(
                "block rounded-xl px-3 py-2 text-sm transition",
                active ? "bg-slate-800" : "hover:bg-slate-800/60"
              )}
            >
              {it.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-4">
        <button
          onClick={() => {
            if (typeof window !== "undefined") {
              localStorage.removeItem("token");
              localStorage.removeItem("role");
              sessionStorage.removeItem("token");
              sessionStorage.removeItem("role");
              document.cookie = "token=; Max-Age=0; path=/";
              document.cookie = "role=; Max-Age=0; path=/";
              window.location.href = "/merchant/giris";
            }
          }}
          className="w-full text-left rounded-xl px-3 py-2 text-sm bg-slate-800 hover:bg-slate-700"
        >
          Çıkış Yap
        </button>
      </div>
    </aside>
  );
}
