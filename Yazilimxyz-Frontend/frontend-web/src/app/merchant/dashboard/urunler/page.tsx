// src/app/merchant/dashboard/urunler/page.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import axios, { AxiosInstance } from 'axios';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

/* ========== Tipler ========== */
type ApiEnvelope<T> = { data: T; success?: boolean; message?: string };

type MerchantSelf = {
  id: number;
  companyName: string;
  iban: string;
  taxNumber: string;
  companyAddress: string;
  phone: string;
};

type ProductListItem = {
  id: number;
  name: string;
  isActive: boolean;
  price?: number | null;
  basePrice?: number | null;
  categoryId?: number | null;
  categoryName?: string | null;
};

type Variant = {
  id: number;
  productId: number;
  size?: string | null;
  color?: string | null;
  stock: number;
};

type ProductRow = {
  id: number;
  name: string;
  isActive: boolean;
  categoryName?: string | null;
  price?: number | null;
  stockTotal: number;
  imageUrl?: string | null;
};

type MainImageDto = { imageUrl?: string | null; image?: string | null };
type ProductDetailed = { id: number; categoryId?: number | null; price?: number | null; basePrice?: number | null };

type Category = {
  id: number;
  name?: string | null;
  description?: string | null;
};

/* ========== Endpointler ========== */
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
const PROFILE = '/api/Merchant/profile';
const PRODUCTS_BY_MERCHANT = (merchantId: number) => `/api/Product/get-by-merchant/${merchantId}`;
const VARIANTS_BY_PRODUCT = (productId: number) => `/api/ProductVariants/by-product/${productId}`;
const IMAGE_MAIN_BY_PRODUCT = (productId: number) => `/api/ProductImage/product/${productId}/main`; // fotoğraf altyapısı sonra güncellenecek
const PRODUCT_DETAILED = (productId: number) => `/api/Product/${productId}/detailed`;
const CATEGORY_LIST = '/api/Category';

/* ========== Helpers ========== */
function isObject(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null;
}

function unwrap<T>(raw: unknown): T {
  if (isObject(raw) && 'data' in raw) {
    return (raw as ApiEnvelope<T>).data;
  }
  return raw as T;
}

function isCategoryArray(x: unknown): x is Category[] {
  return Array.isArray(x) && x.every((c) => isObject(c) && typeof (c as Category).id === 'number');
}

function hasCategoryItems(x: unknown): x is { items: Category[] } {
  return (
    isObject(x) &&
    'items' in x &&
    isCategoryArray((x as { items: unknown }).items)
  );
}

const sumStocks = (vs: Variant[]) =>
  vs.reduce((s, v) => s + (Number.isFinite(v.stock) ? v.stock : 0), 0);

/** Kategori sözlüğü {id -> name} */
async function loadCategoryDict(api: AxiosInstance): Promise<Record<number, string>> {
  const res = await api.get<ApiEnvelope<Category[] | { items: Category[] }> | Category[] | { items: Category[] }>(
    CATEGORY_LIST
  );
  const raw = unwrap<Category[] | { items: Category[] }>(res.data);

  const arr: Category[] = isCategoryArray(raw) ? raw : hasCategoryItems(raw) ? raw.items : [];
  const dict: Record<number, string> = {};
  for (const c of arr) dict[c.id] = String(c.name ?? '');
  return dict;
}

