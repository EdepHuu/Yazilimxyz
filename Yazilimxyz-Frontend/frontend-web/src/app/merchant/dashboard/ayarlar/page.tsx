// src/app/merchant/(dashboard)/ayarlar/page.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

type MerchantProfile = {
  companyName: string;
  iban: string;
  taxNumber: string;
  companyAddress: string;
  phone: string;
};

type ApiResponse<T> = { data: T; success?: boolean; message?: string };

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || ''; // örn: https://localhost:7206
const PROFILE = '/api/merchant/profile';

// --- helpers (any YOK) ---
function isObject(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null;
}
function isApiResponse<T>(x: unknown): x is ApiResponse<T> {
  return isObject(x) && 'data' in x;
}
function unwrap<T>(raw: unknown): T {
  return isApiResponse<T>(raw) ? (raw as ApiResponse<T>).data : (raw as T);
}
function getMessage(raw: unknown): string | undefined {
  if (typeof raw === 'string') return raw;
  if (isObject(raw) && typeof raw.message === 'string') return raw.message;
  return undefined;
}

export default function MerchantSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [form, setForm] = useState<MerchantProfile>({
    companyName: '',
    iban: '',
    taxNumber: '',
    companyAddress: '',
    phone: '',
  });

  // axios instance + token header
  const api = useMemo(() => {
    const inst = axios.create({ baseURL: API_BASE });
    inst.interceptors.request.use((config) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (token) config.headers.Authorization = `Bearer ${token}`;
      config.headers['Content-Type'] = 'application/json';
      return config;
    });
    return inst;
  }, []);

  // profil çek
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setMsg(null);
        const res = await api.get<ApiResponse<MerchantProfile> | MerchantProfile>(PROFILE);
        if (!alive) return;
        const me = unwrap<MerchantProfile>(res.data);
        setForm({
          companyName: me.companyName ?? '',
          iban: me.iban ?? '',
          taxNumber: me.taxNumber ?? '',
          companyAddress: me.companyAddress ?? '',
          phone: me.phone ?? '',
        });
      } catch (err: unknown) {
        if (axios.isAxiosError<ApiResponse<unknown> | { message?: string } | string>(err)) {
          const code = err.response?.status;
          if (code === 401) return router.replace('/merchant/giris');
          const text =
            getMessage(err.response?.data) ||
            (code === 404 ? 'Bu kullanıcıya ait merchant profili bulunamadı.' : `Hata: ${code ?? ''}`);
          setMsg(text);
          // console.error('PROFILE GET ERROR =>', code, err.response?.data);
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

  const onChange =
    (k: keyof MerchantProfile) =>
    (ev: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((p) => ({ ...p, [k]: ev.target.value }));

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      const res = await api.put<ApiResponse<null> | { message?: string } | string>(PROFILE, {
        companyName: form.companyName.trim(),
        iban: form.iban.trim(),
        taxNumber: form.taxNumber.trim(),
        companyAddress: form.companyAddress.trim(),
        phone: form.phone.trim(),
      });
      setMsg(getMessage(res.data) || '✅ Profil başarıyla güncellendi.');
    } catch (err: unknown) {
      if (axios.isAxiosError<ApiResponse<unknown> | { message?: string } | string>(err)) {
        const code = err.response?.status;
        if (code === 401) return router.replace('/merchant/giris');
        setMsg(getMessage(err.response?.data) || '❌ Güncelleme başarısız.');
      } else {
        setMsg('❌ Güncelleme sırasında beklenmeyen hata.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-slate-600 text-sm">Yükleniyor…</div>;

  return (
    <div className="max-w-6xl">
      <h1 className="text-2xl font-semibold text-slate-800 mb-6">Ayarlar</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-7 space-y-6">
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Field label="Şirket Adı">
              <input
                type="text"
                value={form.companyName}
                onChange={onChange('companyName')}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3.5 text-[16px] focus:outline-none focus:ring-2 focus:ring-slate-400"
                required
              />
            </Field>

            <Field label="IBAN">
              <input
                type="text"
                value={form.iban}
                onChange={onChange('iban')}
                placeholder="TR____________________"
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3.5 text-[16px] focus:outline-none focus:ring-2 focus:ring-slate-400"
                required
              />
            </Field>

            <Field label="Vergi Numarası">
              <input
                type="text"
                value={form.taxNumber}
                onChange={onChange('taxNumber')}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3.5 text-[16px] focus:outline-none focus:ring-2 focus:ring-slate-400"
                required
              />
            </Field>

            <Field label="Telefon">
              <input
                type="tel"
                value={form.phone}
                onChange={onChange('phone')}
                placeholder="+90__________"
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3.5 text-[16px] focus:outline-none focus:ring-2 focus:ring-slate-400"
                required
              />
            </Field>

            <div className="lg:col-span-2">
              <label className="block text-[15px] text-slate-700 mb-1.5">Şirket Adresi</label>
              <textarea
                rows={4}
                value={form.companyAddress}
                onChange={onChange('companyAddress')}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3.5 text-[16px] focus:outline-none focus:ring-2 focus:ring-slate-400"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">{saving ? 'Kaydediliyor…' : msg}</span>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-2xl shadow-sm border border-slate-300 bg-slate-800 text-white hover:opacity-90 disabled:opacity-60 text-[15px] font-medium"
            >
              Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[15px] text-slate-700 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
