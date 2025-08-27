// src/app/merchant/dashboard/siparisler/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  type OrderDto,
  fmtTRY,
  getMerchantOrders,
  statusInfo,
  confirmOrder,
  merchantCancelOrder,
  formatDateTime,
  isAwaiting,
  resolveImageUrl,
} from "@/lib/orderApi";

/* Görsel */
function OrderImage({ src, alt }: { src?: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  if (!src) return <div className="h-full w-full bg-slate-100" />;
  if (!failed) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes="48px"
        className="object-cover"
        unoptimized
        onError={() => setFailed(true)}
      />
    );
  }
  return <img src={src} alt={alt} className="object-cover h-full w-full" />;
}

/* Durum rozeti */
function StatusBadge({ dto }: { dto: Pick<OrderDto, "status" | "paymentStatus"> }) {
  const { text, tone } = statusInfo(dto);
  const color =
    tone === "green"
      ? "bg-green-100 text-green-700 border-green-200"
      : tone === "orange"
      ? "bg-orange-100 text-orange-700 border-orange-200"
      : tone === "red"
      ? "bg-red-100 text-red-700 border-red-200"
      : "bg-slate-100 text-slate-700 border-slate-200";
  return <span className={`px-2.5 py-1 rounded-xl text-xs border ${color}`}>{text}</span>;
}

export default function MerchantOrdersPage() {
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [pageSize, setPageSize] = useState(25);

  async function load() {
    try {
      const data = await getMerchantOrders();
      setOrders(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    const filtered = !t
      ? orders
      : orders.filter(
          (o) =>
            (o.orderNumber ?? "").toLowerCase().includes(t) ||
            (o.items ?? []).some((i) => (i.productName ?? "").toLowerCase().includes(t))
        );
    return filtered.slice(0, pageSize);
  }, [orders, q, pageSize]);

  async function onConfirm(id: number) {
    try {
      await confirmOrder(id);
      await load();
    } catch (e) {
      alert("Onaylama sırasında bir hata oluştu.");
      console.error(e);
    }
  }

  async function onCancel(id: number) {
    if (!confirm("Bu siparişi iptal etmek istiyor musun?")) return;
    try {
      await merchantCancelOrder(id);
      await load();
    } catch (e) {
      alert("İptal sırasında bir hata oluştu.");
      console.error(e);
    }
  }

  return (
    <div className="px-6 py-6">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Siparişler</h1>
        <div className="flex items-center gap-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Sipariş no veya ürün ara…"
            className="w-72 rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-200"
          />
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        {/* Başlık satırı */}
        <div className="grid grid-cols-12 px-5 py-3 text-sm text-slate-500 border-b">
          <div className="col-span-5">Sipariş</div>

          {/* Tarih üstte ve ortada */}
          <div className="col-span-3 text-center">Tarih</div>

          {/* Sağ tarafı ferahlat: Tutar / Durum / İşlemler ayır */}
          <div className="col-span-4">
            <div className="flex items-center justify-end gap-8 pr-1">
              <span className="w-20 text-right">Tutar</span>
              <span className="w-24 text-center">Durum</span>
              <span className="w-28 text-right">İşlemler</span>
            </div>
          </div>
        </div>

        {loading && <div className="p-6 text-sm text-slate-500">Yükleniyor…</div>}
        {!loading && list.length === 0 && <div className="p-6 text-sm text-slate-500">Kayıt yok.</div>}

        {list.map((o) => {
          const first = o.items?.[0];
          const rootImage = (o as { productImageUrl?: string | null }).productImageUrl;
          const cover =
            resolveImageUrl(first?.productImageUrl ?? rootImage ?? null, first?.productVariantId) ?? undefined;

          const productLine =
            (o.items ?? []).map((i) => `${i.productName} x${i.quantity}`).join(", ") || "—";

          const showActions = isAwaiting({ status: o.status, paymentStatus: o.paymentStatus });

          return (
            <div key={o.id} className="grid grid-cols-12 gap-3 px-5 py-4 items-center border-t">
              {/* Sipariş + görsel */}
              <div className="col-span-5">
                <div className="flex items-start gap-4">
                  <div className="relative h-12 w-12 overflow-hidden rounded-lg border shrink-0">
                    <OrderImage src={cover} alt={first?.productName ?? "Ürün"} />
                  </div>

                  {/* Ürün kodu için başlık ve spacing */}
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase tracking-wide text-slate-400 mb-0.5">
                      Sipariş No
                    </div>
                    <div className="font-medium truncate">#{o.orderNumber}</div>
                    <div className="text-xs text-slate-500 truncate mt-0.5">{productLine}</div>
                  </div>
                </div>
              </div>

              {/* Tarih — ortalı */}
              <div className="col-span-3 text-sm text-slate-600 text-center">
                {formatDateTime(o.createdAt)}
              </div>

              {/* Sağ alanlar: daha rahat hizalama */}
              <div className="col-span-4">
                <div className="flex items-center justify-end gap-8">
                  <div className="w-20 text-right font-semibold">
                    {fmtTRY(Number(o.totalAmount ?? 0))}
                  </div>

                  <div className="w-24 flex justify-center">
                    <StatusBadge dto={{ status: o.status, paymentStatus: o.paymentStatus }} />
                  </div>

                  <div className="w-28 flex justify-end gap-2">
                    {showActions && (
                      <>
                        <button
                          onClick={() => onConfirm(o.id)}
                          className="px-3 py-1.5 rounded-xl text-sm border border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                        >
                          Onayla
                        </button>
                        <button
                          onClick={() => onCancel(o.id)}
                          className="px-3 py-1.5 rounded-xl text-sm border border-red-300 text-red-700 hover:bg-red-50"
                        >
                          İptal
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
