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
} from "@/lib/orderApi";

/* ---- Durum rozetleri ---- */
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

/* ---- Bekleme/Onay gerektiren durum mu? (string veya number destekli) ---- */
function isPending(dto: Pick<OrderDto, "status" | "paymentStatus">): boolean {
  const raw = dto.paymentStatus ?? dto.status;
  const s = typeof raw === "string" ? raw.toLowerCase() : "";
  const n = typeof raw === "number" ? raw : NaN;
  // string varyantlar + olası sayısal enumlar
  return s.includes("pending") || s.includes("await") || s.includes("confirm") || s.includes("onay") || [0, 1].includes(n);
}

export default function MerchantOrdersPage() {
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    (async () => {
      try {
        const data = await getMerchantOrders();
        setOrders(Array.isArray(data) ? data : []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const list = !term
      ? orders
      : orders.filter((o) => {
          const inNumber = (o.orderNumber ?? "").toLowerCase().includes(term);
          const inItems = (o.items ?? []).some((i) => (i.productName ?? "").toLowerCase().includes(term));
          return inNumber || inItems;
        });
    return list.slice(0, pageSize);
  }, [orders, q, pageSize]);

  async function onConfirm(id: number) {
    try {
      await confirmOrder(id);
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, paymentStatus: "Confirmed", status: "Confirmed" } : o))
      );
    } catch (e) {
      alert("Onaylama sırasında bir hata oluştu.");
      console.error(e);
    }
  }

  async function onCancel(id: number) {
    if (!confirm("Bu siparişi iptal etmek istiyor musun?")) return;
    try {
      await merchantCancelOrder(id);
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, paymentStatus: "Canceled", status: "Canceled" } : o))
      );
    } catch (e) {
      alert("İptal sırasında bir hata oluştu.");
      console.error(e);
    }
  }

  return (
    <div className="px-6 py-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Siparişler</h1>
          <p className="text-sm text-slate-500">Mağazana gelen son siparişlerin listesi.</p>
        </div>
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
            <option value={10}>Sayfa boyutu 10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="grid grid-cols-12 px-5 py-3 text-sm text-slate-500 border-b">
          <div className="col-span-4">Sipariş</div>
          <div className="col-span-2">Tarih</div>
          <div className="col-span-2 text-right">Tutar</div>
          <div className="col-span-2">Durum</div>
          <div className="col-span-2 text-right">İşlemler</div>
        </div>

        {loading && <div className="p-6 text-sm text-slate-500">Yükleniyor…</div>}
        {!loading && filtered.length === 0 && <div className="p-6 text-sm text-slate-500">Kayıt yok.</div>}

        {filtered.map((o) => {
          const first = o.items?.[0];
          const productLine =
            (o.items ?? []).map((i) => `${i.productName} x${i.quantity}`).join(", ") || "—";

          const pending = isPending({ status: o.status, paymentStatus: o.paymentStatus });

          return (
            <div key={o.id} className="grid grid-cols-12 gap-3 px-5 py-4 items-center border-t">
              {/* Sipariş ve ürün özeti */}
              <div className="col-span-4">
                <div className="flex items-start gap-3">
                  <div className="relative h-12 w-12 overflow-hidden rounded-lg border">
                    {first?.productImageUrl ? (
                      <Image
                        src={first.productImageUrl}
                        alt={first.productName ?? "Ürün"}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-slate-100" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium truncate">#{o.orderNumber}</div>
                    <div className="text-xs text-slate-500 truncate">{productLine}</div>
                  </div>
                </div>
              </div>

              <div className="col-span-2 text-sm text-slate-600">
                {o.createdAt ? new Date(o.createdAt).toLocaleDateString("tr-TR") : "—"}
              </div>

              <div className="col-span-2 text-right font-semibold">
                {fmtTRY(Number(o.totalAmount ?? 0))}
              </div>

              <div className="col-span-2">
                <StatusBadge dto={{ status: o.status, paymentStatus: o.paymentStatus }} />
              </div>

              <div className="col-span-2 text-right">
                {pending && (
                  <div className="flex justify-end gap-2">
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
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
