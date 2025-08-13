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
