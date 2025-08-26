"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { fmtTRY, getMyOrders, type OrderDto, statusInfo } from "@/lib/orderApi";

function StatusBadge({ dto }: { dto: Pick<OrderDto,"status"|"paymentStatus"> }) {
  const { text, tone } = statusInfo(dto);
  const cls =
    tone === "green"  ? "bg-green-100 text-green-700 border-green-200" :
    tone === "orange" ? "bg-orange-100 text-orange-700 border-orange-200" :
    tone === "red"    ? "bg-red-100 text-red-700 border-red-200" :
                        "bg-slate-100 text-slate-700 border-slate-200";
  return <span className={`px-2.5 py-1 rounded-xl text-xs border ${cls}`}>{text}</span>;
}

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await getMyOrders();
        setOrders(Array.isArray(data) ? data : []);
      } finally { setLoading(false); }
    })();
  }, []);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return orders;
    return orders.filter(o =>
      o.orderNumber.toLowerCase().includes(t) ||
      o.items.some(i => i.productName.toLowerCase().includes(t))
    );
  }, [orders, q]);

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Siparişlerim</h1>
        <p className="text-sm text-slate-500">Tüm siparişlerin burada.</p>
      </header>

      <div className="mb-4 flex items-center gap-3">
        <input
          value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Sipariş no veya ürün adı ara…"
          className="w-full md:w-96 rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-200"
        />
      </div>

      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="grid grid-cols-12 px-5 py-3 text-sm text-slate-500 border-b">
          <div className="col-span-5">Sipariş</div>
          <div className="col-span-2">Tarih</div>
          <div className="col-span-2 text-right">Tutar</div>
          <div className="col-span-3">Durum</div>
        </div>

        {loading && <div className="p-6 text-sm text-slate-500">Yükleniyor…</div>}
        {!loading && filtered.length === 0 && <div className="p-6 text-sm text-slate-500">Kayıt yok.</div>}

        {filtered.map((o) => {
          const first = o.items?.[0];                         // ✅ güvenli erişim
          const productLine = (o.items ?? []).map(i => i.productName).join(", ") || "—";
          return (
            <div key={o.id} className="grid grid-cols-12 gap-3 px-5 py-4 items-center border-t">
              <div className="col-span-5">
                <div className="flex items-start gap-3">
                  <div className="relative h-14 w-14 overflow-hidden rounded-xl border">
                    {first?.productImageUrl ? (
                      <Image
                        src={first.productImageUrl}
                        alt={first.productName ?? "Ürün"}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-slate-100" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium truncate">#{o.orderNumber}</div>
                    <div className="text-xs text-slate-500 truncate">{productLine}</div>
                    {o.shippingAddressLine && (
                      <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                        {o.shippingAddressLine}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="col-span-2 text-sm text-slate-600">
                {o.createdAt ? new Date(o.createdAt).toLocaleDateString("tr-TR") : "—"}
              </div>

              <div className="col-span-2 text-right font-semibold">
                {fmtTRY(Number(o.totalAmount ?? 0))}
              </div>

              <div className="col-span-3 flex items-center gap-2">
                <StatusBadge dto={{ status: o.status, paymentStatus: o.paymentStatus }} />
                {o.deliveredAt && (
                  <span className="text-xs text-slate-500">
                    ({new Date(o.deliveredAt).toLocaleDateString("tr-TR")})
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </section>

      <div className="mt-6 text-sm text-slate-500">
        <Link href="/customer">← Alışverişe devam et</Link>
      </div>
    </main>
  );
}
