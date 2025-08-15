'use client';

import React, { useMemo, useState } from 'react';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

type ApiEnvelope<T> = { data: T; success?: boolean; message?: string };

type ProductCreateDto = {
  name: string;
  description?: string | null;
  price?: number | null;
  basePrice?: number | null;
  gender?: number | null;
  isActive: boolean;
  categoryId?: number | null;
};

type ProductCreated = { id: number };

type Variant = {
  id: number;               // geçici negatif veya gerçek id
  productId: number;        // create sonra set edilecek
  size?: string | null;
  color?: string | null;
  stock: number;
};

type NewImage = {
  file: File;
  previewUrl: string;
  altText?: string | null;
  sortOrder?: number | null;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';
const PRODUCT_CREATE = `/api/Product/create`;
const VARIANT_CREATE = `/api/ProductVariants`;
const IMAGE_UPLOAD = `/api/ProductImage`; // multipart/form-data bekleniyor

function getApi(): AxiosInstance {
  const inst = axios.create({ baseURL: API_BASE });
  inst.interceptors.request.use((cfg) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
    return cfg;
  });
  return inst;
}

// ApiEnvelope<T> | T dönen her isteği güvenli çıkar
function pick<T>(res: AxiosResponse<ApiEnvelope<T> | T>): T {
  const body = res.data as ApiEnvelope<T> | T;
  return (typeof body === 'object' && body !== null && 'data' in (body as Record<string, unknown>))
    ? (body as ApiEnvelope<T>).data
    : (body as T);
}

