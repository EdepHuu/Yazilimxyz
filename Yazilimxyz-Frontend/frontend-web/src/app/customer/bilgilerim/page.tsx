// src/app/customer/(account)/bilgilerim/page.tsx
'use client';

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

/* =============== Types =============== */
type ApiResponse<T> = { data: T; success?: boolean; message?: string };

type MerchantLikeProfile = {
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
const PROFILE = '/api/merchant/profile';
const USER_ME = '/api/User/me';
const USER_CHANGE_PASSWORD = '/api/User/change-password';

/* =============== Helpers =============== */
const isObject = (x: unknown): x is Record<string, unknown> =>
  typeof x === 'object' && x !== null;

const isApiResponse = <T,>(x: unknown): x is ApiResponse<T> =>
  isObject(x) && 'data' in x;

const unwrap = <T,>(raw: unknown): T =>
  isApiResponse<T>(raw) ? (raw as ApiResponse<T>).data : (raw as T);

const msgOf = (raw: unknown): string | undefined => {
  if (typeof raw === 'string') return raw;
  if (isObject(raw) && typeof (raw as { message?: string }).message === 'string')
    return (raw as { message?: string }).message;
  return undefined;
};

const pickPhone = (x?: { phone?: string | null; phoneNumber?: string | null } | null) =>
  (!x ? '' : (x.phoneNumber ?? x.phone ?? '') || '');

export default function CustomerProfilePage() {
  const router = useRouter();

  /* ---- UI / State ---- */
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // değişiklik tespiti için başlangıç snapshot’ı
  const [snap, setSnap] = useState({ firstName: '', lastName: '', phone: '', email: '' });

  // şifre
  const [pwdMsg, setPwdMsg] = useState<string | null>(null);
  const [pwdSaving, setPwdSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPwd, setShowNewPwd] = useState(false);

  /* ---- Axios ---- */
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

  /* ---- Başlangıç verisini çek ---- */
  const load = useCallback(async () => {
    // 1) /me
    const rMe = await api.get<ApiResponse<UserMe> | UserMe>(USER_ME);
    const me = unwrap<UserMe>(rMe.data);

    const fn = (me.firstName ?? '') || '';
    const ln = (me.lastName ?? '') || '';
    const em = me.email ?? '';
    let ph = pickPhone(me);

    // 2) opsiyonel profil — tel profilde tutuluyorsa onu baz al
    try {
      const rProf = await api.get<ApiResponse<MerchantLikeProfile> | MerchantLikeProfile>(PROFILE);
      const prof = unwrap<MerchantLikeProfile>(rProf.data);
      const profPhone = pickPhone(prof);
      if (!ph && profPhone) ph = profPhone;
    } catch { /* 404/405 olabilir, sorun değil */ }

    setFirstName(fn);
    setLastName(ln);
    setEmail(em);
    setPhone(ph);
    setSnap({ firstName: fn, lastName: ln, email: em, phone: ph });
  }, [api]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setMsg(null);
        await load();
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          const code = err.response?.status;
          if (code === 401) return router.replace('/customer/giris');
          setMsg(msgOf(err.response?.data) || `Hata: ${code ?? ''}`);
        } else {
          setMsg('Beklenmeyen bir hata oluştu.');
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [load, router]);

  /* ---- Kaydet (YENİ: sadece değişen alanları PATCH‑vari gönder, refetch YOK) ---- */
  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setSaving(true);
    setMsg(null);

    // Sadece değişen alanları gönder (me + profil ayrımı)
    const mePart: Partial<UserMe> = {};
    const profPart: Partial<MerchantLikeProfile> = {};

    const fnT = firstName.trim();
    const lnT = lastName.trim();
    const emT = email.trim();
    const phT = phone.trim();

    if (fnT !== snap.firstName) mePart.firstName = fnT || null;
    if (lnT !== snap.lastName)  mePart.lastName  = lnT || null;
    if (emT !== snap.email)     mePart.email     = emT;
    if (phT !== snap.phone) {
      mePart.phone = phT;
      mePart.phoneNumber = phT;
      profPart.phone = phT;
      profPart.phoneNumber = phT;
    }

    try {
      // /me güncelle (ad + soyad + email + tel)
      if (Object.keys(mePart).length > 0) {
        const res = await api.put<ApiResponse<unknown> | { message?: string } | string>(USER_ME, mePart);
        setMsg(msgOf(res.data) || 'Profil güncellendi.');
      }

      // profil (sadece tel için, varsa)
      if (Object.keys(profPart).length > 0) {
        try {
          await api.put<ApiResponse<unknown> | { message?: string } | string>(PROFILE, profPart);
        } catch { /* profil yoksa dert etmiyoruz */ }
      }

      // başarılıysa snapshot’ı ileri al — böylece ekranda KALIR, refetch yok.
      setSnap({ firstName: fnT, lastName: lnT, email: emT, phone: phT });
    } catch (err: unknown) {
      setMsg(
        axios.isAxiosError(err)
          ? msgOf(err.response?.data) || '❌ Güncelleme başarısız.'
          : '❌ Güncelleme sırasında beklenmeyen hata.'
      );
    } finally {
      setSaving(false);
    }
  };

  /* ---- Şifre (dokunulmadı) ---- */
  const changePassword = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setPwdSaving(true);
    setPwdMsg(null);
    try {
      const res = await api.post<ApiResponse<unknown> | { message?: string } | string>(
        USER_CHANGE_PASSWORD,
        { currentPassword, newPassword, confirmNewPassword: newPassword }
      );
      setPwdMsg(msgOf(res.data) || '✅ Şifre değiştirildi.');
      setCurrentPassword('');
      setNewPassword('');
      setShowNewPwd(false);
    } catch (err: unknown) {
      setPwdMsg(
        axios.isAxiosError(err)
          ? msgOf(err.response?.data) || '❌ Şifre değiştirilemedi.'
          : '❌ Beklenmeyen hata.'
      );
    } finally {
      setPwdSaving(false);
    }
  };

  if (loading)
    return <div className="container mx-auto max-w-lg text-slate-600 text-sm py-5">Yükleniyor…</div>;

  /* =============== UI (kutular küçültüldü) =============== */
  return (
    <div className="container mx-auto max-w-lg px-3 py-4">
      <h1 className="text-base font-semibold text-slate-800 mb-3">Bilgilerim</h1>

      <div className="rounded-xl bg-slate-50 border border-slate-200 shadow-sm p-3.5">
        {/* Profil */}
        <form onSubmit={onSubmit} className="space-y-3.5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            <Field label="Ad">
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-[12px] focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </Field>

            <Field label="Soyad">
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-[12px] focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </Field>

            <Field label="E‑posta">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-[12px] focus:outline-none focus:ring-2 focus:ring-slate-400"
                required
              />
            </Field>

            <Field label="Telefon">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+90__________"
                className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-[12px] focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </Field>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-600">{saving ? 'Kaydediliyor…' : msg}</span>
            <button
              type="submit"
              disabled={saving}
              className="px-3 py-1.5 rounded-md shadow-sm border border-slate-300 bg-slate-800 text-white hover:opacity-90 disabled:opacity-60 text-[12px] font-medium"
            >
              Kaydet
            </button>
          </div>
        </form>

        {/* Şifre Değiştir */}
        <form onSubmit={changePassword} className="space-y-3 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            <Field label="Mevcut Şifre">
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-[12px] focus:outline-none focus:ring-2 focus:ring-slate-400"
                required
              />
            </Field>

            <Field label="Yeni Şifre">
              <div className="relative">
                <input
                  type={showNewPwd ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 pr-8 text-[12px] focus:outline-none focus:ring-2 focus:ring-slate-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPwd((v) => !v)}
                  aria-label={showNewPwd ? 'Şifreyi gizle' : 'Şifreyi göster'}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-slate-200/60 focus:outline-none focus:ring-2 focus:ring-slate-400"
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
            <span className="text-[11px] text-slate-600">{pwdSaving ? 'Kaydediliyor…' : pwdMsg}</span>
            <button
              type="submit"
              disabled={pwdSaving}
              className="px-2.5 py-1.5 rounded-md border border-slate-300 bg-slate-700 text-white hover:opacity-90 disabled:opacity-60 text-[12px]"
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
      <label className="block text-[11px] text-slate-700 mb-1">{label}</label>
      {children}
    </div>
  );
}
