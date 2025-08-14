// src/app/merchant/(dashboard)/urunler/page.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

type MerchantSelf = {
  id: number;                 // Merchant Id (profile’dan gelecek)
  companyName: string;
  iban: string;
  taxNumber: string;
  companyAddress: string;
  phone: string;
};
type ApiResponse<T> = { data: T; success?: boolean; message?: string };

type Product = {
  id: number;
  name: string;
  price: number;
  stock: number;
  isActive: boolean;
  imageUrl?: string | null;
  categoryName?: string | null;
  createdAt?: string | null;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';
const PROFILE = '/api/merchant/profile';
const PRODUCTS_BY_MERCHANT = (merchantId: number) => `/api/merchant/${merchantId}/products`;

// helpers
function isObj(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null;
}
function unwrap<T>(raw: unknown): T {
  return isObj(raw) && 'data' in raw ? (raw as ApiResponse<T>).data : (raw as T);
}
function getMsg(raw: unknown): string | undefined {
  if (typeof raw === 'string') return raw;
  if (isObj(raw) && typeof raw.message === 'string') return raw.message;
  return undefined;
}

export default function MerchantProductsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  const [products, setProducts] = useState<Product[]>([]);

  // UI state
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const api = useMemo(() => {
    const inst = axios.create({ baseURL: API_BASE });
    inst.interceptors.request.use((cfg) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (token) cfg.headers.Authorization = `Bearer ${token}`;
      cfg.headers['Content-Type'] = 'application/json';
      return cfg;
    });
    return inst;
  }, []);

  // fetch products for current merchant
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setMsg(null);
        // 1) self profile -> merchantId
        const meRes = await api.get<ApiResponse<MerchantSelf> | MerchantSelf>(PROFILE);
        const me = unwrap<MerchantSelf>(meRes.data);
        if (!me?.id) throw new Error('Merchant kimliği bulunamadı.');

        // 2) products by merchant
        const prRes = await api.get<ApiResponse<Product[]> | Product[]>(
          PRODUCTS_BY_MERCHANT(me.id)
        );
        const list = unwrap<Product[]>(prRes.data);
        if (!alive) return;
        setProducts(Array.isArray(list) ? list : []);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const code = err.response?.status;
          if (code === 401) return router.replace('/merchant/giris');
          setMsg(getMsg(err.response?.data) || `Hata: ${code ?? ''}`);
        } else if (err instanceof Error) {
          setMsg(err.message);
        } else {
          setMsg('Beklenmeyen bir hata oluştu.');
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [api, router]);

  // filter + paginate (client-side)
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const base = term
      ? products.filter((p) => {
          const name = (p.name || '').toLowerCase();
          const cat = (p.categoryName || '').toLowerCase();
          return name.includes(term) || cat.includes(term);
        })
      : products;

    const total = base.length;
    const maxPage = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(page, maxPage);
    const start = (safePage - 1) * pageSize;
    const items = base.slice(start, start + pageSize);

    return { items, total, maxPage, page: safePage };
  }, [products, q, page, pageSize]);

  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(filtered.maxPage, p + 1));

  if (loading) return <div className="text-slate-600 text-sm">Yükleniyor…</div>;

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-semibold text-slate-800">Ürünler</h1>
        <a
          href="/merchant/urunler/yeni"
          className="rounded-2xl px-4 py-2.5 bg-slate-800 text-white text-[15px] border border-slate-300 hover:opacity-90"
        >
          + Yeni Ürün
        </a>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
        {/* toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-4">
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Ürün adı veya kategori ara…"
            className="w-full sm:w-80 rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-600">Sayfa boyutu</label>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:outline-none"
            >
              {[10, 20, 50].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-[15px]">
            <thead>
              <tr className="text-left text-slate-500">
                <th className="py-2.5 px-3">Ürün</th>
                <th className="py-2.5 px-3">Kategori</th>
                <th className="py-2.5 px-3">Fiyat</th>
                <th className="py-2.5 px-3">Stok</th>
                <th className="py-2.5 px-3">Durum</th>
                <th className="py-2.5 px-3">Oluşturma</th>
                <th className="py-2.5 px-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.items.map((p) => (
                <tr key={p.id} className="border-t border-slate-100">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-md bg-slate-200 overflow-hidden flex items-center justify-center">
                        {p.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-xs text-slate-500">img</span>
                        )}
                      </div>
                      <div className="font-medium text-slate-800">{p.name}</div>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-slate-700">{p.categoryName ?? '-'}</td>
                  <td className="py-3 px-3 text-slate-700">
                    {Number.isFinite(p.price) ? `${p.price.toLocaleString('tr-TR')} ₺` : '-'}
                  </td>
                  <td className="py-3 px-3">{p.stock}</td>
                  <td className="py-3 px-3">
                    <span
                      className={
                        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ' +
                        (p.isActive
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-200 text-slate-600')
                      }
                    >
                      {p.isActive ? 'Aktif' : 'Pasif'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-600">
                    {p.createdAt ? new Date(p.createdAt).toLocaleDateString('tr-TR') : '-'}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <a
                      href={`/merchant/urunler/${p.id}`}
                      className="text-slate-700 hover:text-slate-900 underline-offset-2 hover:underline text-sm"
                    >
                      Düzenle
                    </a>
                  </td>
                </tr>
              ))}
              {filtered.items.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500">
                    Kayıt bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* pagination */}
        <div className="flex items-center justify-between mt-4 text-sm text-slate-600">
          <div>
            Toplam <strong>{filtered.total}</strong> ürün
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={goPrev}
              disabled={filtered.page <= 1}
              className="px-3 py-1.5 rounded-lg border border-slate-300 disabled:opacity-50"
            >
              ‹ Önceki
            </button>
            <span>
              {filtered.page} / {filtered.maxPage}
            </span>
            <button
              onClick={goNext}
              disabled={filtered.page >= filtered.maxPage}
              className="px-3 py-1.5 rounded-lg border border-slate-300 disabled:opacity-50"
            >
              Sonraki ›
            </button>
          </div>
        </div>
      </div>

      {/* hata mesajı */}
      {msg && (
        <div className="mt-4 text-sm text-red-600">
          {msg}
        </div>
      )}
    </div>
  );
}
