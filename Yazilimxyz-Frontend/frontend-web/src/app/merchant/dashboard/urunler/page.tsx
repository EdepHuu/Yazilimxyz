// src/app/merchant/(dashboard)/urunler/page.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

// ====== Types ======
type ApiResponse<T> = { data: T; success?: boolean; message?: string };

type MerchantSelf = {
  id: number;
  companyName: string;
  iban: string;
  taxNumber: string;
  companyAddress: string;
  phone: string;
};

type ProductBase = {
  id: number;
  name: string;
  isActive: boolean;
  // backend bu alanları vermiyorsa dolduracağız:
  categoryName?: string | null;
  price?: number | null;
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

type Variant = {
  id: number;
  productId: number;
  size?: string | null;
  color?: string | null;
  stock: number;
};

type ProductImage = {
  id: number;
  image: string;    // URL veya base64
  altText?: string | null;
  productId: number;
};

// ====== Endpoints ======
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';
const PROFILE = '/api/merchant/profile';
const PRODUCTS_BY_MERCHANT = (merchantId: number) => `/api/merchant/${merchantId}/products`;

// extras
const VARIANTS_BY_PRODUCT = (productId: number) => `/api/ProductVariants/by-product/${productId}`;
const IMAGE_MAIN_BY_PRODUCT = (productId: number) => `/api/ProductImage/product/${productId}/main`;
// opsiyonel: ürün detayından kategori/fiyat istersek
const PRODUCT_BY_ID = (id: number) => `/api/Products/${id}`;

// ====== Helpers (any YOK) ======
function isObj(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null;
}
function unwrap<T>(raw: unknown): T {
  return isObj(raw) && 'data' in raw ? (raw as ApiResponse<T>).data : (raw as T);
}
function getMsg(raw: unknown): string | undefined {
  if (typeof raw === 'string') return raw;
  if (isObj(raw) && typeof (raw as { message?: string }).message === 'string') {
    return (raw as { message?: string }).message;
  }
  return undefined;
}

// ====== Page ======
export default function MerchantProductsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<ProductRow[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  // UI state
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // right panel (edit)
  const [openId, setOpenId] = useState<number | null>(null);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [varSaving, setVarSaving] = useState(false);
  const [varMsg, setVarMsg] = useState<string | null>(null);

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

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setMsg(null);
        // 1) self -> merchantId
        const meRes = await api.get<ApiResponse<MerchantSelf> | MerchantSelf>(PROFILE);
        const me = unwrap<MerchantSelf>(meRes.data);

        // 2) merchant products
        const prRes = await api.get<ApiResponse<ProductBase[]> | ProductBase[]>(
          PRODUCTS_BY_MERCHANT(me.id)
        );
        const baseList = unwrap<ProductBase[]>(prRes.data);

        // 3) extras (main image + variants + opsiyonel product detail)
        const enriched = await Promise.all(
          baseList.map(async (p) => {
            let stockTotal = 0;
            let imageUrl: string | null | undefined = null;
            let categoryName = p.categoryName ?? null;
            let price = p.price ?? null;

            try {
              const [vRes, imgRes] = await Promise.allSettled([
                api.get<ApiResponse<Variant[]> | Variant[]>(VARIANTS_BY_PRODUCT(p.id)),
                api.get<ApiResponse<ProductImage> | ProductImage>(IMAGE_MAIN_BY_PRODUCT(p.id)),
              ]);

              if (vRes.status === 'fulfilled') {
                const vs = unwrap<Variant[]>(vRes.value.data);
                stockTotal = vs.reduce((sum, v) => sum + (Number.isFinite(v.stock) ? v.stock : 0), 0);
              }
              if (imgRes.status === 'fulfilled') {
                const img = unwrap<ProductImage>(imgRes.value.data);
                imageUrl = img?.image ?? null;
              }
            } catch {
              /* yut */
            }

            // kategori/fiyat boşsa opsiyonel ürün detayını dene
            if (!categoryName || price == null) {
              try {
                const pd = await api.get<ApiResponse<{ categoryName?: string; price?: number }> | { categoryName?: string; price?: number }>(
                  PRODUCT_BY_ID(p.id)
                );
                const det = unwrap<{ categoryName?: string; price?: number }>(pd.data);
                categoryName = categoryName || det.categoryName || null;
                price = price ?? det.price ?? null;
              } catch {
                /* ignore */
              }
            }

            return {
              id: p.id,
              name: p.name,
              isActive: p.isActive,
              categoryName,
              price,
              stockTotal,
              imageUrl,
            } as ProductRow;
          })
        );

        if (!alive) return;
        setRows(enriched);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const code = err.response?.status;
          if (code === 401) return router.replace('/merchant/giris');
          setMsg(getMsg(err.response?.data) || `Hata: ${code ?? ''}`);
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
      ? rows.filter((r) => {
          const name = (r.name || '').toLowerCase();
          const cat = (r.categoryName || '').toLowerCase();
          return name.includes(term) || cat.includes(term);
        })
      : rows;

    const total = base.length;
    const maxPage = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(page, maxPage);
    const start = (safePage - 1) * pageSize;
    const items = base.slice(start, start + pageSize);

    return { items, total, maxPage, page: safePage };
  }, [rows, q, page, pageSize]);

  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(filtered.maxPage, p + 1));

  // ====== Right panel (variants) ======
  const openPanel = async (id: number) => {
    setOpenId(id);
    setVarMsg(null);
    try {
      const v = await api.get<ApiResponse<Variant[]> | Variant[]>(VARIANTS_BY_PRODUCT(id));
      setVariants(unwrap<Variant[]>(v.data));
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const code = err.response?.status;
        if (code === 401) return router.replace('/merchant/giris');
        setVarMsg(getMsg(err.response?.data) || 'Varyantlar getirilemedi.');
      } else setVarMsg('Beklenmeyen hata.');
    }
  };

  const closePanel = () => {
    setOpenId(null);
    setVariants([]);
    setVarMsg(null);
  };

  const updateVariant = async (v: Variant, patch: Partial<Variant>) => {
    setVarSaving(true);
    setVarMsg(null);
    try {
      const body = { ...v, ...patch };
      await api.put(`/api/ProductVariants/${v.id}`, body);
      setVariants((list) => list.map((x) => (x.id === v.id ? { ...x, ...patch } : x)));
      // toplam stoğu listede de güncelle
      setRows((list) =>
        list.map((r) =>
          r.id === v.productId ? { ...r, stockTotal: sumStocks(variants.map((x) => (x.id === v.id ? { ...x, ...patch } : x))) } : r
        )
      );
      setVarMsg('✅ Varyant güncellendi.');
    } catch (err) {
      if (axios.isAxiosError(err)) setVarMsg(getMsg(err.response?.data) || '❌ Güncellenemedi.');
      else setVarMsg('❌ Beklenmeyen hata.');
    } finally {
      setVarSaving(false);
    }
  };

  const deleteVariant = async (v: Variant) => {
    setVarSaving(true);
    setVarMsg(null);
    try {
      await api.delete(`/api/ProductVariants/${v.id}`);
      const next = variants.filter((x) => x.id !== v.id);
      setVariants(next);
      setRows((list) =>
        list.map((r) => (r.id === v.productId ? { ...r, stockTotal: sumStocks(next) } : r))
      );
      setVarMsg('🗑️ Varyant silindi.');
    } catch (err) {
      if (axios.isAxiosError(err)) setVarMsg(getMsg(err.response?.data) || '❌ Silinemedi.');
      else setVarMsg('❌ Beklenmeyen hata.');
    } finally {
      setVarSaving(false);
    }
  };

  const addVariant = async (productId: number) => {
    setVarSaving(true);
    setVarMsg(null);
    try {
      const payload = { productId, size: 'M', color: 'Siyah', stock: 0 };
      const res = await api.post<ApiResponse<Variant> | Variant>(`/api/ProductVariants`, payload);
      const created = unwrap<Variant>(res.data);
      const next = [...variants, created];
      setVariants(next);
      setRows((list) =>
        list.map((r) => (r.id === productId ? { ...r, stockTotal: sumStocks(next) } : r))
      );
      setVarMsg('✅ Yeni varyant eklendi.');
    } catch (err) {
      if (axios.isAxiosError(err)) setVarMsg(getMsg(err.response?.data) || '❌ Eklenemedi.');
      else setVarMsg('❌ Beklenmeyen hata.');
    } finally {
      setVarSaving(false);
    }
  };

  if (loading) return <div className="text-slate-600 text-sm">Yükleniyor…</div>;

  return (
    <div className="max-w-6xl relative">
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

        {/* table (Oluşturma sütunu kaldırıldı) */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-[15px]">
            <thead>
              <tr className="text-left text-slate-500">
                <th className="py-2.5 px-3">Ürün</th>
                <th className="py-2.5 px-3">Kategori</th>
                <th className="py-2.5 px-3">Fiyat</th>
                <th className="py-2.5 px-3">Toplam Stok</th>
                <th className="py-2.5 px-3">Durum</th>
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
                      onClick={() => openPanel(p.id)}
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

      {/* ===== Right side panel (varyant detay) ===== */}
      {openId !== null && (
        <aside className="fixed right-0 top-0 bottom-0 w-full sm:w-[480px] bg-white shadow-xl border-l border-slate-200 z-40">
          <div className="h-14 px-4 border-b border-slate-200 flex items-center justify-between">
            <div className="font-semibold">Varyantlar</div>
            <button onClick={closePanel} className="text-slate-600 hover:text-slate-900">✕</button>
          </div>

          <div className="p-4 space-y-4 overflow-y-auto h-[calc(100%-56px)]">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-600">{varSaving ? 'İşleniyor…' : varMsg}</div>
              <button
                onClick={() => addVariant(openId)}
                disabled={varSaving}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-white text-sm hover:opacity-90 disabled:opacity-50"
              >
                + Varyant Ekle
              </button>
            </div>

            <div className="space-y-3">
              {variants.map((v) => (
                <div key={v.id} className="border border-slate-200 rounded-xl p-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Beden</label>
                      <input
                        value={v.size ?? ''}
                        onChange={(e) => setVariants((l) => l.map((x) => x.id === v.id ? { ...x, size: e.target.value } : x))}
                        className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Renk</label>
                      <input
                        value={v.color ?? ''}
                        onChange={(e) => setVariants((l) => l.map((x) => x.id === v.id ? { ...x, color: e.target.value } : x))}
                        className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Stok</label>
                      <input
                        type="number"
                        value={v.stock}
                        onChange={(e) =>
                          setVariants((l) =>
                            l.map((x) => (x.id === v.id ? { ...x, stock: Number(e.target.value) || 0 } : x))
                          )
                        }
                        className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                      />
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <button
                      onClick={() => updateVariant(v, variants.find((x) => x.id === v.id)!)}
                      disabled={varSaving}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 text-sm hover:bg-slate-50"
                    >
                      Kaydet
                    </button>
                    <button
                      onClick={() => deleteVariant(v)}
                      disabled={varSaving}
                      className="px-3 py-1.5 rounded-lg bg-red-600/90 text-white text-sm hover:bg-red-600 disabled:opacity-50"
                    >
                      Sil
                    </button>
                  </div>
                </div>
              ))}

              {variants.length === 0 && (
                <div className="text-sm text-slate-500">Bu ürüne ait varyant bulunamadı.</div>
              )}
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}

// ===== Utils =====
function sumStocks(vs: Variant[]): number {
  return vs.reduce((s, v) => s + (Number.isFinite(v.stock) ? v.stock : 0), 0);
}
