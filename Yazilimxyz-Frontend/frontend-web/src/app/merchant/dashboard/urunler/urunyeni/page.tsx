'use client';

import React, { useEffect, useMemo, useState } from 'react';
import axios, { AxiosError, AxiosInstance } from 'axios';
import { useRouter } from 'next/navigation';

/* ---------- Tipler ---------- */

type ApiEnvelope<T> = { data: T; success?: boolean; message?: string };

type Category = { id: number; name?: string | null };
type MerchantSelf = { id: number };

type ProductCreateDto = {
  name: string;
  description?: string | null;
  price: number;
  basePrice: number;
  gender: number;
  isActive: boolean;
  categoryId: number;
  merchantId?: number;
  productCode: string;
  fabricInfo: string;
  modelMeasurements: string;
};

type Variant = {
  id: number;        // geçici UI id (negatif)
  productId: number; // create sonrası atanır
  size?: string | null;
  color?: string | null;
  stock: number;
};

type NewImage = { file: File; previewUrl: string; altText?: string | null };

type ProductListItem = {
  id: number;
  name: string;
  merchantId?: number;
  createdAt?: string;
};

type CreatedImage = number | { id: number } | { imageId: number };

/* ---------- Sabitler ---------- */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';
const CATEGORY_LIST = '/api/Category';
const MERCHANT_PROFILE = '/api/Merchant/profile';
const PRODUCT_CREATE = '/api/Product/create';
const PRODUCT_GET_ALL = '/api/Product/get-all';

const IMAGE_CREATE = '/api/ProductImage/create';
const IMAGE_SET_MAIN = (imageId: number) => `/api/ProductImage/set-main/${imageId}`;

/* ---------- Yardımcılar (any yok) ---------- */

const isRecord = (x: unknown): x is Record<string, unknown> =>
  typeof x === 'object' && x !== null;

const unwrap = <T,>(raw: unknown): T =>
  isRecord(raw) && 'data' in raw ? (raw as { data: T }).data : (raw as T);

const pickNum = (obj: unknown, key: string): number | null =>
  isRecord(obj) && typeof obj[key] === 'number' ? (obj[key] as number) : null;

const tryParseCreatedId = (raw: unknown): number => {
  const data = unwrap<unknown>(raw);
  if (typeof data === 'number') return data;
  const id = pickNum(data, 'id') ?? pickNum(data, 'productId') ?? pickNum(raw, 'id');
  return id ?? 0;
};

const idFromLocation = (loc?: string): number => {
  if (!loc) return 0;
  const m = loc.match(/(\d+)(?!.*\d)/);
  return m ? Number(m[1]) : 0;
};

const resolveProductIdFallback = async (
  api: AxiosInstance,
  name: string,
  merchantId?: number | null
): Promise<number> => {
  try {
    const res = await api.get<ApiEnvelope<ProductListItem[]> | ProductListItem[]>(PRODUCT_GET_ALL);
    const list = unwrap<ProductListItem[]>(res.data);

    const byNameAndMerchant = list.filter(
      (p) => p.name === name && (merchantId ? p.merchantId === merchantId : true)
    );
    const byMerchantOnly = merchantId ? list.filter((p) => p.merchantId === merchantId) : [];

    const pickMax = (arr: ProductListItem[]): number =>
      arr.reduce((mx, it) => (it.id > mx ? it.id : mx), 0);

    return (
      pickMax(byNameAndMerchant) ||
      pickMax(byMerchantOnly) ||
      pickMax(list)
    );
  } catch {
    return 0;
  }
};

const parseTr = (s: string) => {
  const cleaned = s.replace(/\s/g, '').replace(/\./g, '').replace(',', '.');
  const n = Number(cleaned);
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : 0;
};

const explainAxiosError = (err: unknown): string => {
  if (!axios.isAxiosError(err)) return '❌ Kayıt başarısız.';
  const resp: unknown = (err as AxiosError).response?.data;
  if (typeof resp === 'string') return resp;
  if (isRecord(resp)) {
    const msg = typeof resp['message'] === 'string' ? (resp['message'] as string) : null;
    if (msg) return msg;
    const errors = resp['errors'];
    if (isRecord(errors)) {
      const parts: string[] = [];
      Object.entries(errors).forEach(([k, v]) => {
        if (Array.isArray(v)) v.forEach((s) => typeof s === 'string' && parts.push(`${k}: ${s}`));
        else if (typeof v === 'string') parts.push(`${k}: ${v}`);
      });
      if (parts.length) return parts.join(' • ');
    }
  }
  return '❌ Kayıt başarısız.';
};

function getApi(): AxiosInstance {
  const inst = axios.create({ baseURL: API_BASE });
  inst.interceptors.request.use((cfg) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
    return cfg;
  });
  return inst;
}

