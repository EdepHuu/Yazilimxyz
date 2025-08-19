'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios, { AxiosInstance } from 'axios';
import { useRouter, useParams } from 'next/navigation';

/* ================== Types ================== */
type ApiResponse<T> = { data: T; success?: boolean; message?: string };

type ProductDetail = {
  id: number;
  name: string;
  description?: string | null;
  basePrice?: number | null;
  price?: number | null;
  gender?: number | null;
  isActive: boolean;
  categoryId?: number | null;
  categoryName?: string | null;
  mainPhoto?: string | null;
};

type Variant = {
  id: number;
  productId: number;
  size?: string | null;
  color?: string | null;
  stock: number;
};

type ProductImageRow = {
  id: number;
  imageUrl?: string | null;
  image?: string | null;
  altText?: string | null;
  sortOrder?: number | null;
  productId: number;
};

type ProductImage = {
  id: number;
  imageUrl: string;
  altText?: string | null;
  sortOrder?: number | null;
  productId: number;
};

type Category = { id: number; name?: string | null };

/* ================== Endpoints ================== */
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';

const PRODUCT_DETAILED = (productId: number) => `/api/Product/${productId}/detailed`;
const PRODUCT_UPDATE = `/api/Product/update`;

const VARIANTS_BY_PRODUCT = (productId: number) => `/api/ProductVariants/by-product/${productId}`;
const VARIANT_UPDATE = (id: number) => `/api/ProductVariants/${id}`;
const VARIANT_DELETE = (id: number) => `/api/ProductVariants/${id}`;
const VARIANT_CREATE = `/api/ProductVariants`;

const IMAGES_BY_PRODUCT = (productId: number) => `/api/ProductImage/product/${productId}`;
const IMAGE_DELETE = (id: number) => `/api/ProductImage/${id}`;
const IMAGE_REORDER = (productId: number) => `/api/ProductImage/reorder/${productId}`;
const IMAGE_CREATE = `/api/ProductImage/create`;

const CATEGORY_LIST = '/api/Category';

/* ================== Helpers ================== */
const isObj = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null;
const unwrap = <T,>(raw: unknown): T => (isObj(raw) && 'data' in raw ? (raw as ApiResponse<T>).data : (raw as T));
const absolutize = (u?: string | null) => (u ? (u.startsWith('http') ? u : `${API_BASE}${u}`) : null);

