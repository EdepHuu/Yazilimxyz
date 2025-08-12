"use client";

import { useEffect, useState } from "react";

type Stats = {
  productCount: number;
  lowStockCount: number;
  ordersToday: number;
  pendingReviews: number;
};

type MerchantMe = { id: string; storeName: string };

function getCookie(name: string) {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
}

export default function MerchantPanelPage() {
  const [me, setMe] = useState<MerchantMe | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Token'ı localStorage → sessionStorage → cookie sırasıyla dene
    const ls = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const ss = typeof window !== "undefined" ? sessionStorage.getItem("token") : null;
    const ck = getCookie("token");
    const token = ls || ss || ck;

    // Token yoksa giriş sayfasına yönlendir
    if (!token) {
      window.location.href = "/merchant/giris";
      return;
    }

    const base = process.env.NEXT_PUBLIC_API_BASE_URL;

    const p1 = fetch(`${base}/api/merchant/me`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => (r.ok ? r.json() : null));

    const p2 = fetch(`${base}/api/merchant/products/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => (r.ok ? r.json() : null));

    Promise.all([p1, p2])
      .then(([meRes, statsRes]) => {
        setMe(meRes ?? { id: "-", storeName: "Mağazam" });
        setStats(
          statsRes ?? {
            productCount: 4,
            lowStockCount: 2,
            ordersToday: 3,
            pendingReviews: 5,
          }
        );
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* İçerik alanı (Topbar layout'ta) */}
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Üst bölüm */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mb-6">
            <h2 className="text-lg font-semibold">
              Ürünler {me ? `— ${me.storeName}` : ""}
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Burada ürün listesi, ekleme/düzenleme formları ve diğer araçlar yer alacaktır.
            </p>

            {/* Küçük rozet kartlar (örnek) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              <SmallBadgeCard title="Elbise" stock="120" />
              <SmallBadgeCard title="Çizgili Gömlek" stock="98" />
              <SmallBadgeCard title="Kısa Kollu Tişört" stock="75" />
              <SmallBadgeCard title="Kot Ceket" stock="51" />
            </div>
          </section>

          {/* Özet istatistik kartları */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Toplam Ürün" value={stats?.productCount ?? 0} />
            <StatCard label="Düşük Stok" value={stats?.lowStockCount ?? 0} />
            <StatCard label="Bugünkü Sipariş" value={stats?.ordersToday ?? 0} />
            <StatCard label="Bekleyen Yorum" value={stats?.pendingReviews ?? 0} />
          </div>

          {/* Loading göstergesi */}
          {loading && (
            <div className="mt-6 text-sm text-slate-500">Veriler yükleniyor…</div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
      <div className="text-sm text-slate-600">{label}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
    </div>
  );
}

function SmallBadgeCard({ title, stock }: { title: string; stock: string }) {
  return (
    <div className="bg-slate-100 rounded-xl p-4">
      <div className="inline-flex items-center gap-2 text-xs text-slate-600">
        <span className="px-2 py-0.5 rounded-full bg-white border border-slate-200">
          {title}
        </span>
        <span>Stok: {stock}</span>
      </div>
    </div>
  );
}
