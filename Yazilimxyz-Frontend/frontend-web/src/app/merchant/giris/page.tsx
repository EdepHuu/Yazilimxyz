'use client';

import React, { useEffect, useState } from 'react';
import axios, { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';

type LoginResponse = {
  success: boolean;
  message?: string;
  token?: string;
  role?: string;
  email?: string;
};

export default function MerchantLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // checkbox ilk açılışta seçili gelmesin
  const [rememberMe, setRememberMe] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedRemember = localStorage.getItem('merchant_remember_me');
    if (savedRemember) {
      setRememberMe(savedRemember === '1');
    } else {
      setRememberMe(false);
    }
    const rememberedEmail = localStorage.getItem('merchant_remember_email');
    if (rememberedEmail) setEmail(rememberedEmail);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setLoading(true);

    try {
      const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}${process.env.NEXT_PUBLIC_LOGIN_ENDPOINT}`;
      const res = await axios.post<LoginResponse>(
        url,
        { email, password },
        { headers: { 'Content-Type': 'application/json' } }
      );
      const data = res.data;

      if (!data.success) {
        setMsg(`❌ ${data.message ?? 'Giriş başarısız.'}`);
        return;
      }

      const role = (data.role ?? '').toLowerCase();
      const isMerchant =
        role === 'merchant' || role === 'merchantadmin' || role === 'appadmin';

      if (!isMerchant) {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('role');
        setMsg('❌ Bu sayfa sadece satıcı (Merchant) kullanıcılar içindir.');
        return;
      }

      if (rememberMe) {
        localStorage.setItem('token', data.token ?? '');
        if (data.role) localStorage.setItem('role', data.role);
        localStorage.setItem('merchant_remember_me', '1');
        localStorage.setItem('merchant_remember_email', email);
      } else {
        sessionStorage.setItem('token', data.token ?? '');
        if (data.role) sessionStorage.setItem('role', data.role);
        localStorage.setItem('merchant_remember_me', '0');
        localStorage.removeItem('merchant_remember_email');
        localStorage.removeItem('token');
        localStorage.removeItem('role');
      }

      // cookie: rememberMe true => 12 saatlik kalıcı; false => session cookie
      const maxAge = 60 * 60 * 12; // 12 saat
      if (rememberMe) {
        document.cookie = `token=${data.token ?? ''}; path=/; max-age=${maxAge}`;
        document.cookie = `role=${data.role ?? 'Merchant'}; path=/; max-age=${maxAge}`;
      } else {
        document.cookie = `token=; path=/; Max-Age=0`;
        document.cookie = `role=; path=/; Max-Age=0`;
        document.cookie = `token=${data.token ?? ''}; path=/`;
        document.cookie = `role=${data.role ?? 'Merchant'}; path=/`;
      }

      setMsg('✅ Giriş başarılı. Yönlendiriliyor…');
      setTimeout(() => router.push('/merchant/dashboard/panel'), 600);
    } catch (err: unknown) {
      let apiMsg = 'Sunucuya ulaşılamadı.';
      if (axios.isAxiosError(err)) {
        const axErr = err as AxiosError<{ message?: string }>;
        apiMsg = axErr.response?.data?.message ?? err.message ?? apiMsg;
      }
      setMsg(`❌ ${apiMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen">
      {/* başlık şeridi */}
      <div className="border-b bg-white/70 backdrop-blur">
        <div className="mx-auto max-w-6xl px-6 py-8 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">ShopEase | Satıcı Paneli</h1>
          <p className="mt-2 text-sm text-neutral-600">Satıcı Başvuru Formu</p>
        </div>
      </div>

      {/* üst sekmeler */}
      <div className="mx-auto max-w-6xl px-6 mt-6">
        <div className="flex bg-gray-100 rounded-lg p-1 w-full max-w-md mx-auto">
          <button
            className="flex-1 py-2 rounded-lg bg-white text-black shadow transition"
            onClick={() => router.push('/merchant/giris')}
          >
            Giriş Yap
          </button>
          <button
            className="flex-1 py-2 rounded-lg text-gray-600 hover:text-black transition"
            onClick={() => router.push('/merchant/uyeol')}
          >
            ShopEase satıcısı ol
          </button>
        </div>
      </div>

      {/* içerik */}
      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid gap-8 lg:grid-cols-4">
          {/* SOL: giriş formu */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-neutral-200 bg-neutral-100/70 p-9 shadow-lg">
              <form onSubmit={handleSubmit} className="grid gap-7">
                <div className="grid gap-2">
                  <label htmlFor="email" className="text-[15px] font-medium text-neutral-800">
                    E‑posta Adresiniz
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 rounded-2xl border border-neutral-300 bg-white px-4 text-[15px] outline-none focus:ring-2 focus:ring-neutral-900"
                    placeholder="ornek@firma.com"
                  />
                </div>

                <div className="grid gap-2">
                  <label htmlFor="password" className="text-[15px] font-medium text-neutral-800">
                    Şifre
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 rounded-2xl border border-neutral-300 bg-white px-4 text-[15px] outline-none focus:ring-2 focus:ring-neutral-900"
                    placeholder="••••••••"
                  />
                </div>

                <label className="flex items-center gap-3 text-sm text-neutral-700">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  Beni hatırla
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="h-12 rounded-2xl bg-gray-300 px-6 text-base font-medium text-black transition hover:opacity-90 disabled:opacity-60"
                >
                  {loading ? 'Giriş yapılıyor…' : 'Giriş yap'}
                </button>

                {msg && <div className="text-center text-sm">{msg}</div>}
              </form>
            </div>
          </div>

          {/* Orta ve sağ sütunlar */}
          <aside className="space-y-6">
            <div className="rounded-2xl border border-neutral-200 bg-white p-7 shadow-lg">
              <div className="mb-2 text-[16px] font-semibold">
                İlk 15 günde ürün yükleyin, 60 gün özel komisyon!
              </div>
              <p className="text-[13px] leading-5 text-neutral-600">Kampanya detaylarını öğrenin.</p>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-white p-7 shadow-lg">
              <div className="mb-2 text-[16px] font-semibold">İş Ortaklarına Özel Uygulamalar</div>
              <p className="mb-4 text-[13px] leading-5 text-neutral-600">
                ShopEase satıcılarına sağladığımız çözümleri keşfedin.
              </p>
              <button className="rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm hover:bg-neutral-50">
                Hemen İncele
              </button>
            </div>
          </aside>

          <aside className="flex self-start">
            <div className="flex w-full flex-col justify-between rounded-2xl border border-neutral-200 bg-white p-7 shadow-lg h-[400px] shrink-0 overflow-hidden">
              <div>
                <div className="mb-3 text-[16px] font-semibold text-neutral-800">Uygulamayı İndirin</div>
                <p className="text-center text-[13px] leading-5 text-neutral-600">
                  ShopEase satıcı uygulamasını mağazalardan indirebilir veya QR kod ile hızlıca yükleyebilirsiniz.
                </p>
              </div>

              <div className="mt-2 mb-4 flex items-center justify-center gap-4">
                <a
                  href="#"
                  aria-label="App Store"
                  className="flex h-14 w-40 items-center justify-center rounded-xl border border-neutral-200 bg-white p-1.5 shadow-sm hover:shadow"
                >
                  <img
                    src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
                    alt="App Store’dan İndirin"
                    className="max-h-full max-w-full object-contain"
                  />
                </a>

                <a
                  href="#"
                  aria-label="Google Play"
                  className="flex h-14 w-40 items-center justify-center rounded-xl border border-neutral-200 bg-white p-1.5 shadow-sm hover:shadow"
                >
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                    alt="Google Play'den Alın"
                    className="max-h-full max-w-full object-contain"
                  />
                </a>
              </div>

              <div className="flex justify-center">
                <img
                  src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=shopease.app"
                  alt="ShopEase QR Kod"
                  className="h-36 w-36 rounded-md border object-contain"
                />
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
