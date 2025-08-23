// src/app/customer/(account)/bilgilerim/page.tsx
'use client';

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

type ApiResponse<T> = { data: T; success?: boolean; message?: string };

type Profile = {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  phoneNumber?: string | null;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';
const PROFILE = '/api/merchant/profile'; // Customer da burayı kullanıyorsa
const USER_ME = '/api/User/me';
const USER_CHANGE_PASSWORD = '/api/User/change-password';

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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const [pwdMsg, setPwdMsg] = useState<string | null>(null);
  const [pwdSaving, setPwdSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPwd, setShowNewPwd] = useState(false);

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

  const refetch = useCallback(async () => {
    const rMe = await api.get<ApiResponse<Profile> | Profile>(USER_ME);
    const me = unwrap<Profile>(rMe.data);

    let mergedFirst = (me.firstName ?? '') || '';
    let mergedLast = (me.lastName ?? '') || '';
    let mergedEmail = me.email ?? '';
    let mergedPhone = pickPhone(me);

    try {
      const rProf = await api.get<ApiResponse<Profile> | Profile>(PROFILE);
      const prof = unwrap<Profile>(rProf.data);
      mergedFirst = prof.firstName || mergedFirst;
      mergedLast = prof.lastName || mergedLast;
      mergedEmail = prof.email || mergedEmail;
      if (!mergedPhone) mergedPhone = pickPhone(prof);
    } catch {
      /* ignore */
    }

    setFirstName(mergedFirst);
    setLastName(mergedLast);
    setEmail(mergedEmail);
    setPhone(mergedPhone);
  }, [api]);

  useEffect(() => {
    (async () => {
      try {
        await refetch();
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          return router.replace('/customer/giris');
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [refetch, router]);

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setSaving(true);
    setMsg(null);

    try {
      // USER_ME PUT
      const rMePut = await api.put<ApiResponse<unknown> | string>(USER_ME, {
        email: email.trim(),
        firstName: firstName.trim() || null,
        lastName: lastName.trim() || null,
        phone: phone.trim(),
        phoneNumber: phone.trim(),
      });

      // PROFILE PUT (ad, soyad, email, telefon)
      let profMsg = '';
      try {
        const rProfPut = await api.put<ApiResponse<unknown> | string>(PROFILE, {
          firstName: firstName.trim() || null,
          lastName: lastName.trim() || null,
          email: email.trim(),
          phone: phone.trim(),
          phoneNumber: phone.trim(),
        });
        profMsg = getMessage(rProfPut.data) || '';
      } catch {/* ignore */}

      await refetch();

      const baseMsg = getMessage(rMePut.data) || 'Profil güncellendi.';
      setMsg([baseMsg, profMsg].filter(Boolean).join(' '));
    } catch (err) {
      setMsg('❌ Güncelleme başarısız.');
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setPwdSaving(true);
    setPwdMsg(null);
    try {
      const res = await api.post(USER_CHANGE_PASSWORD, {
        currentPassword,
        newPassword,
        confirmNewPassword: newPassword,
      });
      setPwdMsg(getMessage(res.data) || '✅ Şifre değiştirildi.');
      setCurrentPassword('');
      setNewPassword('');
      setShowNewPwd(false);
    } catch {
      setPwdMsg('❌ Şifre değiştirilemedi.');
    } finally {
      setPwdSaving(false);
    }
  };

  if (loading) return <div className="container mx-auto max-w-lg text-slate-600 text-sm py-8">Yükleniyor…</div>;

  return (
    <div className="container mx-auto max-w-lg px-4 py-6">
      <h1 className="text-base font-semibold text-slate-800 mb-3">Bilgilerim</h1>

      <div className="rounded-xl bg-slate-50 border border-slate-200 shadow-sm p-3">
        {/* Profil */}
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="Ad">
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </Field>
            <Field label="Soyad">
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </Field>
            <Field label="E-posta">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </Field>
            <Field label="Telefon">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </Field>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-600">{saving ? 'Kaydediliyor…' : msg}</span>
            <button
              type="submit"
              disabled={saving}
              className="px-3 py-1.5 rounded-lg shadow-sm border border-slate-300 bg-slate-800 text-white hover:opacity-90 disabled:opacity-60 text-[12px] font-medium"
            >
              Kaydet
            </button>
          </div>
        </form>

        {/* Şifre Değiştir */}
        <form onSubmit={changePassword} className="space-y-3 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Field label="Mevcut Şifre">
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-slate-400"
                required
              />
            </Field>
            <Field label="Yeni Şifre">
              <input
                type={showNewPwd ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-slate-400"
                required
              />
            </Field>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-600">{pwdSaving ? 'Kaydediliyor…' : pwdMsg}</span>
            <button
              type="submit"
              disabled={pwdSaving}
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-700 text-white hover:opacity-90 disabled:opacity-60 text-[12px]"
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
      <label className="block text-[12px] text-slate-700 mb-1">{label}</label>
      {children}
    </div>
  );
}
