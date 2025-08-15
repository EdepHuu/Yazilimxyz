'use client';

import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

type ApiResponse<T> = { data: T; success?: boolean; message?: string };

type ProductDetail = {
  id: number; name: string; description?: string | null;
  basePrice?: number | null; price?: number | null;
  gender?: number | null; isActive: boolean;
  categoryId?: number | null; categoryName?: string | null;
  mainPhoto?: string | null;
};

type Variant = { id: number; productId: number; size?: string | null; color?: string | null; stock: number; };

type ProductImageRow = { id: number; imageUrl?: string | null; image?: string | null; altText?: string | null; sortOrder?: number | null; productId: number; };
type ProductImage = { id: number; imageUrl: string; altText?: string | null; sortOrder?: number | null; productId: number; isMain?: boolean; };
type MainImageDto = { imageUrl?: string | null; image?: string | null };

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';
const PRODUCT_DETAILED = (productId: number) => `/api/Product/${productId}/detailed`;
const PRODUCT_UPDATE = `/api/Product/update`;
const VARIANTS_BY_PRODUCT = (productId: number) => `/api/ProductVariants/by-product/${productId}`;
const VARIANT_UPDATE = (id: number) => `/api/ProductVariants/${id}`;
const VARIANT_DELETE = (id: number) => `/api/ProductVariants/${id}`;
const VARIANT_CREATE = `/api/ProductVariants`;
const IMAGES_BY_PRODUCT = (productId: number) => `/api/ProductImage/product/${productId}`;
const IMAGE_DELETE = (id: number) => `/api/ProductImage/${id}`;
const IMAGE_SET_MAIN = (imageId: number) => `/api/ProductImage/set-main/${imageId}`;
const IMAGE_REORDER = (productId: number) => `/api/ProductImage/reorder/${productId}`;
const IMAGE_MAIN_BY_PRODUCT = (productId: number) => `/api/ProductImage/product/${productId}/main`;

