"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fetchListCategory } from "@/lib/customerApi";
import { SearchIcon, ShopIcon, UserIcon } from "@/components/customer/icons/icon";

/* ================= Types ================= */
type CategoryName = { id: number; name: string; description?: string; imageUrl?: string };
type AuthState = { isLoggedIn: boolean; email?: string };

/* ================= Auth Keys ================= */
const KNOWN_KEYS: ReadonlyArray<string> = [
  "customerToken",
  "token",
  "access_token",
  "refresh_token",
  "id_token",
  "customerEmail",
  "email",
];

/* ================= Helpers ================= */
function readAuth(): AuthState {
  if (typeof window === "undefined") return { isLoggedIn: false };
  const key = KNOWN_KEYS.find((k) => !!localStorage.getItem(k));
  const token = key ? localStorage.getItem(key) : null;
  const email =
    localStorage.getItem("customerEmail") ??
    localStorage.getItem("email") ??
    undefined;
  return { isLoggedIn: !!token, email: email ?? undefined };
}

function clearAllAuth() {
  [localStorage, sessionStorage].forEach((store) => {
    const keys: string[] = [];
    for (let i = 0; i < store.length; i++) {
      const k = store.key(i);
      if (k) keys.push(k);
    }
    keys.forEach((k) => {
      const lower = k.toLowerCase();
      if (
        KNOWN_KEYS.includes(k) ||
        lower.includes("token") ||
        lower.includes("auth") ||
        lower.includes("access") ||
        lower.includes("refresh")
      ) {
        store.removeItem(k);
      }
    });
  });

  ["token", "access_token", "refresh_token", "customerToken", "id_token"].forEach((name) => {
    document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
  });
}

