"use client";
import axios from "axios";
import { useState } from "react";

const tabs = ["Giriş Yap", "Üye Ol", "Bizimle Çalış"];

export default function Tabs() {
  const [activeTab, setActiveTab] = useState("Giriş Yap");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    try {
      const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}${process.env.NEXT_PUBLIC_LOGIN_ENDPOINT}`;
      console.log("LOGIN URL =>", url);
      
      const response = await axios.post(url, { email, password }, {
        headers: { "Content-Type": "application/json" }
      });


      const data = response.data;

      if (data.success) {
        // API’nin döndürdüğü property isimleri farklıysa uyarlayabilirsin
        localStorage.setItem("token", data.token || data.Token || "");
        setMessage("✅ Giriş başarılı!");
        window.location.href = "/customer/urunler";
      } else {
        setMessage(`❌ ${data.message || "Giriş başarısız."}`);
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.statusText ||
        err?.message ||
        "Sunucuya bağlanılamadı.";
      setMessage(`❌ ${msg}`);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto my-12">
      <div className="text-center mb-6">
        <span className="block text-xl"> Merhaba,</span>
        ShopEase’a giriş yap veya hesap oluştur, indirimleri kaçırma!
      </div>

      <div className="flex bg-gray-100 rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabClick(tab)}
            className={`flex-1 py-2 heading-sm-1 rounded-lg transition-all duration-200
              ${
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
          <form onSubmit={handleLogin}>
            <div>
              <label className="block heading-sm-2 mb-1">E-posta</label>
              <input
                onChange={(e) => setEmail(e.target.value)}
                required
                type="email"
                placeholder="ornek@mail.com"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500"
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
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500"
              />
            </div>

            <button
              type="submit"
              className="w-full heading-sm-2 rounded-lg mt-8 px-4 py-2 bg-gray-300"
            >
              Giriş yap
            </button>

            {message && <p className="mt-4 text-sm">{message}</p>}
          </form>
        )}
      </div>
    </div>
  );
}