const isObj = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null;
const unwrap = <T,>(raw: unknown): T => (isObj(raw) && 'data' in raw ? (raw as ApiResponse<T>).data : (raw as T));

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const productId = Number(params.id);

  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<ProductDetail | null>(null);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [saveBusy, setSaveBusy] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const [dirtyProduct, setDirtyProduct] = useState(false);
  const [dirtyVariants, setDirtyVariants] = useState<Set<number>>(new Set());
  const [newVariants, setNewVariants] = useState<Variant[]>([]);
  const [deletedVariantIds, setDeletedVariantIds] = useState<number[]>([]);
  const [imagesDirty, setImagesDirty] = useState(false);

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
    const res = await api.get<ApiResponse<T> | T>(path);
    return unwrap<T>(res.data);
  };

  useEffect(() => {
    if (!Number.isFinite(productId) || productId <= 0) {
      router.replace('/merchant/dashboard/urunler');
      return;
    }
    let alive = true;
    (async () => {
      try {
        setMsg(null);
        const det = await getData<ProductDetail>(PRODUCT_DETAILED(productId));
        const vs = await getData<Variant[]>(VARIANTS_BY_PRODUCT(productId));
        const [imgs, main] = await Promise.all([
          getData<ProductImageRow[]>(IMAGES_BY_PRODUCT(productId)),
          getData<MainImageDto>(IMAGE_MAIN_BY_PRODUCT(productId)),
        ]);

        let parsed: ProductImage[] = imgs.map((x) => ({
          id: x.id,
          imageUrl: (x.imageUrl ?? x.image) ?? '',
          altText: x.altText ?? null,
          sortOrder: x.sortOrder ?? null,
          productId: x.productId,
        }));
        const mainUrl = main.imageUrl ?? main.image ?? null;
        if (mainUrl) parsed = parsed.map((i) => ({ ...i, isMain: i.imageUrl === mainUrl }));

        if (!alive) return;
        setDetail({
          id: det.id,
          name: det.name,
          description: det.description ?? null,
          basePrice: det.basePrice ?? det.price ?? null,
          price: det.price ?? det.basePrice ?? null,
          gender: det.gender ?? null,
          isActive: !!det.isActive,
          categoryId: det.categoryId ?? null,
          categoryName: det.categoryName ?? null,
          mainPhoto: mainUrl ?? det.mainPhoto ?? null,
        });
        setVariants(vs);
        setImages(parsed);
      } catch { setMsg('Detaylar getirilemedi.'); }
      finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, [api, productId, router]);

  const saveAll = async () => {
    if (!detail) return;
    const hasChanges =
      dirtyProduct || imagesDirty || dirtyVariants.size > 0 || newVariants.length > 0 || deletedVariantIds.length > 0;
    if (!hasChanges) { setSaveMsg('Kaydedilecek değişiklik yok.'); return; }
    if (!window.confirm('Kaydetmek istediğinize emin misiniz?')) return;

    setSaveBusy(true); setSaveMsg(null);
    try {
      if (dirtyProduct) {
        const payload = {
          id: detail.id,
          name: detail.name,
          description: detail.description,
          price: detail.price ?? detail.basePrice ?? null,
          basePrice: detail.basePrice ?? detail.price ?? null,
          gender: detail.gender,
          isActive: detail.isActive,
          categoryId: detail.categoryId,
        };
        await api.put(PRODUCT_UPDATE, payload);
      }
      for (const id of deletedVariantIds) { await api.delete(VARIANT_DELETE(id)); }
      for (const id of Array.from(dirtyVariants)) {
        const v = variants.find((x) => x.id === id);
        if (v) await api.put(VARIANT_UPDATE(id), v);
      }
      for (const nv of newVariants) { await api.post(VARIANT_CREATE, nv); }

      if (imagesDirty && images.length) {
        const main = images.find((i) => i.isMain);
        if (main) await api.put(IMAGE_SET_MAIN(main.id));
        const ordered = images.map((i, idx) => ({ id: i.id, sortOrder: idx + 1 }));
        await api.put(IMAGE_REORDER(detail.id), ordered);
      }

      setDirtyProduct(false); setDirtyVariants(new Set()); setNewVariants([]); setDeletedVariantIds([]); setImagesDirty(false);
      setSaveMsg('✅ Değişiklikler kaydedildi.');
    } catch { setSaveMsg('❌ Kaydetme hatası.'); } finally { setSaveBusy(false); }
  };

  const addVariant = () => {
    if (!detail) return;
    const tmpId = Math.floor(Math.random() * -1_000_000_000);
    const tmp: Variant = { id: tmpId, productId: detail.id, size: 'M', color: 'Siyah', stock: 0 };
    setNewVariants(l => [...l, tmp]); setVariants(l => [...l, tmp]);
  };
  const removeVariant = (v: Variant) => {
    if (v.id < 0) { setNewVariants(l => l.filter(x => x.id !== v.id)); setVariants(l => l.filter(x => x.id !== v.id)); }
    else { setDeletedVariantIds(l => [...l, v.id]); setVariants(l => l.filter(x => x.id !== v.id)); }
  };
  const deleteImage = async (img: ProductImage) => {
    try { await api.delete(IMAGE_DELETE(img.id)); setImagesDirty(true); setImages(l => l.filter(x => x.id !== img.id)); }
    catch { alert('Görsel silinemedi.'); }
  };

  if (loading) return <div className="text-slate-600 text-sm px-4">Yükleniyor…</div>;

  return (
    <div className="w-full">
      <div className="max-w-[1400px] pl-6 pr-8">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-2xl font-semibold text-slate-800">Ürün Detay</h1>
          <a href="/merchant/dashboard/urunler" className="text-sm text-slate-700 hover:underline">‹ Ürün listesine dön</a>
        </div>

        {msg && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {msg}
          </div>
        )}

        {detail && (
          <div
            className="
              w-full max-w-[1100px]
              bg-white rounded-2xl shadow-sm border border-slate-200
              p-5 space-y-6
              md:sticky md:top-4
              md:h-[calc(100vh-120px)]
              overflow-y-auto
              scrollbar-thin
            "
          >
            {/* GENEL BİLGİ */}
            <section>
              <div className="text-xs font-semibold text-slate-500 mb-2">GENEL BİLGİ</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs text-slate-500 mb-1">Ad</label>
                  <input
                    value={detail.name}
                    onChange={(e) => { setDetail({ ...detail, name: e.target.value }); setDirtyProduct(true); }}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-slate-500 mb-1">Açıklama</label>
                  <textarea
                    value={detail.description ?? ''}
                    onChange={(e) => { setDetail({ ...detail, description: e.target.value }); setDirtyProduct(true); }}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 min-h-24"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Fiyat</label>
                  <input
                    type="number"
                    value={detail.price ?? detail.basePrice ?? 0}
                    onChange={(e) => {
                      const v = Number(e.target.value) || 0;
                      setDetail({ ...detail, price: v, basePrice: v }); setDirtyProduct(true);
                    }}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Kategori Id</label>
                  <input
                    type="number"
                    value={detail.categoryId ?? 0}
                    onChange={(e) => { setDetail({ ...detail, categoryId: Number(e.target.value) || null }); setDirtyProduct(true); }}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Cinsiyet</label>
                  <select
                    value={detail.gender ?? 0}
                    onChange={(e) => { setDetail({ ...detail, gender: Number(e.target.value) }); setDirtyProduct(true); }}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:outline-none"
                  >
                    <option value={0}>Belirsiz</option>
                    <option value={1}>Erkek</option>
                    <option value={2}>Kadın</option>
                    <option value={3}>Unisex</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 mt-6">
                  <input
                    id="isActive"
                    type="checkbox"
                    checked={detail.isActive}
                    onChange={(e) => { setDetail({ ...detail, isActive: e.target.checked }); setDirtyProduct(true); }}
                  />
                  <label htmlFor="isActive" className="text-sm text-slate-700">Aktif</label>
                </div>
              </div>
            </section>

            {/* GÖRSELLER */}
            <section>
              <div className="text-xs font-semibold text-slate-500 mb-2">GÖRSELLER</div>
              <div className="space-y-2">
                {images.map((img, idx) => (
                  <div key={img.id} className="flex items-center gap-3 border border-slate-200 rounded-xl p-2">
                    <img src={img.imageUrl} alt={img.altText ?? ''} className="h-12 w-12 rounded object-cover" />
                    <div className="flex-1">
                      <div className="text-[13px] text-slate-700 break-all">{img.imageUrl}</div>
                      <div className="text-xs text-slate-500">Sıra: {idx + 1}</div>
                    </div>
                    <button
                      className={'px-2 py-1 rounded border text-xs ' + (img.isMain ? 'bg-emerald-100 border-emerald-300' : 'border-slate-300')}
                      onClick={() => { setImages(l => l.map(x => ({ ...x, isMain: x.id === img.id }))); setImagesDirty(true); }}
                    >
                      {img.isMain ? 'Ana Görsel' : 'Ana yap'}
                    </button>
                    <button className="px-2 py-1 rounded bg-red-600/90 text-white text-xs" onClick={() => deleteImage(img)}>Sil</button>
                  </div>
                ))}
                {images.length === 0 && <div className="text-sm text-slate-500">Bu ürüne ait görsel yok.</div>}
              </div>
            </section>

            {/* VARYANTLAR */}
            <section>
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-semibold text-slate-500">VARYANTLAR</div>
                <button onClick={addVariant} className="px-3 py-1.5 rounded-lg bg-slate-800 text-white text-xs hover:opacity-90">+ Varyant Ekle</button>
              </div>

              <div className="space-y-3">
                {variants.map((v) => (
                  <div key={v.id} className="border border-slate-200 rounded-xl p-3">
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Beden</label>
                        <input
                          value={v.size ?? ''}
                          onChange={(e) => {
                            const next = { ...v, size: e.target.value };
                            setVariants(l => l.map(x => x.id === v.id ? next : x));
                            if (v.id > 0) setDirtyVariants(s => new Set([...Array.from(s), v.id]));
                          }}
                          className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Renk</label>
                        <input
                          value={v.color ?? ''}
                          onChange={(e) => {
                            const next = { ...v, color: e.target.value };
                            setVariants(l => l.map(x => x.id === v.id ? next : x));
                            if (v.id > 0) setDirtyVariants(s => new Set([...Array.from(s), v.id]));
                          }}
                          className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Stok</label>
                        <input
                          type="number"
                          value={v.stock}
                          onChange={(e) => {
                            const next = { ...v, stock: Number(e.target.value) || 0 };
                            setVariants(l => l.map(x => x.id === v.id ? next : x));
                            if (v.id > 0) setDirtyVariants(s => new Set([...Array.from(s), v.id]));
                          }}
                          className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                        />
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="text-xs text-slate-500">{v.id < 0 ? 'Yeni' : `ID: ${v.id}`}</div>
                      <button onClick={() => removeVariant(v)} className="px-3 py-1.5 rounded-lg bg-red-600/90 text-white text-xs">Sil</button>
                    </div>
                  </div>
                ))}
                {variants.length === 0 && <div className="text-sm text-slate-500">Bu ürüne ait varyant bulunamadı.</div>}
              </div>
            </section>

            <div className="pt-2 border-t border-slate-200 pb-2">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm text-slate-600">{saveBusy ? 'İşleniyor…' : saveMsg}</div>
                <button
                  onClick={saveAll}
                  disabled={saveBusy}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-white text-sm hover:opacity-90 disabled:opacity-50"
                >
                  Kaydet
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 mb-8">
          <a href="/merchant/dashboard/urunler" className="text-sm text-slate-700 hover:underline">‹ Ürün listesine dön</a>
        </div>
      </div>
    </div>
  );
}
