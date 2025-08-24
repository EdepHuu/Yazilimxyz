"use client";

import React, { useState } from "react";





const MailIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5 text-gray-400"
  >
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

// Kilit simgesi için satır içi SVG
const LockIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5 text-gray-400"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

// Dönme simgesi için satır içi SVG
const SpinnerIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5 mr-2 animate-spin"
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

// AdminPanel bileşeninin props'ları için tür tanımlaması
interface AdminPanelProps {
  onLogout: () => void;
}

// Yönetici Paneli Bileşeni - Ayrı bir ekran olarak tasarlanmıştır.
const AdminPanel = ({ onLogout }: AdminPanelProps) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
    <div className="bg-gray-800 p-8 md:p-12 rounded-3xl shadow-2xl w-full max-w-4xl text-center">
      <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
        <h1 className="text-3xl md:text-4xl font-extrabold text-white">
          Yönetici Paneli
        </h1>
        <button
          onClick={onLogout}
          className="py-2 px-6 rounded-full shadow-lg font-bold text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-300 transform hover:scale-105"
        >
          Çıkış Yap
        </button>
      </div>
      <p className="text-lg text-gray-400 mb-8">
        Burada yönetici araçlarına ve verilerine erişebilirsiniz.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
        <div className="bg-gray-700 p-6 rounded-2xl shadow-lg">
          <h3 className="text-xl font-semibold text-white mb-2">Analizler</h3>
          <p className="text-gray-400">Web sitenizin performansını izleyin ve raporları görüntüleyin.</p>
        </div>
        <div className="bg-gray-700 p-6 rounded-2xl shadow-lg">
          <h3 className="text-xl font-semibold text-white mb-2">Kullanıcı Yönetimi</h3>
          <p className="text-gray-400">Kullanıcı hesaplarını yönetin ve izinleri ayarlayın.</p>
        </div>
        <div className="bg-gray-700 p-6 rounded-2xl shadow-lg">
          <h3 className="text-xl font-semibold text-white mb-2">İçerik</h3>
          <p className="text-gray-400">Yeni içerikler oluşturun, düzenleyin veya silin.</p>
        </div>
      </div>
    </div>
  </div>
);

// LoginPage bileşeninin props'ları için tür tanımlaması
interface LoginPageProps {
  onLogin: () => void;
}

// Giriş Sayfası Bileşeni - Tamamen ayrı bir ekran olarak tasarlanmıştır.
const LoginPage = ({ onLogin }: LoginPageProps) => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    if (!email || !password) {
      setMessage({ type: 'error', text: "Lütfen e-posta ve şifrenizi giriniz." });
      setIsLoading(false);
      return;
    }

    // Giriş için bir API çağrısı simülasyonu
    setTimeout(() => {
      // Bu örnek için sabit kodlanmış bir yönetici bilgisi kontrolü
      if (email === "admin@admin.com" && password === "password") {
        setMessage({ type: 'success', text: "Giriş başarılı! Yönetici paneline yönlendiriliyorsunuz..." });
        // Uygulama durumunu değiştirmek için üst bileşenden gelen onLogin işlevini çağır
        onLogin();
      } else {
        setMessage({ type: 'error', text: "Giriş başarısız oldu. Lütfen bilgilerinizi kontrol edin." });
      }
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-gradient-to-br from-pink-500 to-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      
      <div className="max-w-xl w-full relative z-10 bg-white bg-opacity-80 backdrop-filter backdrop-blur-lg border border-gray-200 p-8 md:p-12 rounded-3xl shadow-2xl transition-all duration-300 transform scale-100 hover:scale-105">
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Giriş Yap</h1>
          <p className="mt-2 text-md text-gray-600">Hesabınıza güvenle giriş yapın.</p>
        </div>

        {message && (
          <div className={`flex items-center p-4 rounded-xl mb-6 transition-all duration-300 ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <MailIcon />
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 block w-full rounded-xl border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm h-12 px-4 transition-colors"
              placeholder="e-posta@adresiniz.com"
              required
            />
          </div>
          <div className="relative">
            <LockIcon />
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 block w-full rounded-xl border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm h-12 px-4 transition-colors"
              placeholder="Şifreniz"
              required
            />
          </div>
          <div className="pt-6">
            <button
              type="submit"
              className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-lg font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 transform hover:scale-105"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <SpinnerIcon /> Giriş Yapılıyor...
                </div>
              ) : (
                "Giriş Yap"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Ana Uygulama Bileşeni
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Başarılı girişi işleyen ve yönetici paneline geçiş yapan işlev
  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  // Çıkışı işleyen ve giriş sayfasına geri dönen işlev
  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  // isLoggedIn durumu false ise LoginPage'i, true ise AdminPanel'i gösterir.
  // Bu, iki ekranın asla aynı anda görüntülenmeyeceğini garanti eder.
  return (
    // Giriş durumuna göre LoginPage veya AdminPanel'i koşullu olarak oluştur
    isLoggedIn ? <AdminPanel onLogout={handleLogout} /> : <LoginPage onLogin={handleLogin} />
  );
}