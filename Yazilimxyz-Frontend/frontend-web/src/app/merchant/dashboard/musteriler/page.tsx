'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  getMerchantOrders,
  type OrderDto,
  fmtTRY,
  statusInfo,
} from '@/lib/orderApi';

/* ================= Helpers ================= */

type CustomerRow = {
  key: string;
  title: string;
  ordersCount: number;
  totalSpentTRY: number;
  lastOrderAt: string;
  lastOrderStatus: ReturnType<typeof statusInfo>;
};

const formatDateTime = (iso: string | null | undefined): string => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('tr-TR', { dateStyle: 'medium', timeStyle: 'short' });
};

/* ================= Page ================= */

export default function MerchantCustomersPage() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [q, setQ] = useState('');
  const [limit, setLimit] = useState(25);

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

  const rows: CustomerRow[] = useMemo(() => {
    const map = new Map<string, CustomerRow>();

    orders.forEach((o) => {
      const key = (o.shippingAddressLine ?? '—').trim() || '—';
      const lastBadge = statusInfo({ status: o.status, paymentStatus: o.paymentStatus });

      if (!map.has(key)) {
        map.set(key, {
          key,
          title: key,
          ordersCount: 0,
          totalSpentTRY: 0,
          lastOrderAt: o.createdAt,
          lastOrderStatus: lastBadge,
        });
      }
      const row = map.get(key)!;
      row.ordersCount += 1;

      // Sadece teslim edilen siparişleri harcamaya ekle
      if (lastBadge.tone === 'green') row.totalSpentTRY += Number(o.totalAmount ?? 0);

      // Son sipariş güncellemesi
      if (new Date(o.createdAt).getTime() > new Date(row.lastOrderAt).getTime()) {
        row.lastOrderAt = o.createdAt;
        row.lastOrderStatus = lastBadge;
      }
    });

    const query = q.trim().toLowerCase();
    let list = Array.from(map.values());
    if (query) list = list.filter((r) => r.title.toLowerCase().includes(query));
    list.sort((a, b) => +new Date(b.lastOrderAt) - +new Date(a.lastOrderAt));
    return list.slice(0, limit);
  }, [orders, q, limit]);

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-semibold">Müşteriler</h1>
          <div className="flex items-center gap-3">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Müşteri adresi veya sipariş no/ürün ara…"
              className="w-64 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-300"
            />
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="rounded-lg border border-gray-300 px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-300"
            >
              {[10, 25, 50, 100].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="grid grid-cols-12 border-b border-gray-100 px-4 py-3 text-xs font-medium text-gray-500">
            <div className="col-span-6">Müşteri</div>
            <div className="col-span-2 text-right">Toplam Harcama</div>
            <div className="col-span-2 text-center">Sipariş</div>
            <div className="col-span-2 text-center">Son Durum</div>
          </div>

          {loading ? (
            <div className="px-4 py-6 text-sm text-gray-500">Yükleniyor…</div>
          ) : rows.length === 0 ? (
            <div className="px-4 py-6 text-sm text-gray-500">Kayıt bulunamadı.</div>
          ) : (
            rows.map((c) => (
              <div key={c.key} className="grid grid-cols-12 items-center border-t border-gray-100 px-4 py-3">
                <div className="col-span-6">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{c.title}</div>
                    <div className="truncate text-[11px] text-gray-500">
                      Son Sipariş: {formatDateTime(c.lastOrderAt)}
                    </div>
                  </div>
                </div>

                <div className="col-span-2 text-right text-sm font-medium tabular-nums">
                  {fmtTRY(c.totalSpentTRY)}
                </div>

                <div className="col-span-2 text-center text-sm">
                  {c.ordersCount.toLocaleString('tr-TR')}
                </div>

                <div className="col-span-2 text-center">
                  <span
                    className={
                      'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ' +
                      (c.lastOrderStatus.tone === 'green'
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : c.lastOrderStatus.tone === 'orange'
                        ? 'bg-amber-500/10 text-amber-600'
                        : c.lastOrderStatus.tone === 'red'
                        ? 'bg-rose-500/10 text-rose-600'
                        : 'bg-gray-500/10 text-gray-600')
                    }
                  >
                    {c.lastOrderStatus.text}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-6 text-sm text-gray-500">
          <Link href="/merchant/dashboard/siparisler" className="underline hover:text-black">
            ← Siparişlere dön
          </Link>
        </div>
      </div>
    </div>
  );
}