/** TR girişlerini sayıya çevir (örn. "2.000,95" -> 2000.95) */
function parseTrNumber(s: string): number {
  const cleaned = s.replace(/\s/g, '').replace(/\./g, '').replace(',', '.');
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

/** Görselleri API'den oku ve normalize et */
async function loadImages(api: AxiosInstance, productId: number): Promise<ProductImage[]> {
  const res = await api.get<ApiResponse<ProductImageRow[]> | ProductImageRow[]>(IMAGES_BY_PRODUCT(productId));
  const rows = unwrap<ProductImageRow[]>(res.data);
  return rows.map((r) => ({
    id: r.id,
    imageUrl: absolutize(r.imageUrl ?? r.image) ?? '',
    altText: r.altText ?? null,
    sortOrder: r.sortOrder ?? null,
    productId: r.productId,
  }));
}

/* ================== Page ================== */
export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const idParam = Array.isArray(params?.id) ? params.id[0] : (params?.id as string | undefined);
  const productId = Number(idParam);

  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<ProductDetail | null>(null);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [imagesBusy, setImagesBusy] = useState(false);

  // TR biçimli fiyat alanı için
  const [priceInput, setPriceInput] = useState<string>('');

  // Save durumları
  const [saveBusy, setSaveBusy] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  // Dirty flags
  const [dirtyProduct, setDirtyProduct] = useState(false);
  const [dirtyVariants, setDirtyVariants] = useState<Set<number>>(new Set());
  const [newVariants, setNewVariants] = useState<Variant[]>([]);
  const [deletedVariantIds, setDeletedVariantIds] = useState<number[]>([]);
  const [imagesDirty, setImagesDirty] = useState(false);

  // validation
  const [errors, setErrors] = useState<{ name?: string; basePrice?: string; categoryId?: string }>({});

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

  const getData = useCallback(
    async <T,>(path: string) => {
      const res = await api.get<ApiResponse<T> | T>(path);
      return unwrap<T>(res.data);
    },
    [api]
  );

  useEffect(() => {
    if (!Number.isFinite(productId) || productId <= 0) {
      router.replace('/merchant/dashboard/urunler');
      return;
    }
    let alive = true;

    (async () => {
      try {
        setMsg(null);

        const cats = await getData<Category[]>(CATEGORY_LIST);
        const det = await getData<ProductDetail>(PRODUCT_DETAILED(productId));
        const vs = await getData<Variant[]>(VARIANTS_BY_PRODUCT(productId));
        const imgs = await loadImages(api, productId);

        // kategori id yoksa isimden bul
        let catId: number | null =
          typeof det.categoryId === 'number' && det.categoryId > 0 ? det.categoryId : null;
        if (!catId && det.categoryName) {
          const found = cats.find(
            (c) => (c.name ?? '').trim().toLowerCase() === det.categoryName!.trim().toLowerCase()
          );
          if (found) catId = found.id;
        }

        if (!alive) return;
        setCategories(cats);

        const priceInit = Number(det.basePrice ?? det.price ?? 0);
        setPriceInput(priceInit.toLocaleString('tr-TR', { useGrouping: false }));

        setDetail({
          id: det.id,
          name: det.name,
          description: det.description ?? null,
          basePrice: priceInit,
          price: priceInit,
          gender: det.gender ?? 0,
          isActive: !!det.isActive,
          categoryId: catId ?? 0,
          categoryName: det.categoryName ?? null,
          mainPhoto: det.mainPhoto ?? null,
        });
        setVariants(vs);
        setImages(imgs);
      } catch {
        setMsg('Detaylar getirilemedi.');
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [api, getData, productId, router]);

  /* ------ Validation ------ */
  const validate = (): boolean => {
    if (!detail) return false;
    const next: typeof errors = {};
    if (!detail.name || !detail.name.trim()) next.name = 'İsim zorunludur.';
    const priceVal = parseTrNumber(priceInput);
    if (!Number.isFinite(priceVal) || priceVal < 0) next.basePrice = 'Fiyat 0 veya daha büyük olmalıdır.';
    const catId = Number(detail.categoryId ?? 0);
    if (!Number.isFinite(catId) || catId <= 0) next.categoryId = 'Kategori seçiniz.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  /* ------ Save ------ */
  const saveAll = async () => {
    if (!detail) return;
    const hasChanges =
      dirtyProduct || imagesDirty || dirtyVariants.size > 0 || newVariants.length > 0 || deletedVariantIds.length > 0;
    if (!hasChanges) {
      setSaveMsg('Kaydedilecek değişiklik yok.');
      return;
    }
    if (!validate()) {
      setSaveMsg('Lütfen formdaki hataları düzeltin.');
      return;
    }
    if (!window.confirm('Kaydetmek istediğinize emin misiniz?')) return;

    setSaveBusy(true);
    setSaveMsg(null);
    try {
      if (dirtyProduct) {
        const payload = {
          id: detail.id,
          name: detail.name.trim(),
          description: (detail.description ?? '').trim(),
          basePrice: parseTrNumber(priceInput),
          gender: Number(detail.gender ?? 0),
          isActive: Boolean(detail.isActive),
          categoryId: Number(detail.categoryId ?? 0),
        };
        await api.put(PRODUCT_UPDATE, payload);
      }

      for (const id of deletedVariantIds) await api.delete(VARIANT_DELETE(id));
      for (const id of Array.from(dirtyVariants)) {
        const v = variants.find((x) => x.id === id);
        if (v) await api.put(VARIANT_UPDATE(id), v);
      }
      for (const nv of newVariants) await api.post(VARIANT_CREATE, nv);

      if (imagesDirty && images.length) {
        const ordered = images.map((i, idx) => ({ id: i.id, sortOrder: idx + 1 }));
        await api.put(IMAGE_REORDER(detail.id), ordered);
      }

      setDirtyProduct(false);
      setDirtyVariants(new Set());
      setNewVariants([]);
      setDeletedVariantIds([]);
      setImagesDirty(false);
      setSaveMsg('✅ Değişiklikler kaydedildi.');
    } catch (err) {
      const m =
        axios.isAxiosError(err)
          ? ((err.response?.data as { message?: string } | undefined)?.message ?? '❌ Kaydetme hatası.')
          : '❌ Kaydetme hatası.';
      setSaveMsg(m);
    } finally {
      setSaveBusy(false);
    }
  };

  /* ------ Variants ------ */
  const addVariant = () => {
    if (!detail) return;
    const tmpId = Math.floor(Math.random() * -1_000_000_000);
    const tmp: Variant = { id: tmpId, productId: detail.id, size: 'M', color: 'Siyah', stock: 0 };
    setNewVariants((l) => [...l, tmp]);
    setVariants((l) => [...l, tmp]);
  };
  const removeVariant = (v: Variant) => {
    if (v.id < 0) {
      setNewVariants((l) => l.filter((x) => x.id !== v.id));
      setVariants((l) => l.filter((x) => x.id !== v.id));
    } else {
      setDeletedVariantIds((l) => [...l, v.id]);
      setVariants((l) => l.filter((x) => x.id !== v.id));
    }
  };

  /* ------ Images ------ */
  const deleteImage = async (img: ProductImage) => {
    if (!window.confirm('Görseli silmek istediğinize emin misiniz?')) return;
    try {
      await api.delete(IMAGE_DELETE(img.id));
      setImagesDirty(true);
      setImages((l) => l.filter((x) => x.id !== img.id));
    } catch {
      alert('Görsel silinemedi.');
    }
  };

  const moveImage = (idx: number, dir: -1 | 1) => {
    setImagesDirty(true);
    setImages((list) => {
      const arr = [...list];
      const j = idx + dir;
      if (j < 0 || j >= arr.length) return list;
      const tmp = arr[idx];
      arr[idx] = arr[j];
      arr[j] = tmp;
      return arr;
    });
  };

  const onPickImages = async (files: FileList | null) => {
    if (!detail || !files || files.length === 0) return;
    setImagesBusy(true);
    const token = localStorage.getItem('token') ?? '';

    // çoklu upload – sırayla
    for (const file of Array.from(files)) {
      const tryOnce = async (field: 'image' | 'imageFile') => {
        const fd = new FormData();
        fd.append('productId', String(detail.id));
        fd.append(field, file);
        fd.append('altText', file.name);
        await axios.post(`${API_BASE}${IMAGE_CREATE}`, fd, {
          headers: { Authorization: `Bearer ${token}` },
        });
      };

      try {
        await tryOnce('image');
      } catch {
        try {
          await tryOnce('imageFile');
        } catch {
          console.warn(`Upload başarısız: ${file.name}`);
        }
      }
    }

    // upload bitti, listeyi refetch et (id ve sortOrder kesinleşir)
    try {
      const fresh = await loadImages(api, detail.id);
      setImages(fresh);
      setImagesDirty(true);
    } finally {
      setImagesBusy(false);
    }
  };

  if (loading) return <div className="text-slate-600 text-sm px-4">Yükleniyor…</div>;

  return (
    <div className="w-full">
      <div className="max-w-[1480px] pl-6 pr-8">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-2xl font-semibold text-slate-800">Ürün Detay</h1>
          {/* SAĞ ÜSTTE TEK BUTON */}
          <button
            onClick={() => router.push('/merchant/dashboard/urunler')}
            className="rounded-xl px-3 py-2 text-sm border border-slate-300 hover:bg-slate-50"
          >
            ‹ Ürün listesine dön
          </button>
        </div>

        {msg && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{msg}</div>
        )}

        {detail && (
          <div
            className="
              w-full max-w-[1200px]
              bg-white rounded-2xl shadow-sm border border-slate-200
              p-5 space-y-6
              md:sticky md:top-4
              md:h-[calc(100vh-120px)]
              overflow-y-auto
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
                    onChange={(e) => {
                      setDetail({ ...detail, name: e.target.value });
                      setDirtyProduct(true);
                    }}
                    onBlur={validate}
                    className={
                      'w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ' +
                      (errors.name
                        ? 'border-red-300 bg-red-50 focus:ring-red-300'
                        : 'border-slate-300 bg-slate-50 focus:ring-slate-400')
                    }
                  />
                  {errors.name && <div className="text-xs text-red-600 mt-1">{errors.name}</div>}
                </div>

                <div className="col-span-2">
                  <label className="block text-xs text-slate-500 mb-1">Açıklama</label>
                  <textarea
                    value={detail.description ?? ''}
                    onChange={(e) => {
                      setDetail({ ...detail, description: e.target.value });
                      setDirtyProduct(true);
                    }}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 min-h-24"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-500 mb-1">Fiyat</label>
                  <input
                    inputMode="decimal"
                    value={priceInput}
                    onChange={(e) => {
                      const v = e.target.value;
                      setPriceInput(v);
                      const num = parseTrNumber(v);
                      setDetail({ ...detail, basePrice: num, price: num });
                      setDirtyProduct(true);
                    }}
                    onBlur={validate}
                    className={
                      'w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ' +
                      (errors.basePrice
                        ? 'border-red-300 bg-red-50 focus:ring-red-300'
                        : 'border-slate-300 bg-slate-50 focus:ring-slate-400')
                    }
                  />
                  {errors.basePrice && <div className="text-xs text-red-600 mt-1">{errors.basePrice}</div>}
                </div>

                {/* Kategori */}
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Kategori</label>
                  <select
                    value={detail.categoryId ?? 0}
                    onChange={(e) => {
                      const val = Number(e.target.value) || 0;
                      const catId = val > 0 ? val : 0;
                      const catName = categories.find((c) => c.id === catId)?.name ?? null;
                      setDetail({ ...detail, categoryId: catId, categoryName: catName });
                      setDirtyProduct(true);
                    }}
                    onBlur={validate}
                    className={
                      'w-full rounded-lg border px-3 py-2 text-sm focus:outline-none ' +
                      (errors.categoryId
                        ? 'border-red-300 bg-red-50 focus:ring-red-300'
                        : 'border-slate-300 bg-slate-50 focus:ring-slate-400')
                    }
                  >
                    <option value={0}>Kategori seçin</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name ?? `Kategori #${c.id}`}
                      </option>
                    ))}
                  </select>
                  {errors.categoryId && <div className="text-xs text-red-600 mt-1">{errors.categoryId}</div>}
                </div>

                <div>
                  <label className="block text-xs text-slate-500 mb-1">Cinsiyet</label>
                  <select
                    value={detail.gender ?? 0}
                    onChange={(e) => {
                      setDetail({ ...detail, gender: Number(e.target.value) });
                      setDirtyProduct(true);
                    }}
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
                    onChange={(e) => {
                      setDetail({ ...detail, isActive: e.target.checked });
                      setDirtyProduct(true);
                    }}
                  />
                  <label htmlFor="isActive" className="text-sm text-slate-700">
                    Aktif
                  </label>
                </div>
              </div>
            </section>

            {/* GÖRSELLER – oklar + sil + upload */}
            <section>
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-semibold text-slate-500">
                  GÖRSELLER {imagesBusy && <span className="ml-2 text-[11px] text-slate-400">(yükleniyor…)</span>}
                </div>

                {/* YÜKLE */}
                <label className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-1.5 text-xs cursor-pointer hover:bg-slate-50">
                  Görsel Ekle
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => onPickImages(e.target.files)}
                  />
                </label>
              </div>

              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {images.map((img, idx) => (
                  <li
                    key={img.id ?? `tmp-${idx}-${img.imageUrl}`}
                    className="relative rounded-xl border border-slate-200 overflow-hidden"
                  >
                    <div className="aspect-[4/3] bg-slate-100">
                      <img src={img.imageUrl} alt={img.altText ?? ''} className="h-full w-full object-cover" />
                    </div>

                    <div className="absolute top-2 right-2">
                      <button
                        onClick={() => deleteImage(img)}
                        className="px-2 py-1 rounded bg-red-600/90 text-white text-xs"
                        title="Sil"
                      >
                        Sil
                      </button>
                    </div>

                    <div className="flex items-center justify-end gap-2 p-2">
                      <button
                        onClick={() => moveImage(idx, -1)}
                        className="px-2 py-1 rounded text-xs border border-slate-300"
                        title="Yukarı"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveImage(idx, 1)}
                        className="px-2 py-1 rounded text-xs border border-slate-300"
                        title="Aşağı"
                      >
                        ↓
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              {images.length === 0 && <div className="text-sm text-slate-500">Bu ürüne ait görsel yok.</div>}
            </section>

            {/* VARYANTLAR */}
            <section>
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-semibold text-slate-500">VARYANTLAR</div>
                <button
                  onClick={addVariant}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-white text-xs hover:opacity-90"
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
                          onChange={(e) => {
                            const next = { ...v, size: e.target.value };
                            setVariants((l) => l.map((x) => (x.id === v.id ? next : x)));
                            if (v.id > 0) setDirtyVariants((s) => new Set([...Array.from(s), v.id]));
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
                            setVariants((l) => l.map((x) => (x.id === v.id ? next : x)));
                            if (v.id > 0) setDirtyVariants((s) => new Set([...Array.from(s), v.id]));
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
                            setVariants((l) => l.map((x) => (x.id === v.id ? next : x)));
                            if (v.id > 0) setDirtyVariants((s) => new Set([...Array.from(s), v.id]));
                          }}
                          className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                        />
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-end">
                      <button
                        onClick={() => removeVariant(v)}
                        className="px-3 py-1.5 rounded-lg bg-red-600/90 text-white text-xs"
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
      </div>
    </div>
  );
}
