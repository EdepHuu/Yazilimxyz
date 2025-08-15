'use client';

import React, { useState, useMemo } from 'react';
import axios, { AxiosResponse } from 'axios';
import { useRouter } from 'next/navigation';

type ApiResponse<T> = { data: T; success?: boolean; message?: string };

type CreateProductPayload = {
  name: string;
  description?: string | null;
  price?: number | null;
  basePrice?: number | null;
  gender?: number | null;
  isActive: boolean;
  categoryId?: number | null;
};
type CreatedProductDto = { id: number } & CreateProductPayload;

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';
const PRODUCT_CREATE = `/api/Product/create`;
const PRODUCT_IMAGE_CREATE = `/api/ProductImage/create`;

const isObj = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null;
const unwrap = <T,>(raw: unknown): T =>
  isObj(raw) && 'data' in raw ? (raw as ApiResponse<T>).data : (raw as T);

export default function ProductCreatePage() {
  const router = useRouter();

  const [form, setForm] = useState<CreateProductPayload>({
    name: '',
    description: '',
    price: 0,
    basePrice: 0,
    gender: 0,
    isActive: true,
    categoryId: undefined,
  });
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const api = useMemo(() => {
    const inst = axios.create({ baseURL: API_BASE });
    inst.interceptors.request.use((cfg) => {
      const token =
        typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (token) cfg.headers.Authorization = `Bearer ${token}`;
      return cfg;
    });
    return inst;
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    if (!form.name.trim()) {
      setMsg('Lütfen ürün adını girin.');
      return;
    }

    setBusy(true);
    try {
      const res: AxiosResponse<ApiResponse<CreatedProductDto> | CreatedProductDto> =
        await api.post(PRODUCT_CREATE, {
          ...form,
          price: form.price ?? form.basePrice ?? 0,
          basePrice: form.basePrice ?? form.price ?? 0,
        });
      const created = unwrap<CreatedProductDto>(res.data);

      if (file) {
        const fd = new FormData();
        fd.append('productId', String(created.id));
        fd.append('file', file); // backend anahtarları farklıysa değiştir
        fd.append('altText', form.name);
        await api.post(PRODUCT_IMAGE_CREATE, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      router.replace(`/merchant/dashboard/urunler/urundetay/${created.id}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const code = error.response?.status;
        const message = (error.response?.data as { message?: string } | undefined)
          ?.message;
        setMsg(message || `Kayıt hatası: ${code ?? ''}`);
      } else setMsg('Kayıt hatası.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-semibold text-slate-800">Yeni Ürün</h1>
        <a
          href="/merchant/dashboard/urunler"
          className="text-sm text-slate-700 hover:underline"
        >
          ‹ Ürün listesine dön
        </a>
      </div>

      {msg && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {msg}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-4"
      >
        <div>
          <label className="block text-xs text-slate-500 mb-1">Ad</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>

        <div>
          <label className="block text-xs text-slate-500 mb-1">Açıklama</label>
          <textarea
            value={form.description ?? ''}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
            className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-slate-500 mb-1">Fiyat</label>
            <input
              type="number"
              value={form.price ?? 0}
              onChange={(e) =>
                setForm({
                  ...form,
                  price: Number(e.target.value) || 0,
                  basePrice: Number(e.target.value) || 0,
                })
              }
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">
              Kategori Id
            </label>
            <input
              type="number"
              value={form.categoryId ?? 0}
              onChange={(e) =>
                setForm({
                  ...form,
                  categoryId: Number(e.target.value) || undefined,
                })
              }
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Cinsiyet</label>
            <select
              value={form.gender ?? 0}
              onChange={(e) =>
                setForm({ ...form, gender: Number(e.target.value) })
              }
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:outline-none"
            >
              <option value={0}>Belirsiz</option>
              <option value={1}>Erkek</option>
              <option value={2}>Kadın</option>
              <option value={3}>Unisex</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            id="isActive"
            type="checkbox"
            checked={form.isActive}
            onChange={(e) =>
              setForm({ ...form, isActive: e.target.checked })
            }
          />
          <label htmlFor="isActive" className="text-sm text-slate-700">
            Aktif
          </label>
        </div>

        <div>
          <label className="block text-xs text-slate-500 mb-1">
            İlk Görsel (opsiyonel)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block text-sm"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-600">
            {busy ? 'Kaydediliyor…' : ''}
          </div>
          <button
            type="submit"
            disabled={busy}
            className="px-4 py-2 rounded-xl bg-slate-800 text-white text-sm hover:opacity-90 disabled:opacity-50"
          >
            Kaydet
          </button>
        </div>
      </form>
    </div>
  );
}
