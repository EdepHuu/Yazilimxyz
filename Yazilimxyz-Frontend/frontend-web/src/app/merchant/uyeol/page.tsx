'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

type RegisterResponse = {
  success?: boolean;
  message?: string;
};

type ApiError = { message?: string };

export default function MerchantRegisterPage() {
  const router = useRouter();

  // Ad/Soyad alanlarını UI'dan kaldırdık; state'ler boş string olarak tutuluyor.
  const [name] = useState('');        // backend’e "" gidecek (null/undefined değil)
  const [lastName] = useState('');    // backend’e "" gidecek

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [iban, setIban] = useState('');
  const [taxNumber, setTaxNumber] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');

  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const registerUrl =
    (process.env.NEXT_PUBLIC_API_BASE_URL ?? '') +
    (process.env.NEXT_PUBLIC_REGISTER_ENDPOINT ?? '/api/Auth/register');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMsg(null);

    if (!agree) {
      setMsg('❌ Lütfen kullanıcı sözleşmesini onaylayın.');
      return;
    }

    setLoading(true);
    try {
      // role her zaman Merchant — Ad/Soyad boş string olarak gönderiliyor
      const payload = {
        name: name ?? '',
        lastName: lastName ?? '',
        email,
        password,
        role: 'Merchant',
        phone,
        companyName,
        iban,
        taxNumber,
        companyAddress,
      };

      const res = await axios.post<RegisterResponse>(registerUrl, payload, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.data?.success) {
        setMsg('✅ Kayıt başarılı. Giriş sayfasına yönlendiriliyorsunuz…');
        setTimeout(() => router.push('/merchant/giris'), 900);
      } else {
        setMsg(`❌ ${res.data?.message ?? 'Kayıt başarısız.'}`);
      }
    } catch (err: unknown) {
      let apiMsg = 'Sunucuya ulaşılamadı.';
      if (axios.isAxiosError<ApiError>(err)) {
        apiMsg = err.response?.data?.message ?? err.message ?? apiMsg;
      } else if (err instanceof Error) {
        apiMsg = err.message || apiMsg;
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

      {/* üst sekmeler (gerekirse route'u /merchant/uyeol yapabilirsin) */}
      <div className="mx-auto max-w-6xl px-6 mt-6">
        <div className="flex bg-gray-100 rounded-lg p-1 w-full max-w-md mx-auto">
          <button
            className="flex-1 py-2 rounded-lg text-gray-600 hover:text-black transition"
            onClick={() => router.push('/merchant/giris')}
          >
            Giriş Yap
          </button>
          <button
            className="flex-1 py-2 rounded-lg bg-white text-black shadow transition"
            onClick={() => router.push('/merchant/basvuru')}
          >
            ShopEase satıcısı ol
          </button>
        </div>
      </div>

      {/* içerik */}
      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid gap-8 lg:grid-cols-4">
          {/* SOL: kayıt formu */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-neutral-200 bg-neutral-100/70 p-9 shadow-lg">
              <form onSubmit={handleSubmit} className="grid gap-6">
                {/* Ad/Soyad kaldırıldı */}

                <div className="grid gap-2">
                  <label className="text-[15px] font-medium text-neutral-800">E‑posta</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 rounded-2xl border border-neutral-300 bg-white px-4 text-[15px] outline-none focus:ring-2 focus:ring-neutral-900"
                    placeholder="ornek@firma.com"
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-[15px] font-medium text-neutral-800">Şifre</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 rounded-2xl border border-neutral-300 bg-white px-4 text-[15px] outline-none focus:ring-2 focus:ring-neutral-900"
                    placeholder="••••••••"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="grid gap-2">
                    <label className="text-[15px] font-medium text-neutral-800">Telefon</label>
                    <input
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="h-12 rounded-2xl border border-neutral-300 bg-white px-4 text-[15px] outline-none focus:ring-2 focus:ring-neutral-900"
                      placeholder="+90 5xx xxx xx xx"
                    />
                  </div>

                  <div className="grid gap-2">
                    <label className="text-[15px] font-medium text-neutral-800">Şirket Adı</label>
                    <input
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="h-12 rounded-2xl border border-neutral-300 bg-white px-4 text-[15px] outline-none focus:ring-2 focus:ring-neutral-900"
                      placeholder="Örn. ABC Tekstil A.Ş."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="grid gap-2">
                    <label className="text-[15px] font-medium text-neutral-800">IBAN</label>
                    <input
                      required
                      value={iban}
                      onChange={(e) => setIban(e.target.value)}
                      className="h-12 rounded-2xl border border-neutral-300 bg-white px-4 text-[15px] outline-none focus:ring-2 focus:ring-neutral-900"
                      placeholder="TR00 0000 0000 0000 0000 0000 00"
                    />
                  </div>

                  <div className="grid gap-2">
                    <label className="text-[15px] font-medium text-neutral-800">Vergi No</label>
                    <input
                      required
                      value={taxNumber}
                      onChange={(e) => setTaxNumber(e.target.value)}
                      className="h-12 rounded-2xl border border-neutral-300 bg-white px-4 text-[15px] outline-none focus:ring-2 focus:ring-neutral-900"
                      placeholder="Vergi numarası"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <label className="text-[15px] font-medium text-neutral-800">Şirket Adresi</label>
                  <textarea
                    required
                    value={companyAddress}
                    onChange={(e) => setCompanyAddress(e.target.value)}
                    className="min-h-[96px] rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-[15px] outline-none focus:ring-2 focus:ring-neutral-900"
                    placeholder="Açık adres"
                  />
                </div>

                {/* Sözleşme onayı */}
                <label className="flex items-center gap-3 text-sm text-neutral-700">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border"
                    checked={agree}
                    onChange={(e) => setAgree(e.target.checked)}
                  />
                  Kullanıcı Sözleşmesi’ni okudum ve kabul ediyorum.
                </label>

                <button
                  type="submit"
                  disabled={loading || !agree}
                  className="h-12 rounded-2xl bg-gray-300 px-6 text-base font-medium text-black transition hover:opacity-90 disabled:opacity-60"
                >
                  {loading ? 'Kaydediliyor…' : 'Kayıt ol'}
                </button>

                {msg && <div className="text-center text-sm">{msg}</div>}
              </form>
            </div>
          </div>

          {/* ORTA ve SAĞ kolonlar — olduğu gibi */}
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