/* ================= Component ================= */
export default function Navbar() {
  const router = useRouter();

  const [categories, setCategories] = useState<CategoryName[]>([]);
  const [auth, setAuth] = useState<AuthState>({ isLoggedIn: false });
  const [mounted, setMounted] = useState(false);

  // hydration sonrası premium sınıfları açmak için
  const [hydrated, setHydrated] = useState(false);

  // Hesabım menüsü (hover ile aç/kapa – küçük gecikme)
  const [accountOpen, setAccountOpen] = useState(false);
  const hoverTimerRef = useRef<number | null>(null);
  const accountWrapRef = useRef<HTMLDivElement | null>(null);

  /* Kategorileri çek */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetchListCategory();
        setCategories(res.data as CategoryName[]);
      } catch (err) {
        console.error("Kategori listesi alınamadı:", err);
      }
    })();
  }, []);

  /* Auth state & mount */
  useEffect(() => {
    setMounted(true);
    setAuth(readAuth());

    const onStorage = (e: StorageEvent) => {
      if (e.storageArea !== localStorage) return;
      setAuth(readAuth());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  /* Hydration sonrası premium class'ları aç */
  useEffect(() => {
    setHydrated(true);
  }, []);

  /* Dışarı tıklayınca/ESC ile menüyü kapat */
  useEffect(() => {
    const onClickOutside = (ev: MouseEvent) => {
      if (accountWrapRef.current && !accountWrapRef.current.contains(ev.target as Node)) {
        setAccountOpen(false);
      }
    };
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") setAccountOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  /* Hover intent (menüye inerken kapanmasın) */
  const openNow = () => {
    if (hoverTimerRef.current) window.clearTimeout(hoverTimerRef.current);
    setAccountOpen(true);
  };
  const closeWithDelay = () => {
    if (hoverTimerRef.current) window.clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = window.setTimeout(() => setAccountOpen(false), 120);
  };

  /* Navigation helpers */
  const go = (href: string) => {
    setAccountOpen(false);
    router.push(href);
  };

  const handleLogout = () => {
    clearAllAuth();
    setAuth({ isLoggedIn: false });
    setAccountOpen(false);
    router.push("/customer/giris");
  };

  // SSR ile aynı başlayıp mount'tan sonra premium'a dönen sınıflar
  const navBase = "fixed top-0 left-0 w-full z-50 bg-white border-b border-neutral-200/50";
  const navPremium =
    "bg-white/90 backdrop-blur-sm shadow-[0_1px_0_rgba(0,0,0,0.04)] border-neutral-200/40";

  return (
    <>
      {/* ================= NAVBAR ================= */}
      <nav className={`${navBase} ${hydrated ? navPremium : ""}`} suppressHydrationWarning>
        <div className="container px-3 md:px-6">
          {/* Üst satır */}
          <div className="flex h-14 items-center justify-between">
            <div className="flex h-14 items-center justify-between">
              {/* === LOGO / ANASAYFA === */}
              <Link
                href="/customer"
                className="text-xl font-semibold tracking-wide text-gray-900 hover:opacity-80 transition"
              >
                ShopEase
              </Link>
            </div>

            <div className="flex items-center gap-4">
              {/* Arama */}
              <div className="relative w-64">
                <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
                  <SearchIcon className="w-5 h-5 opacity-60" />
                </div>
                <input
                  type="text"
                  placeholder="arama yap"
                  className="w-full pl-3 pr-8 py-2 rounded-lg text-sm border border-gray-200/70 focus:outline-none focus:ring-2 focus:ring-gray-300/60"
                />
              </div>

              {/* Giriş Yap / Hesabım */}
              {!mounted ? null : !auth.isLoggedIn ? (
                <Link
                  href="/customer/giris"
                  aria-label="Giriş Yap"
                  className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-gray-100/70 whitespace-nowrap"
                >
                  <UserIcon className="w-5 h-5" />
                  <span className="text-sm md:text-base">Giriş Yap</span>
                </Link>
              ) : (
                <div
                  ref={accountWrapRef}
                  className="relative"
                  onMouseEnter={openNow}
                  onMouseLeave={closeWithDelay}
                >
                  <div className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-gray-100/70 cursor-pointer select-none">
                    <UserIcon className="w-5 h-5" />
                    <span className="text-sm md:text-base">Hesabım</span>
                  </div>

                  {accountOpen && (
                    <div
                      role="menu"
                      className="absolute right-0 mt-2 w-52 rounded-xl border border-gray-200 bg-white shadow-xl shadow-black/5 py-1.5 z-[90]"
                      onMouseEnter={openNow}
                      onMouseLeave={closeWithDelay}
                    >
                      <button
                        type="button"
                        className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                        onClick={() => go("/customer/siparislerim")}
                      >
                        Siparişlerim
                      </button>
                      <button
                        type="button"
                        className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                        onClick={() => go("/customer/adreslerim")}
                      >
                        Adreslerim
                      </button>
                      <button
                        type="button"
                        className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                        onClick={() => go("/customer/bilgilerim")}
                      >
                        Kullanıcı Bilgilerim
                      </button>
                      <button
                        type="button"
                        className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                        onClick={() => go("/customer/ayarlar")}
                      >
                        Ayarlar
                      </button>

                      <div className="my-1 border-t border-gray-100" />

                      <button
                        type="button"
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        onClick={handleLogout}
                      >
                        Çıkış Yap
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Sepet */}
              <Link
                href="/customer/sepetim"
                className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-gray-100/70 whitespace-nowrap"
              >
                <ShopIcon className="w-5 h-5" />
                <span className="text-sm md:text-base">Sepetim</span>
              </Link>
            </div>
          </div>

          {/* Kategori şeridi */}
          <div className="h-9 flex items-center">
            <div className="w-full overflow-x-auto whitespace-nowrap no-scrollbar">
              <div className="inline-flex gap-5 px-1">
                {categories.map((c) => {
                  const slug = (c.name || "").toLowerCase().replace(/\s+/g, "-");
                  return (
                    <Link
                      key={c.id}
                      href={`/customer/${slug}`}
                      className="text-sm text-gray-700 hover:text-gray-900 hover:underline underline-offset-4"
                    >
                      {c.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sert çizgi yerine ince gradient hairline */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-neutral-200/70 to-transparent" />
        </div>
      </nav>

      {/* Tek spacer: mobil 30px / desktop 40px */}
      <div className="h-[30px] md:h-[40px]" aria-hidden="true" />
    </>
  );
}