/* ========== Sayfa ========== */
export default function MerchantProductsListPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<ProductRow[]>([]);
  const [apiTotal, setApiTotal] = useState<number>(0);
  const [msg, setMsg] = useState<string | null>(null);

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

  const getData = async <T,>(path: string) => {
    const res = await api.get<ApiEnvelope<T> | T>(path);
    return unwrap<T>(res.data);
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setMsg(null);

        // 1) Merchant
        const me = await getData<MerchantSelf>(PROFILE);

        // 2) Ürün listesi
        const base = await getData<ProductListItem[]>(PRODUCTS_BY_MERCHANT(me.id));
        setApiTotal(base.length);

        // 3) Kategori sözlüğü
        const catDict = await loadCategoryDict(api);

        // 4) Zenginleştirme (stok, görsel, kategori adı)
        const enriched: ProductRow[] = await Promise.all(
          base.map(async (p) => {
            let stockTotal = 0;
            let imageUrl: string | null = null;

            try {
              const [vs, main] = await Promise.all([
                getData<Variant[]>(VARIANTS_BY_PRODUCT(p.id)),
                getData<MainImageDto>(IMAGE_MAIN_BY_PRODUCT(p.id)),
              ]);
              stockTotal = sumStocks(vs);
              imageUrl = main.imageUrl ?? main.image ?? null;
            } catch {
              /* görsel/variant hatası listeyi engellemesin */
            }

            // kategori adı
            let catName: string | null = null;
            let catId = typeof p.categoryId === 'number' ? p.categoryId : null;

            if (catId == null) {
              try {
                const det = await getData<ProductDetailed>(PRODUCT_DETAILED(p.id));
                catId = typeof det.categoryId === 'number' ? det.categoryId : null;
              } catch {
                /* yoksa boş bırak */
              }
            }

            if (catId != null && catDict[catId]) catName = catDict[catId];
            else if (p.categoryName) catName = p.categoryName ?? null;

            const price = p.price ?? p.basePrice ?? null;

            return {
              id: p.id,
              name: p.name,
              isActive: Boolean(p.isActive),
              categoryName: catName,
              price,
              stockTotal,
              imageUrl,
            };
          })
        );

        if (!alive) return;
        setRows(enriched);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const code = error.response?.status;
          if (code === 401) {
            router.replace('/merchant/giris');
            return;
          }
          const m = (error.response?.data as { message?: string } | undefined)?.message;
          setMsg(m ?? `Hata: ${code ?? ''}`);
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

  // filtre + sayfalama
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const base = term
      ? rows.filter(
          (r) =>
            (r.name || '').toLowerCase().includes(term) ||
            (r.categoryName || '').toLowerCase().includes(term)
        )
      : rows;

    const total = base.length;
    const maxPage = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(page, maxPage);
    const start = (safePage - 1) * pageSize;
    return {
      items: base.slice(start, start + pageSize),
      total,
      maxPage,
      page: safePage,
    };
  }, [rows, q, page, pageSize]);

  if (loading) return <div className="text-slate-600 text-sm">Yükleniyor…</div>;

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-semibold text-slate-800">Ürünler</h1>
        <a
          href="/merchant/dashboard/urunler/urunyeni"
          className="rounded-2xl px-4 py-2.5 bg-slate-800 text-white text-[15px] border border-slate-300 hover:opacity-90"
        >
          + Yeni Ürün
        </a>
      </div>

      {msg && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {msg}
        </div>
      )}

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

        {/* tablo */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-[15px]">
            <thead>
              <tr className="text-left text-slate-500">
                <th className="py-2.5 px-3">Ürün</th>
                <th className="py-2.5 px-3">Kategori (Ad)</th>
                <th className="py-2.5 px-3">Fiyat</th>
                <th className="py-2.5 px-3">Toplam Stok</th>
                <th className="py-2.5 px-3">Durum</th>
                <th className="py-2.5 px-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.items.map((p) => (
                <tr key={p.id} className="border-t border-slate-100">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-md bg-slate-200 overflow-hidden flex items-center justify-center">
                        {p.imageUrl ? (
                          <Image
                            src={p.imageUrl}
                            alt={p.name}
                            width={40}
                            height={40}
                            className="h-full w-full object-cover"
                            unoptimized
                          />
                        ) : (
                          <span className="text-xs text-slate-500">img</span>
                        )}
                      </div>
                      <div className="font-medium text-slate-800">{p.name}</div>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-slate-700">{p.categoryName ?? '-'}</td>
                  <td className="py-3 px-3 text-slate-700">
                    {p.price != null ? `${p.price.toLocaleString('tr-TR')} ₺` : '-'}
                  </td>
                  <td className="py-3 px-3">{p.stockTotal}</td>
                  <td className="py-3 px-3">
                    <span
                      className={
                        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ' +
                        (p.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600')
                      }
                    >
                      {p.isActive ? 'Aktif' : 'Pasif'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => router.push(`/merchant/dashboard/urunler/urundetay/${p.id}`)}
                      className="text-slate-700 hover:text-slate-900 underline-offset-2 hover:underline text-sm"
                    >
                      Düzenle
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.items.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500">
                    Kayıt bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* sayfalama */}
        <div className="flex items-center justify-between mt-4 text-sm text-slate-600">
          <div>
            Toplam <strong>{q ? filtered.total : apiTotal}</strong> ürün
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p0) => Math.max(1, p0 - 1))}
              disabled={filtered.page <= 1}
              className="px-3 py-1.5 rounded-lg border border-slate-300 disabled:opacity-50"
            >
              ‹ Önceki
            </button>
            <span>
              {filtered.page} / {filtered.maxPage}
            </span>
            <button
              onClick={() => setPage((p0) => Math.min(filtered.maxPage, p0 + 1))}
              disabled={filtered.page >= filtered.maxPage}
              className="px-3 py-1.5 rounded-lg border border-slate-300 disabled:opacity-50"
            >
              Sonraki ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
