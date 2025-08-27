'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  AreaChart, Area, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { motion } from 'framer-motion';
import { ShoppingCart, Wallet, Package, Users, Download, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { getMerchantOrders, type OrderDto, fmtTRY as trCurrency } from '@/lib/orderApi';

/* ================= Types ================= */
type TrendPoint = { date: string; value: number };
type KPIBase = { label: string; value: number; changePct: number; icon: React.ReactNode; trend: TrendPoint[]; currency?: boolean };
type RevenuePoint = { label: string; revenue: number; orders: number };
type ChannelShare = { channel: 'Web' | 'Mobile'; revenue: number };
type TopRow = { name: string; price: number; units: number; revenue: number; category: string };
type RecentRow = { id: string; date: string; address: string; total: number; statusText: string; statusTone: 'green' | 'orange' | 'red' | 'slate' };

/* ================= Helpers ================= */
const monthKey = (d: Date): string => {
  const m = d.getMonth() + 1;
  return `Ay ${m}`;
};

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

const toCSV = (headers: Array<string | number>, rows: Array<Array<string | number>>): string => {
  const enc = (c: string | number) => (typeof c === 'string' ? `"${c.replace(/"/g, '""')}"` : String(c));
  return [headers, ...rows].map((r) => r.map(enc).join(',')).join('\n');
};

// yüzde değişim (prev 0 ise: current==0 → 0; aksi → 100)
const pctChange = (current: number, prev: number): number => {
  if (prev === 0) return current === 0 ? 0 : 100;
  return ((current - prev) / prev) * 100;
};

// durum -> metin/ton (teslim/iptal/bekleme vb. hem string hem enum ihtimali)
const statusBadge = (o: Pick<OrderDto, 'status' | 'paymentStatus'>): { text: string; tone: 'green' | 'orange' | 'red' | 'slate' } => {
  const raw = (o.status ?? o.paymentStatus);
  if (typeof raw === 'number') {
    if (raw === 3) return { text: 'Teslim Edildi', tone: 'green' };
    if (raw === 4) return { text: 'İptal Edildi', tone: 'red' };
    return { text: 'Onay Bekliyor', tone: 'orange' };
  }
  const s = String(raw ?? '').toLowerCase();
  if (s.includes('deliver')) return { text: 'Teslim Edildi', tone: 'green' };
  if (s.includes('cancel'))  return { text: 'İptal Edildi', tone: 'red' };
  if (s.includes('confirm') || s.includes('pending') || s.includes('await') || s.includes('onay')) return { text: 'Onay Bekliyor', tone: 'orange' };
  return { text: 'Durum', tone: 'slate' };
};

const toneClass = (t: 'green' | 'orange' | 'red' | 'slate') =>
  t === 'green' ? 'bg-emerald-500/10 text-emerald-600' :
  t === 'orange'? 'bg-amber-500/10 text-amber-600' :
  t === 'red'   ? 'bg-rose-500/10 text-rose-600' :
                  'bg-zinc-500/10 text-zinc-600';

/* ================= KPI Card (dinamik ok + renk) ================= */
const KpiCard = ({ item, currency }: { item: KPIBase; currency?: boolean }) => {
  const d = item.changePct;
  const up = d > 0, down = d < 0;
  const tone = up ? 'text-emerald-600' : down ? 'text-rose-600' : 'text-amber-600';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
      className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-zinc-600">
          <div className="p-2 rounded-xl bg-zinc-100">{item.icon}</div>
          <span className="text-sm font-medium">{item.label}</span>
        </div>

        <div className={`flex items-center gap-1 text-xs ${tone}`}>
          {up && <ArrowUpRight className="h-4 w-4" />}
          {!up && !down && (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 12h16" />
            </svg>
          )}
          {down && <ArrowDownRight className="h-4 w-4" />}
          <span>{d.toFixed(1)}%</span>
        </div>
      </div>

      <div className="mt-3 text-2xl font-semibold tracking-tight">
        {currency ? trCurrency(item.value) : item.value.toLocaleString('tr-TR')}
      </div>

      <div className="mt-3 h-16">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={item.trend}>
            <defs>
              <linearGradient id={`grad-${item.label}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="value" stroke="#6366f1" fill={`url(#grad-${item.label})`} strokeWidth={2} />
            <XAxis hide dataKey="date" />
            <YAxis hide />
            <Tooltip formatter={(v: number) => v.toLocaleString('tr-TR')} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

/* ================= Page ================= */
export default function MerchantDashboardPanelPage() {
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [loading, setLoading] = useState(true);

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

  /* ----- veri hazırlama ----- */
  const delivered = useMemo(() => {
    return orders.filter(o => {
      const s = statusBadge(o).tone;
      return s === 'green'; // sadece teslim edilenler
    });
  }, [orders]);

  const canceled = useMemo(() => {
    return orders.filter(o => statusBadge(o).tone === 'red');
  }, [orders]);

  // toplam ciro: teslim edilenler
  const totalRevenue = useMemo(() => sum(delivered.map(o => Number(o.totalAmount ?? 0))), [delivered]);

  // toplam sipariş: teslim + iptal
  const totalOrders = useMemo(() => delivered.length + canceled.length, [delivered.length, canceled.length]);

  // satılan ürün (adet): teslim edilen kalemler
  const soldUnits = useMemo(
    () => sum(delivered.flatMap(o => (o.items ?? [])).map(i => Number(i.quantity || 0))),
    [delivered]
  );

  // benzersiz müşteri: adres satırına göre
  const uniqueCustomers = useMemo(() => {
    const set = new Set<string>();
    delivered.forEach(o => {
      const addr = (o.shippingAddressLine ?? '').trim();
      if (addr) set.add(addr);
    });
    return set.size;
  }, [delivered]);

  // Aylık (son 12 ay) gelir + sipariş
  const monthlyRows: RevenuePoint[] = useMemo(() => {
    const by: Record<string, { revenue: number; orders: number }> = {};
    const all = [...orders].sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));

    all.forEach(o => {
      const key = monthKey(new Date(o.createdAt));
      if (!by[key]) by[key] = { revenue: 0, orders: 0 };
      const tone = statusBadge(o).tone;
      if (tone === 'green') by[key].revenue += Number(o.totalAmount ?? 0);
      if (tone === 'green' || tone === 'red') by[key].orders += 1; // teslim + iptal
    });

    // son 12 ayı sırayla yaz
    const now = new Date();
    const labels = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
      return monthKey(d);
    });

    return labels.map(lbl => ({
      label: lbl,
      revenue: by[lbl]?.revenue ?? 0,
      orders: by[lbl]?.orders ?? 0,
    }));
  }, [orders]);

  // AOV
  const totalAov = useMemo(() => {
    const ord = monthlyRows.reduce((a, m) => a + m.orders, 0);
    const rev = monthlyRows.reduce((a, m) => a + m.revenue, 0);
    return ord === 0 ? 0 : Math.round(rev / ord);
  }, [monthlyRows]);

  // Kanal dağılımı (sadece Web/Mobile; veride ayrım yoksa tamamını Web say)
  const channels: ChannelShare[] = useMemo(() => {
    const web = totalRevenue; // veri ayrımı yoksa tamamını web kabul edelim
    const mobile = 0;
    return [
      { channel: 'Mobile', revenue: mobile },
      { channel: 'Web', revenue: web },
    ];
  }, [totalRevenue]);

  // En çok satan ürünler (teslim edilenlerden)
  const topProducts: TopRow[] = useMemo(() => {
    const map = new Map<string, TopRow>();
    delivered.forEach(o => {
      (o.items ?? []).forEach(i => {
        const name = i.productName ?? 'Ürün';
        const price = Number(i.unitPrice ?? 0);
        const qty = Number(i.quantity ?? 0);
        const revenue = price * qty;
        const prev = map.get(name);
        if (prev) {
          prev.units += qty;
          prev.revenue += revenue;
          prev.price = price; // son fiyat
        } else {
          map.set(name, { name, price, units: qty, revenue, category: (i.color ?? '—') as string });
        }
      });
    });
    return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [delivered]);

  // Son 5 sipariş (en yeni)
  const recentOrders: RecentRow[] = useMemo(() => {
    return [...orders]
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
      .slice(0, 5)
      .map(o => {
        const st = statusBadge(o);
        return {
          id: `#${o.orderNumber}`,
          date: o.createdAt,
          address: o.shippingAddressLine ?? '—',
          total: Number(o.totalAmount ?? 0),
          statusText: st.text,
          statusTone: st.tone,
        };
      });
  }, [orders]);

  /* ----- dinamik oklar için yüzde sapmaları (son ay ↔ önceki ay) ----- */
  const last = monthlyRows[monthlyRows.length - 1] ?? { label: '', revenue: 0, orders: 0 };
  const prev = monthlyRows[monthlyRows.length - 2] ?? { label: '', revenue: 0, orders: 0 };

  // aylık satılan ürün ve benzersiz müşteri
  const monthUnits = useMemo(() => {
    const m = new Map<string, number>();
    delivered.forEach(o => {
      const k = monthKey(new Date(o.createdAt));
      const u = (o.items ?? []).reduce((s, i) => s + Number(i.quantity || 0), 0);
      m.set(k, (m.get(k) ?? 0) + u);
    });
    return m;
  }, [delivered]);

  const monthCustomers = useMemo(() => {
    const m = new Map<string, Set<string>>();
    delivered.forEach(o => {
      const k = monthKey(new Date(o.createdAt));
      const addr = (o.shippingAddressLine ?? '').trim();
      if (!m.has(k)) m.set(k, new Set());
      if (addr) m.get(k)!.add(addr);
    });
    return m;
  }, [delivered]);

  const revenueDelta = pctChange(last.revenue, prev.revenue);
  const ordersDelta  = pctChange(last.orders,  prev.orders);
  const unitsDelta   = pctChange(monthUnits.get(last.label) ?? 0, monthUnits.get(prev.label) ?? 0);
  const usersDelta   = pctChange((monthCustomers.get(last.label)?.size ?? 0), (monthCustomers.get(prev.label)?.size ?? 0));

  /* ----- KPI kartları ----- */
  const kpis: KPIBase[] = useMemo(() => {
    const trendRevenue: TrendPoint[] = monthlyRows.map(m => ({ date: m.label, value: m.revenue }));
    const trendOrders : TrendPoint[] = monthlyRows.map(m => ({ date: m.label, value: m.orders  }));
    const trendUnits  : TrendPoint[] = monthlyRows.map(m => ({ date: m.label, value: monthUnits.get(m.label) ?? 0 }));
    const trendUsers  : TrendPoint[] = monthlyRows.map(m => ({ date: m.label, value: (monthCustomers.get(m.label)?.size ?? 0) }));

    return [
      { label: 'Toplam Ciro',         value: totalRevenue,    changePct: revenueDelta, icon: <Wallet className="h-5 w-5" />,     trend: trendRevenue, currency: true },
      { label: 'Toplam Sipariş',      value: totalOrders,     changePct: ordersDelta,  icon: <ShoppingCart className="h-5 w-5" />, trend: trendOrders },
      { label: 'Satılan Ürün (Adet)', value: soldUnits,       changePct: unitsDelta,   icon: <Package className="h-5 w-5" />,    trend: trendUnits },
      { label: 'Müşteri',             value: uniqueCustomers, changePct: usersDelta,   icon: <Users className="h-5 w-5" />,      trend: trendUsers },
    ];
  }, [monthlyRows, totalRevenue, totalOrders, soldUnits, uniqueCustomers, monthUnits, monthCustomers, revenueDelta, ordersDelta, unitsDelta, usersDelta]);

  /* ----- CSV ----- */
  const exportCSV = (): void => {
    const headers = ['Ay', 'Ciro', 'Sipariş'];
    const rows = monthlyRows.map(m => [m.label, m.revenue, m.orders]);
    const blob = new Blob([toCSV(headers, rows)], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'dashboard-revenue.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  /* ================= Render ================= */
  return (
    <div className="min-h-screen w-full bg-gray-50 text-zinc-900">
      <div className="px-4 md:px-6 pt-4">
        <div className="sticky top-16 z-0">
          <div className="rounded-xl border border-zinc-200 bg-white/80 backdrop-blur p-3 shadow-sm">
            <div className="max-h-[calc(100vh-120px)] overflow-y-auto pr-2
                            [-ms-overflow-style:none] [scrollbar-width:none]
                            [&::-webkit-scrollbar]:hidden">
              {/* Header */}
              <div className="flex items-end justify-between mb-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Kontrol Paneli</h1>
                  <p className="text-sm text-zinc-500 mt-1">Güncel satış performansı ve özet metrikler</p>
                </div>
                <button
                  onClick={exportCSV}
                  className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-4 py-2 text-sm bg-white hover:bg-zinc-50"
                >
                  <Download className="h-4 w-4" />
                  CSV Dışa Aktar
                </button>
              </div>

              {/* KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                {kpis.map(k => (
                  <KpiCard key={k.label} item={k} currency={k.currency} />
                ))}
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 2xl:grid-cols-3 gap-4 mb-6">
                {/* Revenue (Aylık) */}
                <div className="2xl:col-span-2 rounded-2xl border border-zinc-200 bg-white p-5">
                  <div className="flex items-end justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold tracking-tight">Gelir (Aylık)</h3>
                      <p className="text-xs text-zinc-500 mt-1">
                        Toplam: {trCurrency(totalRevenue)} • Sipariş: {totalOrders.toLocaleString('tr-TR')} • Ortalama Sepet: {trCurrency(totalAov)}
                      </p>
                    </div>
                  </div>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={monthlyRows} margin={{ left: 6, right: 6, top: 10, bottom: 0 }}>
                        <defs>
                          <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#22c55e" stopOpacity={0.4} />
                            <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis dataKey="label" />
                        <YAxis tickFormatter={(v: number) => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(v))} />
                        <Tooltip formatter={(v: number, n: string) => (n === 'revenue' ? trCurrency(v) : v.toLocaleString('tr-TR'))} />
                        <Area type="monotone" dataKey="revenue" stroke="#22c55e" fill="url(#rev)" strokeWidth={2} />
                        <Line type="monotone" dataKey="orders" stroke="#6366f1" strokeWidth={2} dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Channel Pie (Web & Mobile) */}
                <div className="rounded-2xl border border-zinc-200 bg-white p-5">
                  <div className="flex items-end justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold tracking-tight">Kanal Dağılımı</h3>
                      <p className="text-xs text-zinc-500 mt-1">Ciroya göre oran</p>
                    </div>
                  </div>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={channels} dataKey="revenue" nameKey="channel" innerRadius={60} outerRadius={100} paddingAngle={6}>
                          {channels.map((_, i) => (
                            <Cell key={`c-${i}`} fill={['#06b6d4', '#4f46e5'][i % 2]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v: number) => trCurrency(v)} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Top products (tam genişlik) */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 mb-6">
                <div className="flex items-end justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold tracking-tight">En Çok Satan Ürünler</h3>
                    <p className="text-xs text-zinc-500 mt-1">Son 12 ay, teslim edilen siparişler</p>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-zinc-500">
                        <th className="py-2 pr-3">Ürün</th>
                        <th className="py-2 pr-3">Kategori</th>
                        <th className="py-2 pr-3">Fiyat</th>
                        <th className="py-2 pr-3">Satış (Adet)</th>
                        <th className="py-2 pr-3">Ciro</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topProducts.map((p) => (
                        <tr key={p.name} className="border-t border-zinc-100">
                          <td className="py-3 pr-3 font-medium">{p.name}</td>
                          <td className="py-3 pr-3">{p.category}</td>
                          <td className="py-3 pr-3">{trCurrency(p.price)}</td>
                          <td className="py-3 pr-3">{p.units.toLocaleString('tr-TR')}</td>
                          <td className="py-3 pr-3">{trCurrency(p.revenue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recent orders */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-5">
                <div className="flex items-end justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold tracking-tight">Son Siparişler</h3>
                    <p className="text-xs text-zinc-500 mt-1">En yeni 5 sipariş</p>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-zinc-500">
                        <th className="py-2 pr-3">Sipariş #</th>
                        <th className="py-2 pr-3">Tarih</th>
                        <th className="py-2 pr-3">Adres</th>
                        <th className="py-2 pr-3">Tutar</th>
                        <th className="py-2 pr-3">Durum</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((o) => (
                        <tr key={o.id} className="border-t border-zinc-100">
                          <td className="py-3 pr-3 font-medium">{o.id}</td>
                          <td className="py-3 pr-3">{new Date(o.date).toLocaleDateString('tr-TR')}</td>
                          <td className="py-3 pr-3">{o.address}</td>
                          <td className="py-3 pr-3">{trCurrency(o.total)}</td>
                          <td className="py-3 pr-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${toneClass(o.statusTone)}`}>
                              {o.statusText}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {loading && (
                        <tr><td className="py-3 pr-3 text-zinc-500" colSpan={5}>Yükleniyor…</td></tr>
                      )}
                      {!loading && recentOrders.length === 0 && (
                        <tr><td className="py-3 pr-3 text-zinc-500" colSpan={5}>Kayıt yok.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