/* ---------- Adım Günlüğü ---------- */

type StepLog = {
  step: 'create' | 'variants' | 'images' | 'setMain';
  ok: boolean;
  status?: number;
  note?: string;
};

const addLog = (setter: React.Dispatch<React.SetStateAction<StepLog[]>>, log: StepLog) =>
  setter((l) => [...l, log]);

/* ---------- Tek varyant POST (çift endpoint + PascalCase fallback) ---------- */

// Tek varyant POST (birden fazla endpoint + birden fazla payload şekli)
async function postVariantFlexible(
  api: AxiosInstance,
  base: { productId: number; size: string | null; color: string | null; stock: number }
): Promise<void> {
  // Denenecek endpoint’ler
  const endpoints = [
    '/api/ProductVariants',
    '/api/ProductVariants/create',
    '/api/ProductVariant',
    '/api/ProductVariant/create',
  ];

  // Denenecek payload kombinasyonları (bazı backend’ler quantity/Quantity bekleyebiliyor)
  const payloads: Array<Record<string, unknown>> = [
    // camelCase
    { productId: base.productId, size: base.size, color: base.color, stock: base.stock },
    { productId: base.productId, size: base.size, color: base.color, quantity: base.stock },

    // PascalCase
    { ProductId: base.productId, Size: base.size, Color: base.color, Stock: base.stock },
    { ProductId: base.productId, Size: base.size, Color: base.color, Quantity: base.stock },
  ];

  let lastErr: unknown = null;

  for (const ep of endpoints) {
    for (const body of payloads) {
      try {
        await api.post(ep, body);
        return; // başarı
      } catch (e) {
        lastErr = e;
        // 404/405 ise bir sonraki endpoint/payload’ı dene, diğer hatalarda da devam et
        continue;
      }
    }
  }
  // Buraya geldiyse hepsi başarısız
  if (axios.isAxiosError(lastErr)) {
    const msg =
      (lastErr.response?.data as { message?: string } | undefined)?.message ||
      `(${lastErr.response?.status})`;
    throw new Error(`Varyant oluşturulamadı ${msg}`);
  }
  throw new Error('Varyant oluşturulamadı.');
}


/* ---------- Sayfa ---------- */