export default function ProductCreatePage() {
  const router = useRouter();
  const api = useMemo(getApi, []);

  // ---- Form state (boş başlar)
  const [form, setForm] = useState<ProductCreateDto>({
    name: '',
    description: '',
    price: null,
    basePrice: null,
    gender: 0,
    isActive: true,
    categoryId: null,
  });

  const [variants, setVariants] = useState<Variant[]>([]);
  const [newImages, setNewImages] = useState<NewImage[]>([]); // upload bekleyenler (altyapı)

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const setBothPrices = (v: number | null) => setForm((f) => ({ ...f, price: v, basePrice: v }));

  const addVariant = () => {
    const tmpId = Math.floor(Math.random() * -1_000_000_000);
    setVariants((l) => [...l, { id: tmpId, productId: 0, size: '', color: '', stock: 0 }]);
  };

  const removeVariant = (id: number) => {
    setVariants((l) => l.filter((x) => x.id !== id));
  };

  const onSelectFiles: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const files = e.currentTarget.files;
    if (!files) return;
    const list: NewImage[] = [];
    Array.from(files).forEach((file) => {
      const url = URL.createObjectURL(file);
      list.push({ file, previewUrl: url, altText: null, sortOrder: null });
    });
    setNewImages((prev) => [...prev, ...list]);
    // input aynı dosyayı tekrar seçebilsin
    e.currentTarget.value = '';
  };

  const removeNewImage = (idx: number) => {
    setNewImages((prev) => {
      const copy = [...prev];
      const item = copy[idx];
      if (item) URL.revokeObjectURL(item.previewUrl);
      copy.splice(idx, 1);
      return copy;
    });
  };

  const save = async () => {
    setMsg(null);
    if (!form.name?.trim()) { setMsg('Lütfen ürün adını girin.'); return; }
    if (!form.categoryId || form.categoryId <= 0) { setMsg('Geçerli bir kategori Id girin.'); return; }

    setSaving(true);
    try {
      // 1) Ürün oluştur
      const payload: ProductCreateDto = {
        name: form.name.trim(),
        description: form.description?.trim() || null,
        price: form.price ?? form.basePrice ?? null,
        basePrice: form.basePrice ?? form.price ?? null,
        gender: form.gender ?? 0,
        isActive: !!form.isActive,
        categoryId: form.categoryId!,
      };

      const created = pick<ProductCreated>(await api.post(PAGE.PRODUCT_CREATE, payload));
      const productId = created.id;

      // 2) Varyantları oluştur
      for (const v of variants) {
        const dto = { productId, size: v.size || null, color: v.color || null, stock: v.stock || 0 };
        await api.post(VARIANT_CREATE, dto);
      }

      // 3) Görselleri yükle (altyapı hazır; backend tamamlanınca çalışır)
      for (let i = 0; i < newImages.length; i++) {
        const img = newImages[i];
        const fd = new FormData();
        fd.append('productId', String(productId));
        fd.append('image', img.file);
        if (img.altText) fd.append('altText', img.altText);
        if (img.sortOrder != null) fd.append('sortOrder', String(img.sortOrder));
        // Not: 'Content-Type' header’ı axios FormData’da otomatik ayarlanır
        await api.post(IMAGE_UPLOAD, fd);
      }

      router.replace(`/merchant/dashboard/urunler/urundetay/${productId}`);
    } catch (err) {
      setMsg('❌ Kayıt başarısız. Lütfen tekrar deneyin.');
    } finally {
      setSaving(false);
    }
  };

  // constants pack to keep refs typed
  const PAGE = {
    PRODUCT_CREATE,
  } as const;

  return (
    <div className="w-full">
      <div className="max-w-[1400px] pl-6 pr-8">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-2xl font-semibold text-slate-800">Yeni Ürün</h1>
          <a href="/merchant/dashboard/urunler" className="text-sm text-slate-700 hover:underline">‹ Ürün listesine dön</a>
        </div>

        {msg && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{msg}</div>
        )}

        <div className="w-full max-w-[1100px] bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-6 md:sticky md:top-4 md:h-[calc(100vh-120px)] overflow-y-auto scrollbar-thin">
          {/* GENEL BİLGİ */}
          <section>
            <div className="text-xs font-semibold text-slate-500 mb-2">GENEL BİLGİ</div>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs text-slate-500 mb-1">Ad</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Örn: Nike Erkek Tişört"
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs text-slate-500 mb-1">Açıklama</label>
                <textarea
                  value={form.description ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Ürün açıklaması…"
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 min-h-24"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-500 mb-1">Fiyat</label>
                <input
                  type="number"
                  value={form.price ?? form.basePrice ?? 0}
                  onChange={(e) => setBothPrices(Number(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-500 mb-1">Kategori Id</label>
                <input
                  type="number"
                  value={form.categoryId ?? 0}
                  onChange={(e) => setForm((f) => ({ ...f, categoryId: Number(e.target.value) || null }))}
                  placeholder="Örn: 12"
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-500 mb-1">Cinsiyet</label>
                <select
                  value={form.gender ?? 0}
                  onChange={(e) => setForm((f) => ({ ...f, gender: Number(e.target.value) }))}
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
                  checked={form.isActive}
                  onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                />
                <label htmlFor="isActive" className="text-sm text-slate-700">Aktif</label>
              </div>
            </div>
          </section>

          {/* VARYANTLAR */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-semibold text-slate-500">VARYANTLAR</div>
              <button onClick={addVariant} className="px-3 py-1.5 rounded-lg bg-slate-800 text-white text-xs hover:opacity-90">
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
                        onChange={(e) => setVariants((l) => l.map((x) => (x.id === v.id ? { ...x, size: e.target.value } : x)))}
                        placeholder="Örn: S / M / L"
                        className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Renk</label>
                      <input
                        value={v.color ?? ''}
                        onChange={(e) => setVariants((l) => l.map((x) => (x.id === v.id ? { ...x, color: e.target.value } : x)))}
                        placeholder="Örn: Siyah"
                        className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Stok</label>
                      <input
                        type="number"
                        value={v.stock}
                        onChange={(e) => setVariants((l) => l.map((x) => (x.id === v.id ? { ...x, stock: Number(e.target.value) || 0 } : x)))}
                        placeholder="0"
                        className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                      />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-xs text-slate-500">Yeni</div>
                    <button onClick={() => removeVariant(v.id)} className="px-3 py-1.5 rounded-lg bg-red-600/90 text-white text-xs">Sil</button>
                  </div>
                </div>
              ))}
              {variants.length === 0 && <div className="text-sm text-slate-500">Henüz varyant eklenmedi.</div>}
            </div>
          </section>

          {/* GÖRSELLER (Altyapı) */}
          <section>
            <div className="text-xs font-semibold text-slate-500 mb-2">GÖRSELLER</div>
            <div className="flex items-center gap-3">
              <input type="file" accept="image/*" multiple onChange={onSelectFiles} />
              <span className="text-xs text-slate-500">Ürün oluşturulduğunda bu görseller yüklenecek.</span>
            </div>
            {newImages.length > 0 && (
              <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                {newImages.map((img, idx) => (
                  <div key={idx} className="border rounded-xl p-2 flex flex-col gap-2">
                    <div className="relative w-full h-32">
                      <Image src={img.previewUrl} alt="preview" fill className="object-cover rounded" />
                    </div>
                    <input
                      placeholder="Alt metin (opsiyonel)"
                      className="w-full rounded border border-slate-300 bg-slate-50 px-2 py-1 text-xs"
                      onChange={(e) => setNewImages((l) => l.map((x, i) => (i === idx ? { ...x, altText: e.target.value } : x)))}
                    />
                    <input
                      placeholder="Sıra (opsiyonel)"
                      type="number"
                      className="w-full rounded border border-slate-300 bg-slate-50 px-2 py-1 text-xs"
                      onChange={(e) =>
                        setNewImages((l) =>
                          l.map((x, i) => (i === idx ? { ...x, sortOrder: Number(e.target.value) || null } : x)),
                        )
                      }
                    />
                    <button onClick={() => removeNewImage(idx)} className="text-xs rounded bg-red-600/90 text-white py-1">
                      Kaldır
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* KAYDET */}
          <div className="pt-2 border-t border-slate-200 pb-2">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm text-slate-600">{saving ? 'İşleniyor…' : null}</div>
              <button onClick={save} disabled={saving} className="px-4 py-2 rounded-xl bg-slate-800 text-white text-sm hover:opacity-90 disabled:opacity-50">
                Kaydet
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 mb-8">
          <a href="/merchant/dashboard/urunler" className="text-sm text-slate-700 hover:underline">‹ Ürün listesine dön</a>
        </div>
      </div>
    </div>
  );
}
