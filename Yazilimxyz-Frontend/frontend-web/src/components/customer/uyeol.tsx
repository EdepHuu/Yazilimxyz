"use client";

import axios, { AxiosError } from "axios";
import { useState } from "react";

const ROLE_CUSTOMER = "Customer";

type ApiError = { message?: string };
type ResultUserResponse = { success?: boolean; message?: string };

export default function UyeOl() {
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accept, setAccept] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accept) {
      setMessage("❌ Lütfen kullanıcı sözleşmesini onaylayın.");
      return;
    }

    try {
      setLoading(true);

      // Sadece gerekli alanlar dolu, kalan hepsi boş string gönderilir.
      const payload = {
        // Customer için zorunlu olmayanlar boş string
        name: "",
        lastName: "",
        companyName: "",
        iban: "",
        taxNumber: "",
        companyAddress: "",

        // zorunlular
        email: email.trim(),
        password,
        role: ROLE_CUSTOMER,

        // opsiyonel: boşsa "" gönder
        phone: (phone || "").trim(),
      };

      const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}${process.env.NEXT_PUBLIC_REGISTER_ENDPOINT}`;
      console.log("REGISTER URL =>", url);

      const res = await axios.post<ResultUserResponse>(url, payload, {
        headers: { "Content-Type": "application/json" },
      });

      const data = res.data;
      if (data?.success) {
        setMessage("✅ Kayıt başarılı! Giriş sayfasına yönlendiriliyor…");
        setTimeout(() => (window.location.href = "/customer/giris"), 800);
      } else {
        setMessage(`❌ ${data?.message ?? "Kayıt başarısız."}`);
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const err = error as AxiosError<ApiError>;
        console.log("REGISTER ERROR =>", {
          status: err.response?.status,
          data: err.response?.data,
          message: err.message,
        });
        setMessage(`❌ ${err.response?.data?.message || err.message}`);
      } else {
        console.error(error);
        setMessage("❌ Sunucuya bağlanılamadı.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto my-12">
      <div className="text-center mb-6">
        <span className="block text-xl">Merhaba,</span>
        ShopEase’a giriş yap veya hesap oluştur, indirimleri kaçırma!
      </div>

      <div className="flex bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => (window.location.href = "/customer/giris")}
          className="flex-1 py-2 heading-sm-1 rounded-lg transition-all duration-200 text-gray-500 hover:text-black"
        >
          Giriş Yap
        </button>
        <button
          disabled
          className="flex-1 py-2 heading-sm-1 rounded-lg transition-all duration-200 bg-white text-black shadow"
        >
          Üye Ol
        </button>
        <button
          onClick={() => (window.location.href = "/merchant/giris")}
          className="flex-1 py-2 heading-sm-1 rounded-lg transition-all duration-200 text-gray-500 hover:text-black"
        >
          Bizimle Çalış
        </button>
      </div>

      <form onSubmit={handleRegister} className="mt-6">
        <div>
          <label className="block text-sm font-medium mb-1">Telefon Numarası</label>
          <input
            type="tel"
            placeholder="+90 5xx xxx xx xx"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500"
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium mb-1">E-posta Adresi</label>
          <input
            type="email"
            placeholder="ornek@mail.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500"
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium mb-1">Şifre</label>
          <input
            type="password"
            placeholder="*****"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500"
          />
        </div>

        <label className="flex items-center mt-4 text-sm text-gray-700">
          <input
            type="checkbox"
            className="mr-2 rounded border-gray-300 text-gray-600 focus:ring-1 focus:ring-gray-500"
            checked={accept}
            onChange={(e) => setAccept(e.target.checked)}
          />
          <span>
            <span className="font-medium">Kullanıcı Sözleşmesi’ni</span> okudum ve kabul ediyorum.
          </span>
        </label>

        <button
          className="w-full heading-sm-2 rounded-lg mt-6 px-4 py-2 bg-gray-300 disabled:opacity-70"
          type="submit"
          disabled={loading}
        >
          {loading ? "Gönderiliyor…" : "Üye Ol"}
        </button>

        {message && <p className="mt-2 text-sm">{message}</p>}

        <button
          type="button"
          onClick={() => (window.location.href = "/customer/giris")}
          className="w-full heading-sm-2 rounded-lg mt-2 px-4 py-2 border border-gray-300"
        >
          Giriş sayfasına dön
        </button>
      </form>
    </div>
  );
}
