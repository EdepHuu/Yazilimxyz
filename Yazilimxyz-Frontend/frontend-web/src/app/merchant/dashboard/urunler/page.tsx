// src/app/merchant/dashboard/urunler/page.tsx
'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
  mainPhoto?: string | null; // /uploads/... gelebilir
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

type CategorySlim = { id: number; name?: string | null };

/** Backend’in detailed cevabı farklı şemalarda dönebiliyor; hepsini kapsayacak “gevşek” tip */
type ProductDetailedLoose = {
  categoryId?: number | null;
  categoryID?: number | null; // muhtemel alternatif
  categoryName?: string | null;
  category?: { id?: number | null; name?: string | null } | null;
  // geri kalan alanlar bizi ilgilendirmiyor
};

/* ========== Endpointler ========== */
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
const PROFILE = '/api/Merchant/profile';
const PRODUCTS_ALL = '/api/Product/get-all';
const VARIANTS_BY_PRODUCT = (productId: number) => `/api/ProductVariants/by-product/${productId}`;
const IMAGE_MAIN_BY_PRODUCT = (productId: number) => `/api/ProductImage/product/${productId}/main`;
const PRODUCT_DETAILED = (productId: number) => `/api/Product/${productId}/detailed`;
const CATEGORY_LIST = '/api/Category';
const CATEGORY_BY_ID = (id: number) => `/api/Category/${id}`;

/* ========== Helpers ========== */
const isObject = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null;

function unwrap<T>(raw: unknown): T {
  if (isObject(raw) && 'data' in raw) return (raw as ApiEnvelope<T>).data as T;
  return raw as T;
}

const sumStocks = (vs: Variant[]) => vs.reduce((s, v) => s + (Number.isFinite(v.stock) ? v.stock : 0), 0);
const absolutize = (u?: string | null) => (u ? (u.startsWith('http') ? u : `${API_BASE}${u}`) : null);

/** /uploads/merchant/{id}/... içerisinden id çıkarır */
function extractMerchantIdFromPath(path?: string | null): number | null {
  if (!path) return null;
  const m = path.match(/\/uploads\/merchant\/(\d+)\//i);
  return m ? Number(m[1]) : null;
}

/** Kategori sözlüğü {id -> name} */
async function loadCategoryDict(api: AxiosInstance): Promise<Record<number, string>> {
  const res = await api.get<ApiEnvelope<CategorySlim[]>>(CATEGORY_LIST);
  const arr = unwrap<CategorySlim[]>(res.data) ?? [];
  const dict: Record<number, string> = {};
  for (const c of arr) dict[c.id] = String(c.name ?? '');
  return dict;
}

/** detailed cevabından {id, name} çıkar (type guard’lı, any yok) */
function extractCategoryFromDetailed(det: unknown): { id: number | null; name: string | null } {
  if (!isObject(det)) return { id: null, name: null };

  // name doğrudan
  const directName =
    (typeof (det as { categoryName?: unknown }).categoryName === 'string'
      ? (det as { categoryName?: string }).categoryName
      : null) ??
    (isObject((det as { category?: unknown }).category) &&
    typeof ((det as { category?: { name?: unknown } }).category as { name?: unknown })?.name === 'string'
      ? (((det as { category?: { name?: unknown } }).category as { name?: unknown }).name as string)
      : null);

  // id olasılıkları
  const idCandidates: Array<number | null> = [
    typeof (det as { categoryId?: unknown }).categoryId === 'number'
      ? ((det as { categoryId?: number }).categoryId as number)
      : null,
    typeof (det as { categoryID?: unknown }).categoryID === 'number'
      ? ((det as { categoryID?: number }).categoryID as number)
      : null,
    isObject((det as { category?: unknown }).category) &&
    typeof ((det as { category?: { id?: unknown } }).category as { id?: unknown })?.id === 'number'
      ? (((det as { category?: { id?: unknown } }).category as { id?: unknown }).id as number)
      : null,
  ];

  const id = idCandidates.find((v) => typeof v === 'number') ?? null;
  return { id, name: directName };
}

/** Sözlük + (gerekirse) tekil çağrı ile kategori adını getir */
async function resolveCategoryName(
  api: AxiosInstance,
  dict: Record<number, string>,
  detail: unknown,
  fallbackName?: string | null
): Promise<string | null> {
  const { id, name } = extractCategoryFromDetailed(detail);
  if (name) return name;
  if (id != null) {
    if (dict[id]) return dict[id];
    try {
      const res = await api.get<ApiEnvelope<CategorySlim>>(CATEGORY_BY_ID(id));
      const item = unwrap<CategorySlim>(res.data);
      const n = item?.name ?? null;
      return n ?? null;
    } catch {
      // yoksay
    }
  }
  return fallbackName ?? null;
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

  // useEffect bağımlılığı için useCallback
  const getData = useCallback(
    async <T,>(path: string) => {
      const res = await api.get<ApiEnvelope<T> | T>(path);
      return unwrap<T>(res.data);
    },
    [api]
  );

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setMsg(null);

        // 1) Giriş yapan merchant
        const me = await getData<MerchantSelf>(PROFILE);

        // 2) Tüm ürünler
        const base = await getData<ProductListItem[]>(PRODUCTS_ALL);
        setApiTotal(base.length);

        // 3) Ana görsel + owner (merchantId) çıkar
        const withOwner = await Promise.all(
          base.map(async (p) => {
            let imageUrl = absolutize(p.mainPhoto ?? null);
            if (!imageUrl) {
              try {
                const mi = await getData<MainImageDto>(IMAGE_MAIN_BY_PRODUCT(p.id));
                imageUrl = absolutize(mi.imageUrl ?? mi.image ?? null);
              } catch {
                /* yoksa boş */
              }
            }
            const ownerId = extractMerchantIdFromPath(imageUrl ?? p.mainPhoto ?? null);
            return {
              ...p,
              __imageUrl: imageUrl as string | null,
              __ownerId: ownerId as number | null,
            };
          })
        );

        // 4) SADECE giriş yapan merchant'ın ürünleri
        const list = withOwner.filter((p) => p.__ownerId === me.id);

        // 5) Kategori sözlüğü
        const catDict = await loadCategoryDict(api);

        // 6) Enrichment: stok ve kategori adı
        const enriched: ProductRow[] = await Promise.all(
          list.map(async (p) => {
            // stok
            let stockTotal = 0;
            try {
              const vs = await getData<Variant[]>(VARIANTS_BY_PRODUCT(p.id));
              stockTotal = sumStocks(vs);
            } catch {
              /* stok gelmezse 0 */
            }

            // kategori adı
            let categoryName: string | null = null;
            try {
              const det = await getData<ProductDetailedLoose>(PRODUCT_DETAILED(p.id));
              categoryName = await resolveCategoryName(api, catDict, det, p.categoryName ?? null);
            } catch {
              categoryName = p.categoryName ?? null;
            }

            const price = p.price ?? p.basePrice ?? null;

            return {
              id: p.id,
              name: p.name,
              isActive: Boolean(p.isActive),
              categoryName,
              price,
              stockTotal,
              imageUrl: p.__imageUrl ?? null,
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
  }, [api, getData, router]);

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
    return { items: base.slice(start, start + pageSize), total, maxPage, page: safePage };
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
