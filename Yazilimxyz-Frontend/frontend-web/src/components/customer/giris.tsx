"use client";
import axios, { AxiosError } from "axios";
import { useState, FormEvent, useEffect } from "react";

const tabs = ["Giriş Yap", "Üye Ol", "Bizimle Çalış"];
const EXPECTED_ROLE = "Customer";

type LoginResponse = {
  success?: boolean;
  message?: string;
  token?: string;
  Token?: string;
  role?: string;
  Role?: string;
  email?: string;
};

type ApiError = { message?: string };

export default function Tabs() {
  const [activeTab, setActiveTab] = useState("Giriş Yap");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  // ✨ EKLENDİ: customer tarafında “Beni hatırla” (merchant ile aynı davranış)
  const [rememberMe, setRememberMe] = useState(true);
  useEffect(() => {
    const savedRemember = localStorage.getItem("customer_remember_me");
    if (savedRemember) setRememberMe(savedRemember === "1");
    const rememberedEmail = localStorage.getItem("customer_remember_email");
    if (rememberedEmail) setEmail(rememberedEmail);
  }, []);

  const handleTabClick = (tab: string) => {
    if (tab === "Üye Ol") {
      window.location.href = "/customer/uyeol";
      return;
    }
    if (tab === "Bizimle Çalış") {
      window.location.href = "/merchant/giris";
      return;
    }
    setActiveTab("Giriş Yap");
  };

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");

    try {
      const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}${process.env.NEXT_PUBLIC_LOGIN_ENDPOINT}`;
      console.log("LOGIN URL =>", url);

      const response = await axios.post<LoginResponse>(
        url,
        { email, password },
        { headers: { "Content-Type": "application/json" } }
      );

      const data = response.data;

      if (data?.success) {
        const role = (data.role || data.Role || "").trim();
        if (role !== EXPECTED_ROLE) {
          setMessage("❌ E-posta ya da şifre hatalı.");
          return;
        }

        // ✨ EKLENDİ: “Beni hatırla” davranışı (merchant ile aynı mantık)
        const token = data.token || data.Token || "";
        if (rememberMe) {
          localStorage.setItem("token", token);
          localStorage.setItem("customer_remember_me", "1");
          localStorage.setItem("customer_remember_email", email);
          sessionStorage.removeItem("token"); // kalıntı temizliği
        } else {
          sessionStorage.setItem("token", token);
          localStorage.setItem("customer_remember_me", "0");
          localStorage.removeItem("customer_remember_email");
          localStorage.removeItem("token"); // kalıntı temizliği
        }

        setMessage("✅ Giriş başarılı!");
        window.location.href = "/customer/urunler";
      } else {
        setMessage(`❌ ${data?.message || "Giriş başarısız."}`);
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const err = error as AxiosError<ApiError>;
        const msg =
          err.response?.data?.message ||
          err.response?.statusText ||
          err.message ||
          "Sunucuya bağlanılamadı.";
        setMessage(`❌ ${msg}`);
      } else {
        console.error(error);
        setMessage("❌ Beklenmeyen bir hata oluştu.");
      }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto my-12">
      <div className="text-center mb-6">
        ShopEase’a giriş yap veya hesap oluştur, indirimleri kaçırma!
      </div>

      <div className="flex bg-gray-100 rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabClick(tab)}
            className={`flex-1 py-2 heading-sm-1 rounded-lg transition-all duration-200 ${
              activeTab === tab
                ? "bg-white text-black shadow"
                : "text-gray-500 hover:text-black"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {activeTab === "Giriş Yap" && (
          // ✨ DEĞİŞTİ: Formu merchant’taki gibi kutucuk içine aldım
          <div className="rounded-2xl border border-neutral-200 bg-neutral-100/70 p-6 shadow">
            <form onSubmit={handleLogin}>
              <div>
                <label className="block heading-sm-2 mb-1">E-posta</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  type="email"
                  placeholder="ornek@mail.com"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white"
                />
              </div>

              <div className="mt-4">
                <label className="block heading-sm-2 mb-1">Şifre</label>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  type="password"
                  placeholder="*****"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white"
                />
              </div>

              {/* ✨ EKLENDİ: Beni hatırla (merchant ile aynı görsel/işlev) */}
              <label className="mt-4 flex items-center gap-3 text-sm text-neutral-700">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Beni hatırla
              </label>

              {/* renk ve metin zaten merchant ile eşleşecek şekilde 2. adımda ayarlandı */}
              <button
                type="submit"
                className="w-full heading-sm-2 rounded-lg mt-6 px-4 py-2 bg-gray-300"
              >
                Giriş yap
              </button>

              {message && <p className="mt-4 text-sm">{message}</p>}
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
