"use client";

import { useEffect } from "react";

// Cookie’den token okuma fonksiyonu
function getCookie(name: string) {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
}

export default function MerchantPanelPage() {
  useEffect(() => {
    // Token'ı localStorage → sessionStorage → cookie sırasıyla dene
    const ls = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const ss = typeof window !== "undefined" ? sessionStorage.getItem("token") : null;
    const ck = getCookie("token");
    const token = ls || ss || ck;

    // Token yoksa giriş sayfasına yönlendir
    if (!token) {
      window.location.href = "/merchant/giris";
    }
  }, []);

  // Şimdilik boş içerik (dashboard daha sonra eklenecek)
  return (
    <div className="max-w-6xl mx-auto">
      {/* Dashboard içerikleri burada olacak */}
    </div>
  );
}
