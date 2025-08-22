// src/app/customer/(account)/bilgilerim/page.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

/* =============== Types =============== */
type ApiResponse<T> = { data: T; success?: boolean; message?: string };

type CustomerProfile = {
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  phoneNumber?: string | null;
};

type UserMe = {
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  phoneNumber?: string | null;
};

/* =============== API =============== */
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';
// Not: projede müşteri profil PUT'u farklıysa burada ayarla.
// Kullanım: varsa ekstra senkron için kullanılır; GET zorunlu değil.
const PROFILE = '/api/customer/profile';

const USER_ME = '/api/User/me';
const USER_CHANGE_PASSWORD = '/api/User/change-password';

/* =============== Helpers =============== */
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
  if (isObject(raw) && typeof (raw as { message?: string }).message === 'string') {
    return (raw as { message?: string }).message;
  }
  return undefined;
}
function pickPhone(x?: { phone?: string | null; phoneNumber?: string | null } | null): string {
  if (!x) return '';
  return (x.phoneNumber ?? x.phone ?? '') || '';
}

export default function CustomerProfilePage() {
  const router = useRouter();

  // state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [initialEmail, setInitialEmail] = useState('');

  const [pwdMsg, setPwdMsg] = useState<string | null>(null);
  const [pwdSaving, setPwdSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPwd, setShowNewPwd] = useState(false);

  // axios
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

  // initial load
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setMsg(null);

        // 1) User/me: temel tek kaynak
        const rMe = await api.get<ApiResponse<UserMe> | UserMe>(USER_ME);
        if (!alive) return;
        const me = unwrap<UserMe>(rMe.data);

        setEmail(me.email ?? '');
        setInitialEmail(me.email ?? '');
        setFirstName((me.firstName ?? '') || '');
        setLastName((me.lastName ?? '') || '');
        setPhone(pickPhone(me));

        // 2) (Opsiyonel) Profil GET: varsa ad/soyad/telefonu üzerine yazabilir
        try {
          const rProf = await api.get<ApiResponse<CustomerProfile> | CustomerProfile>(PROFILE);
          const prof = unwrap<CustomerProfile>(rProf.data);
          setFirstName((prof.firstName ?? firstName) || '');
          setLastName((prof.lastName ?? lastName) || '');
          if (!pickPhone(me)) setPhone(pickPhone(prof));
        } catch (err: unknown) {
          // 404/405 gibi durumları sessizce yoksay (tasarım gereği)
          // console.debug('PROFILE GET skipped', err);
        }
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          const code = err.response?.status;
          if (code === 401) return router.replace('/customer/giris');
          setMsg(getMessage(err.response?.data) || `Hata: ${code ?? ''}`);
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

  // save
  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      // 1) User/me üzerinden ana güncelleme (ad/soyad/telefon/e‑posta)
      // e‑posta değişikliği de burada tek çağrıda yapılır.
      const rMePut = await api.put<ApiResponse<unknown> | { message?: string } | string>(USER_ME, {
        email: email.trim(),
        firstName: firstName.trim() || null,
        lastName: lastName.trim() || null,
        phone: phone.trim(),
        phoneNumber: phone.trim(),
      });

      // 2) (Opsiyonel) Ek uyumluluk: PROFILE PUT
      let profPart = '';
      try {
        const rProfPut = await api.put<ApiResponse<unknown> | { message?: string } | string>(
          PROFILE,
          {
            firstName: firstName.trim() || null,
            lastName: lastName.trim() || null,
            phone: phone.trim(),
            phoneNumber: phone.trim(),
          }
        );
        profPart = getMessage(rProfPut.data) || '';
      } catch (err: unknown) {
        // 404/405 ise sorun etme; tek kaynak User/me zaten güncelledi
        // console.debug('PROFILE PUT skipped', err);
      }

      const baseMsg = getMessage(rMePut.data) || 'Profil başarıyla güncellendi.';
      setMsg([baseMsg, profPart].filter(Boolean).join(' '));
      setInitialEmail(email.trim());
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const code = err.response?.status;
        if (code === 401) return router.replace('/customer/giris');
        setMsg(getMessage(err.response?.data) || '❌ Güncelleme başarısız.');
      } else {
        setMsg('❌ Güncelleme sırasında beklenmeyen hata.');
      }
    } finally {
      setSaving(false);
    }
  };

  // change password
  const changePassword = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setPwdSaving(true);
    setPwdMsg(null);
    try {
      const res = await api.post<ApiResponse<unknown> | { message?: string } | string>(
        USER_CHANGE_PASSWORD,
        {
          currentPassword,
          newPassword,
          confirmNewPassword: newPassword,
        }
      );
      setPwdMsg(getMessage(res.data) || '✅ Şifre değiştirildi.');
      setCurrentPassword('');
      setNewPassword('');
      setShowNewPwd(false);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const code = err.response?.status;
        if (code === 401) return router.replace('/customer/giris');
        setPwdMsg(getMessage(err.response?.data) || '❌ Şifre değiştirilemedi.');
      } else {
        setPwdMsg('❌ Beklenmeyen hata.');
      }
    } finally {
      setPwdSaving(false);
    }
  };

  if (loading)
    return (
      <div className="container mx-auto max-w-2xl text-slate-600 text-sm py-8">Yükleniyor…</div>
    );

  /* =============== UI: daha küçük ve footer tonuna yakın =============== */
  return (
    <div className="container mx-auto max-w-2xl px-4 py-6">
      <h1 className="text-xl font-semibold text-slate-800 mb-4">Bilgilerim</h1>

      <div className="rounded-2xl bg-slate-50 border border-slate-200 shadow-sm p-5">
        {/* Profil + E‑posta */}
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Ad">
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </Field>

            <Field label="Soyad">
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </Field>

            <Field label="E‑posta">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-slate-400"
                required
              />
            </Field>

            <Field label="Telefon">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+90__________"
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </Field>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">{saving ? 'Kaydediliyor…' : msg}</span>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-xl shadow-sm border border-slate-300 bg-slate-800 text-white hover:opacity-90 disabled:opacity-60 text-[14px] font-medium"
            >
              Kaydet
            </button>
          </div>
        </form>

        {/* Şifre Değiştir */}
        <form onSubmit={changePassword} className="space-y-3 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Field label="Mevcut Şifre">
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-slate-400"
                required
              />
            </Field>

            <Field label="Yeni Şifre">
              <div className="relative">
                <input
                  type={showNewPwd ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 pr-10 text-[15px] focus:outline-none focus:ring-2 focus:ring-slate-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPwd((v) => !v)}
                  aria-label={showNewPwd ? 'Şifreyi gizle' : 'Şifreyi göster'}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-slate-200/60 focus:outline-none focus:ring-2 focus:ring-slate-400"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </button>
              </div>
            </Field>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">{pwdSaving ? 'Kaydediliyor…' : pwdMsg}</span>
            <button
              type="submit"
              disabled={pwdSaving}
              className="px-3.5 py-2 rounded-xl border border-slate-300 bg-slate-700 text-white hover:opacity-90 disabled:opacity-60 text-[14px]"
            >
              Şifreyi Değiştir
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
      <label className="block text-[14px] text-slate-700 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
