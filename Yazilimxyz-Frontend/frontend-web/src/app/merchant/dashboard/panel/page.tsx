'use client';

// Merchant dashboard (light theme + sticky header)
// Deps: npm i recharts framer-motion lucide-react

import React, { useMemo } from 'react';
import {
  AreaChart, Area, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { motion } from 'framer-motion';
import { ShoppingCart, Wallet, Package, ArrowUpRight, ArrowDownRight, Download, Users } from 'lucide-react';

/* ============== Types ============== */
type TrendPoint = { date: string; value: number };
type KPI = { label: string; value: number; changePct: number; icon: React.ReactNode; trend: TrendPoint[]; };
type RevenuePoint = { date: string; revenue: number; orders: number; aov: number };
type CategorySales = { category: string; units: number; revenue: number };
type ChannelShare = { channel: 'Web' | 'Mobile' | 'Marketplace'; revenue: number };
type Product = { id: number; name: string; sku: string; price: number; unitsSold: number; revenue: number; stock: number; category: string };
type OrderStatus = 'Paid' | 'Pending' | 'Refunded' | 'Shipped';
type RecentOrder = { id: string; date: string; customer: string; total: number; status: OrderStatus };

/* ============== Dummy Data ============== */
const fmtCurrency = (n: number): string =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(n);

const last12Weeks: RevenuePoint[] = [
  { date: 'Hafta 1', revenue: 6_500, orders: 10, aov: 650 },
  { date: 'Hafta 2', revenue: 7_800, orders: 12, aov: 650 },
  { date: 'Hafta 3', revenue: 8_100, orders: 14, aov: 578 },
  { date: 'Hafta 4', revenue: 6_200, orders: 9,  aov: 688 },
  { date: 'Hafta 5', revenue: 7_300, orders: 11, aov: 664 },
  { date: 'Hafta 6', revenue: 8_400, orders: 12, aov: 700 },
  { date: 'Hafta 7', revenue: 6_800, orders: 10, aov: 680 },
  { date: 'Hafta 8', revenue: 7_600, orders: 11, aov: 691 },
  { date: 'Hafta 9', revenue: 8_200, orders: 12, aov: 683 },
  { date: 'Hafta 10', revenue: 7_100, orders: 11, aov: 645 },
  { date: 'Hafta 11', revenue: 6_900, orders: 10, aov: 690 },
  { date: 'Hafta 12', revenue: 8_000, orders: 12, aov: 666 },
];


const categories: CategorySales[] = [
  { category: 'Erkek', units: 45, revenue: 18_000 },
  { category: 'Kadın', units: 52, revenue: 21_000 },
  { category: 'Çocuk', units: 22, revenue: 8_500 },
  { category: 'Aksesuar', units: 12, revenue: 4_200 },
];


const channels: ChannelShare[] = [
  { channel: 'Web', revenue: 1_420_000 },
  { channel: 'Mobile', revenue: 980_000 },
  { channel: 'Marketplace', revenue: 380_000 },
];

const topProducts: Product[] = [
  { id: 1, name: 'Oversize T-Shirt', sku: 'TSH-OVR-001', price: 399, unitsSold: 18, revenue: 7_182, stock: 12, category: 'Erkek' },
  { id: 2, name: 'Mom Jeans', sku: 'JNS-MOM-002', price: 899, unitsSold: 14, revenue: 12_586, stock: 8, category: 'Kadın' },
  { id: 3, name: 'Sneaker X', sku: 'SNK-X-003', price: 1_299, unitsSold: 9, revenue: 11_691, stock: 5, category: 'Unisex' },
  { id: 4, name: 'Çocuk Kapüşonlu', sku: 'KDS-HDY-004', price: 549, unitsSold: 11, revenue: 6_039, stock: 7, category: 'Çocuk' },
  { id: 5, name: 'Şapka Classic', sku: 'ACC-CAP-005', price: 249, unitsSold: 8, revenue: 1_992, stock: 15, category: 'Aksesuar' },
];


const recentOrders: RecentOrder[] = [
  { id: '#31245', date: '2025-08-18', customer: 'Ayşe Yılmaz', total: 1_248, status: 'Paid' },
  { id: '#31244', date: '2025-08-18', customer: 'Mehmet Demir', total: 449, status: 'Shipped' },
  { id: '#31243', date: '2025-08-17', customer: 'Elif Kaya', total: 2_199, status: 'Paid' },
  { id: '#31242', date: '2025-08-17', customer: 'Can Yıldız', total: 799, status: 'Pending' },
  { id: '#31241', date: '2025-08-16', customer: 'Zeynep Çetin', total: 389, status: 'Refunded' },
];

/* ============== Utilities ============== */
const sum = (arr: number[]): number => arr.reduce((a, b) => a + b, 0);

function toCSV(headers: Array<string | number>, rows: Array<Array<string | number>>): string {
  const enc = (c: string | number): string => (typeof c === 'string' ? `"${c.replace(/"/g, '""')}"` : String(c));
  return [headers, ...rows].map((r) => r.map(enc).join(',')).join('\n');
}

/* ============== Components ============== */
const KpiCard = ({ item, currency }: { item: KPI; currency?: boolean }) => {
  const positive = item.changePct >= 0;
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
        <div className={`flex items-center gap-1 text-xs ${positive ? 'text-emerald-600' : 'text-rose-600'}`}>
          {positive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
          <span>{item.changePct.toFixed(1)}%</span>
        </div>
      </div>
      <div className="mt-3 text-2xl font-semibold tracking-tight">
        {currency ? fmtCurrency(item.value) : item.value.toLocaleString('tr-TR')}
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

const SectionTitle = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <div className="flex items-end justify-between mb-3">
    <div>
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      {subtitle && <p className="text-xs text-zinc-500 mt-1">{subtitle}</p>}
    </div>
  </div>
);

/* ============== Page ============== */
export default function MerchantDashboardPanelPage() {
  const totalRevenue = useMemo(() => sum(last12Weeks.map((x) => x.revenue)), []);
  const totalOrders = useMemo(() => sum(last12Weeks.map((x) => x.orders)), []);
  const avgAOV = useMemo(() => Math.round(sum(last12Weeks.map((x) => x.aov)) / last12Weeks.length), []);

const kpis: KPI[] = [
  { label: 'Toplam Ciro', value: totalRevenue, changePct: 8.7, icon: <Wallet className="h-5 w-5" />, trend: last12Weeks.map(x => ({ date: x.date, value: x.revenue })) },
  { label: 'Toplam Sipariş', value: totalOrders, changePct: 6.4, icon: <ShoppingCart className="h-5 w-5" />, trend: last12Weeks.map(x => ({ date: x.date, value: x.orders })) },
  { label: 'Satılan Ürün (Adet)', value: 215, changePct: 4.1, icon: <Package className="h-5 w-5" />, trend: categories.map((c,i) => ({ date: `Ktg ${i+1}`, value: c.units })) },
  { label: 'Müşteri', value: 37, changePct: 3.2, icon: <Users className="h-5 w-5" />, trend: last12Weeks.map(x => ({ date: x.date, value: Math.round(x.orders * 0.25) })) },
];


  const exportCSV = (): void => {
    const headers = ['Tarih', 'Ciro', 'Sipariş', 'AOV'];
    const rows = last12Weeks.map((x) => [x.date, x.revenue, x.orders, x.aov]);
    const csv = toCSV(headers, rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'dashboard-revenue.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

return (
  <div className="min-h-screen w-full bg-gray-50 text-zinc-900">
    {/* === STICKY KIRMIZI KUTU === */}
    <div className="px-4 md:px-6 pt-4">
  {/* top-16: topbar yüksekliğine göre ayarla; z-10: chat butonu önde kalsın */}
<div className="sticky top-16 z-0">  {/* z-10/z-20 yerine z-0 */}
  <div className="rounded-xl border border-zinc-200 bg-white/80 backdrop-blur p-3 shadow-sm">
    <div className="max-h-[calc(100vh-120px)] overflow-y-auto pr-2
                    [-ms-overflow-style:none] [scrollbar-width:none]
                    [&::-webkit-scrollbar]:hidden">
        {/* --- Başlık --- */}
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

            {/* === Buradan aşağısı, mevcut içeriğin olduğu gibi taşınmış halidir === */}
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
              {kpis.map((k) => (
                <KpiCard key={k.label} item={k} currency={k.label === 'Toplam Ciro'} />
              ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 2xl:grid-cols-3 gap-4 mb-6">
              {/* Revenue */}
              <div className="2xl:col-span-2 rounded-2xl border border-zinc-200 bg-white p-5">
                <SectionTitle
                  title="Gelir (12 Hafta)"
                  subtitle={`Toplam: ${fmtCurrency(totalRevenue)} • Sipariş: ${totalOrders.toLocaleString('tr-TR')} • Ortalama Sepet: ${fmtCurrency(avgAOV)}`}
                />
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={last12Weeks} margin={{ left: 6, right: 6, top: 10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#22c55e" stopOpacity={0.4} />
                          <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="date" />
                      <YAxis tickFormatter={(v: number) => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(v))} />
                      <Tooltip formatter={(v: number, n: string) => (n === 'revenue' ? fmtCurrency(v) : v.toLocaleString('tr-TR'))} />
                      <Area type="monotone" dataKey="revenue" stroke="#22c55e" fill="url(#rev)" strokeWidth={2} />
                      <Line type="monotone" dataKey="orders" stroke="#6366f1" strokeWidth={2} dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Channel Pie */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-5">
                <SectionTitle title="Kanal Dağılımı" subtitle="Ciroya göre oran" />
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={channels} dataKey="revenue" nameKey="channel" innerRadius={60} outerRadius={100} paddingAngle={6}>
                        {channels.map((_, i) => (
                          <Cell key={`c-${i}`} fill={['#4f46e5', '#06b6d4', '#22c55e', '#f59e0b', '#ef4444'][i % 5]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number) => fmtCurrency(v)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Categories & Top products */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
              {/* Categories */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-5">
                <SectionTitle title="Kategori Performansı" subtitle="Adet ve ciro" />
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categories} margin={{ left: 6, right: 6, top: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="category" />
                      <YAxis yAxisId="left" orientation="left" tickFormatter={(v: number) => String(v)} />
                      <YAxis yAxisId="right" orientation="right" tickFormatter={(v: number) => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(v))} />
                      <Tooltip formatter={(v: number, n: string) => (n === 'revenue' ? fmtCurrency(v) : v.toLocaleString('tr-TR'))} />
                      <Bar yAxisId="left" dataKey="units" fill="#06b6d4" radius={[6, 6, 0, 0]} />
                      <Bar yAxisId="right" dataKey="revenue" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Top products */}
              <div className="xl:col-span-2 rounded-2xl border border-zinc-200 bg-white p-5">
                <SectionTitle title="En Çok Satan Ürünler" subtitle="Son 30 gün" />
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-zinc-500">
                        <th className="py-2 pr-3">Ürün</th>
                        <th className="py-2 pr-3">SKU</th>
                        <th className="py-2 pr-3">Kategori</th>
                        <th className="py-2 pr-3">Fiyat</th>
                        <th className="py-2 pr-3">Satış (Adet)</th>
                        <th className="py-2 pr-3">Ciro</th>
                        <th className="py-2 pr-3">Stok</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topProducts.map((p) => (
                        <tr key={p.id} className="border-t border-zinc-100">
                          <td className="py-3 pr-3 font-medium">{p.name}</td>
                          <td className="py-3 pr-3">{p.sku}</td>
                          <td className="py-3 pr-3">{p.category}</td>
                          <td className="py-3 pr-3">{fmtCurrency(p.price)}</td>
                          <td className="py-3 pr-3">{p.unitsSold.toLocaleString('tr-TR')}</td>
                          <td className="py-3 pr-3">{fmtCurrency(p.revenue)}</td>
                          <td className="py-3 pr-3">{p.stock}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Recent orders */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-5">
              <SectionTitle title="Son Siparişler" subtitle="En yeni 5 sipariş" />
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-zinc-500">
                      <th className="py-2 pr-3">Sipariş #</th>
                      <th className="py-2 pr-3">Tarih</th>
                      <th className="py-2 pr-3">Müşteri</th>
                      <th className="py-2 pr-3">Tutar</th>
                      <th className="py-2 pr-3">Durum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((o) => (
                      <tr key={o.id} className="border-t border-zinc-100">
                        <td className="py-3 pr-3 font-medium">{o.id}</td>
                        <td className="py-3 pr-3">{new Date(o.date).toLocaleDateString('tr-TR')}</td>
                        <td className="py-3 pr-3">{o.customer}</td>
                        <td className="py-3 pr-3">{fmtCurrency(o.total)}</td>
                        <td className="py-3 pr-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            o.status === 'Paid'
                              ? 'bg-emerald-500/10 text-emerald-600'
                              : o.status === 'Pending'
                              ? 'bg-amber-500/10 text-amber-600'
                              : o.status === 'Refunded'
                              ? 'bg-rose-500/10 text-rose-600'
                              : 'bg-blue-500/10 text-blue-600'
                          }`}>{o.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>


          </div>
        </div>
      </div>
    </div>
    {/* === /STICKY KIRMIZI KUTU === */}
  </div>
);
}