export default function ProductCreatePage() {
  const router = useRouter();
  const api = useMemo(getApi, []);

  // sözlükler
  const [categories, setCategories] = useState<Category[]>([]);
  const [merchantId, setMerchantId] = useState<number | null>(null);

  // form
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priceInput, setPriceInput] = useState('');
  const [gender, setGender] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [categoryId, setCategoryId] = useState(0);

  // varyant & görseller
  const [variants, setVariants] = useState<Variant[]>([]);
  const [images, setImages] = useState<NewImage[]>([]);

  // ui
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [logs, setLogs] = useState<StepLog[]>([]);
  const [createdId, setCreatedId] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [catsRes, meRes] = await Promise.all([
          api.get<ApiEnvelope<Category[]> | Category[]>(CATEGORY_LIST),
          api.get<ApiEnvelope<MerchantSelf> | MerchantSelf>(MERCHANT_PROFILE),
        ]);
        if (!alive) return;
        setCategories(unwrap<Category[]>(catsRes.data));
        setMerchantId(unwrap<MerchantSelf>(meRes.data).id);
      } catch {/* form açılsın */}
    })();
    return () => {
      alive = false;
      images.forEach((i) => URL.revokeObjectURL(i.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api]);

  const onPickImages: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const files = e.currentTarget.files;
    if (!files) return;
    const list: NewImage[] = [];
    Array.from(files).forEach((file) =>
      list.push({ file, previewUrl: URL.createObjectURL(file), altText: '' })
    );
    setImages((prev) => [...prev, ...list]);
    e.currentTarget.value = '';
  };

  const addVariant = () => {
    const tmpId = -1 * (1 + Math.floor(Math.random() * 1_000_000_000));
    setVariants((l) => [...l, { id: tmpId, productId: 0, size: '', color: '', stock: 0 }]);
  };
  const removeVariant = (id: number) =>
    setVariants((l) => l.filter((x) => x.id !== id));

  const save = async () => {
    setMsg(null);
    setLogs([]);
    setCreatedId(null);

    const price = parseTr(priceInput || '0');
    if (!name.trim()) return setMsg('Ürün adı zorunludur.');
    if (!categoryId) return setMsg('Kategori seçiniz.');
    if (price <= 0) return setMsg('Fiyat 0’dan büyük olmalıdır.');

    setSaving(true);
    try {
      /* 1) CREATE */
      const payload: ProductCreateDto = {
        name: name.trim(),
        description: (description ?? '').trim(),
        price,
        basePrice: price,
        gender,
        isActive,
        categoryId,
        ...(merchantId ? { merchantId } : {}),
        productCode: 'SKU-AUTO',
        fabricInfo: '100% Pamuk',
        modelMeasurements: 'Boy 180, Göğüs 96, Bel 78',
      };

      const createdRes = await api.post(PRODUCT_CREATE, payload);
      let newId = tryParseCreatedId(createdRes.data);
      if (!(newId > 0)) {
        const loc = (createdRes.headers['location'] as string | undefined) ??
                    (createdRes.headers['Location'] as string | undefined);
        newId = idFromLocation(loc);
      }
      if (!(newId > 0)) {
        newId = await resolveProductIdFallback(api, payload.name, merchantId);
      }

      if (!(newId > 0)) {
        addLog(setLogs, {
          step: 'create',
          ok: false,
          status: createdRes.status,
          note: 'Create başarılı görünse de geçerli ürün ID’si elde edilemedi.',
        });
        setMsg('Sunucu geçersiz ürün ID döndürdü.');
        setSaving(false);
        return;
      }

      setCreatedId(newId);
      addLog(setLogs, { step: 'create', ok: true, status: createdRes.status, note: `id=${newId}` });

      /* 2) VARİYANTLAR (sağlamlaştırılmış) */
      try {
        let sent = 0;
        for (const v of variants) {
          const dto = {
            productId: newId,
            size: v.size?.trim() ? v.size.trim() : null,
            color: v.color?.trim() ? v.color.trim() : null,
            stock: Number.isFinite(v.stock) ? Math.max(0, Math.floor(v.stock)) : 0,
          };
          if (!dto.size && !dto.color && dto.stock === 0) continue;
          await postVariantFlexible(api, dto);
          sent++;
        }
        addLog(setLogs, { step: 'variants', ok: true, note: sent ? `${sent} varyant oluşturuldu` : 'varyant yok' });
      } catch (e) {
        addLog(setLogs, { step: 'variants', ok: false, note: (e as Error).message });
      }


      /* 3) GÖRSELLER + ANA GÖRSEL (aynen korundu) */
      let firstImageId: number | null = null;
      const token = localStorage.getItem('token') ?? '';

      if (images.length) {
        for (let i = 0; i < images.length; i++) {
          const img = images[i];
          const fd = new FormData();
          fd.append('productId', String(newId));
          fd.append('ProductId', String(newId));
          fd.append('image', img.file);
          fd.append('Image', img.file);
          if (img.altText && img.altText.trim()) {
            fd.append('altText', img.altText.trim());
            fd.append('AltText', img.altText.trim());
          }
          fd.append('sortOrder', String(i + 1));
          fd.append('SortOrder', String(i + 1));

          const up = await axios.post<ApiEnvelope<CreatedImage> | CreatedImage>(
            `${API_BASE}${IMAGE_CREATE}`, fd, { headers: { Authorization: `Bearer ${token}` } }
          );

          const imgData = unwrap<CreatedImage>(up.data);
          let imageId = 0;
          if (typeof imgData === 'number') imageId = imgData;
          else imageId = pickNum(imgData, 'id') ?? pickNum(imgData, 'imageId') ?? 0;

          if (!firstImageId && imageId > 0) firstImageId = imageId;
        }
        addLog(setLogs, { step: 'images', ok: true, note: `${images.length} görsel` });
      } else {
        addLog(setLogs, { step: 'images', ok: true, note: 'görsel yok' });
      }

      if (firstImageId && firstImageId > 0) {
        const r = await api.put(IMAGE_SET_MAIN(firstImageId), {});
        addLog(setLogs, { step: 'setMain', ok: r.status < 400, status: r.status });
      }

      setMsg(`✅ Ürün eklendi (ID: ${newId}).`);
      router.replace(`/merchant/dashboard/urunler`);
    } catch (err: unknown) {
      setMsg(explainAxiosError(err));
      if (axios.isAxiosError(err)) {
        addLog(setLogs, {
          step: 'create',
          ok: false,
          status: err.response?.status,
          note: typeof err.response?.data === 'string'
            ? err.response?.data
            : 'Create çağrısı hata verdi',
        });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full">
      <div className="max-w-[1480px] pl-6 pr-8">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-2xl font-semibold text-slate-800">Yeni Ürün</h1>
          <button
            onClick={() => router.push('/merchant/dashboard/urunler')}
            className="rounded-xl px-3 py-2 text-sm border border-slate-300 hover:bg-slate-50"
          >
            ‹ Ürün listesine dön
          </button>
        </div>

        {msg && (
          <div className={`mb-4 text-sm rounded-lg px-3 py-2 border ${msg.startsWith('✅') ? 'text-green-700 bg-green-50 border-green-200' : 'text-red-600 bg-red-50 border-red-200'}`}>
            {msg}
            {createdId ? <span className="ml-2 text-slate-500">(id: {createdId})</span> : null}
          </div>
        )}

        {/* Debug panel */}
        {logs.length > 0 && (
          <div className="mb-4 text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
            <div className="font-semibold text-slate-600 mb-1">İşlem Günlüğü</div>
            <ul className="space-y-1">
              {logs.map((l, i) => (
                <li key={i} className="flex items-center justify-between">
                  <span className="mr-2">{i + 1}. {l.step}</span>
                  <span className={l.ok ? 'text-green-700' : 'text-red-700'}>
                    {l.ok ? 'OK' : 'HATA'}{l.status ? ` (HTTP ${l.status})` : ''}{l.note ? ` – ${l.note}` : ''}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="w-full max-w-[1200px] bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-6 md:sticky md:top-4 md:h-[calc(100vh-120px)] overflow-y-auto">
          {/* GENEL BİLGİ */}
          <section>
            <div className="text-xs font-semibold text-slate-500 mb-2">GENEL BİLGİ</div>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs text-slate-500 mb-1">Ad</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-slate-500 mb-1">Açıklama</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 min-h-24"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Fiyat</label>
                <input
                  inputMode="decimal"
                  value={priceInput}
                  onChange={(e) => setPriceInput(e.target.value)}
                  placeholder="ör. 499,90"
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Kategori</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(Number(e.target.value) || 0)}
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:outline-none"
                >
                  <option value={0}>Kategori seçin</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name ?? `Kategori #${c.id}`}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Cinsiyet</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(Number(e.target.value))}
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
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
                <label htmlFor="isActive" className="text-sm text-slate-700">Aktif</label>
              </div>
            </div>
          </section>

          {/* GÖRSELLER */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-semibold text-slate-500">GÖRSELLER</div>
              <label className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-1.5 text-xs cursor-pointer hover:bg-slate-50">
                Görsel Ekle
                <input type="file" multiple accept="image/*" className="hidden" onChange={onPickImages}/>
              </label>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.map((img, idx) => (
                <li key={`local-${idx}-${img.previewUrl}`} className="relative rounded-xl border border-slate-200 overflow-hidden">
                  <div className="aspect-[4/3] bg-slate-100">
                    <img src={img.previewUrl} alt={img.altText ?? ''} className="h-full w-full object-cover" />
                  </div>
                  <div className="p-2">
                    <input
                      value={img.altText ?? ''}
                      onChange={(e) =>
                        setImages((l) =>
                          l.map((x, i) => (i === idx ? { ...x, altText: e.target.value } : x))
                        )
                      }
                      placeholder="Alt metin (opsiyonel)"
                      className="w-full rounded border border-slate-300 bg-slate-50 px-2 py-1 text-xs"
                    />
                  </div>
                </li>
              ))}
            </ul>
            {images.length === 0 && (
              <div className="text-sm text-slate-500">Henüz görsel eklenmedi. Sağ üstten görsel seçebilirsiniz.</div>
            )}
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
                    <input
                      value={v.size ?? ''}
                      onChange={(e) =>
                        setVariants((l) => l.map((x) => (x.id === v.id ? { ...x, size: e.target.value } : x)))
                      }
                      placeholder="Beden"
                      className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                    />
                    <input
                      value={v.color ?? ''}
                      onChange={(e) =>
                        setVariants((l) => l.map((x) => (x.id === v.id ? { ...x, color: e.target.value } : x)))
                      }
                      placeholder="Renk"
                      className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                    />
                    <input
                      type="number"
                      value={v.stock}
                      onChange={(e) =>
                        setVariants((l) =>
                          l.map((x) =>
                            x.id === v.id
                              ? {
                                  ...x,
                                  stock: Number.isFinite(Number(e.target.value))
                                    ? Math.max(0, Math.floor(Number(e.target.value)))
                                    : 0,
                                }
                              : x
                          )
                        )
                      }
                      placeholder="Stok"
                      className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-end">
                    <button onClick={() => removeVariant(v.id)} className="px-3 py-1.5 rounded-lg bg-red-600/90 text-white text-xs">Sil</button>
                  </div>
                </div>
              ))}
              {variants.length === 0 && <div className="text-sm text-slate-500">Henüz varyant eklenmedi.</div>}
            </div>
          </section>

          {/* KAYDET */}
          <div className="pt-2 border-t border-slate-200 pb-2">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm text-slate-600">{saving ? 'İşleniyor…' : null}</div>
              <button
                onClick={save}
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-slate-800 text-white text-sm hover:opacity-90 disabled:opacity-50"
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
