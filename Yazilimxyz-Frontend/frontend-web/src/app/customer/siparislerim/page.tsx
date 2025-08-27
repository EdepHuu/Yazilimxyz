// src/app/customer/siparislerim/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  type OrderDto,
  type OrderItemDto,
  fmtTRY,
  getMyOrders,
  statusInfo,
  formatDateTime,
  readRoleToken,
  resolveImageUrl,
} from "@/lib/orderApi";

/** UI’da kullanacağımız daraltılmış ve güvenli tip */
type OrderForUI = Pick<
  OrderDto,
  "id" | "orderNumber" | "totalAmount" | "status" | "paymentStatus" | "createdAt" | "shippingAddressLine"
> & {
  /** Kökten gelen görsel (Swagger’da gördüğün alan) */
  coverImageUrl?: string | null;
  /** Bazı backendlere göre items boş dönebiliyor; bu yüzden opsiyonel */
  items?: Array<Pick<OrderItemDto, "productName" | "productImageUrl" | "productVariantId">>;
};

/* --- Küçük görsel yardımcı: Next/Image başarısızsa <img> fallback --- */
function OrderImage({ src, alt, size = 56 }: { src?: string; alt: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  if (!src) return <div className="h-full w-full bg-slate-100" />;

  if (!failed) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={`${size}px`}
        className="object-cover"
        unoptimized
        onError={() => setFailed(true)}
      />
    );
  }
  return <img src={src} alt={alt} className="object-cover h-full w-full" />;
}

/* --- Durum rozeti --- */
function StatusBadge({ dto }: { dto: Pick<OrderDto, "status" | "paymentStatus"> }) {
  const { text, tone } = statusInfo(dto);
  const cls =
    tone === "green"
      ? "bg-green-100 text-green-700 border-green-200"
      : tone === "orange"
      ? "bg-orange-100 text-orange-700 border-orange-200"
      : tone === "red"
      ? "bg-red-100 text-red-700 border-red-200"
      : "bg-slate-100 text-slate-700 border-slate-200";
  return <span className={`px-2.5 py-1 rounded-xl text-xs border ${cls}`}>{text}</span>;
}

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<OrderForUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!readRoleToken("customer")) {
      setLoading(false);
      setOrders([]);
      return;
    }
    (async () => {
      try {
        const raw = await getMyOrders(); // OrderDto[]
        // Gelen OrderDto’yu güvenli UI tipine dönüştür
        const ui: OrderForUI[] = (raw ?? []).map((o) => {
          const first = o.items?.[0];
          // Swagger’da kökte gelen alanı da oku (tip güvenli assertion)
          const rootImage = (o as { productImageUrl?: string | null }).productImageUrl;
          const imageAbs = resolveImageUrl(first?.productImageUrl ?? rootImage ?? null, first?.productVariantId);
          return {
            id: o.id,
            orderNumber: o.orderNumber,
            totalAmount: o.totalAmount,
            status: o.status,
            paymentStatus: o.paymentStatus,
            createdAt: o.createdAt,
            shippingAddressLine: o.shippingAddressLine,
            coverImageUrl: imageAbs ?? undefined,
            items: o.items?.map((i) => ({
              productName: i.productName,
              productImageUrl: resolveImageUrl(i.productImageUrl ?? null, i.productVariantId),
              productVariantId: i.productVariantId,
            })),
          };
        });
        setOrders(ui);
      } catch (err) {
        console.error(err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return orders;
    return orders.filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(t) ||
        (o.items ?? []).some((i) => (i.productName ?? "").toLowerCase().includes(t))
    );
  }, [orders, q]);

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Siparişlerim</h1>
      </header>

      <div className="mb-4 flex items-center gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Sipariş no veya ürün adı ara…"
          className="w-full md:w-96 rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-200"
        />
      </div>

      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="grid grid-cols-12 px-5 py-3 text-sm text-slate-500 border-b">
          <div className="col-span-5">Sipariş</div>
          <div className="col-span-3">Tarih</div>
          <div className="col-span-2 text-right pr-4">Tutar</div>
          <div className="col-span-2 pl-2">Durum</div>
        </div>

        {loading && <div className="p-6 text-sm text-slate-500">Yükleniyor…</div>}

        {!loading && orders.length === 0 && (
          <div className="p-6 text-sm text-slate-500">
            Sipariş bulunamadı.{" "}
            {readRoleToken("customer") ? null : (
              <>
                Görüntülemek için{" "}
                <Link className="underline" href="/customer/login">
                  giriş yap
                </Link>
                .
              </>
            )}
          </div>
        )}

        {filtered.map((o) => {
          const firstName = o.items?.[0]?.productName;
          const productLine = (o.items ?? [])
            .map((i) => i.productName)
            .filter(Boolean)
            .join(", ");

          return (
            <div key={o.id} className="grid grid-cols-12 gap-3 px-5 py-4 items-center border-t">
              {/* Resim + sipariş no + ürün isimleri */}
              <div className="col-span-5">
                <div className="flex items-start gap-3">
                  <div className="relative h-14 w-14 overflow-hidden rounded-xl border">
                    <OrderImage src={o.coverImageUrl ?? undefined} alt={firstName ?? "Ürün"} />
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium truncate">#{o.orderNumber}</div>
                    <div className="text-xs text-slate-500 truncate">
                      {productLine.length > 0 ? productLine : "—"}
                    </div>
                    {o.shippingAddressLine && (
                      <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                        {o.shippingAddressLine}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Tarih (tarih + saat) */}
              <div className="col-span-3 text-sm text-slate-600">{formatDateTime(o.createdAt)}</div>

              {/* Tutar */}
              <div className="col-span-2 text-right pr-4 font-semibold">{fmtTRY(o.totalAmount)}</div>

              {/* Durum */}
              <div className="col-span-2">
                <StatusBadge dto={{ status: o.status, paymentStatus: o.paymentStatus }} />
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
