"use client";

import { SearchIcon, ShopIcon, UserIcon } from "@/components/customer/icons/icon";
import { fetchListCategory } from "@/lib/customerApi";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

/* ========== Types ========== */
type CategoryName = { description: string; id: number; imageUrl: string; name: string };
type AuthState = { isLoggedIn: boolean; email?: string };

/* ========== Ayarlar ========== */
const CUSTOMER_TOKEN_KEYS: ReadonlyArray<string> = ["customerToken", "token", "access_token"];
const ACCOUNT_MENU: ReadonlyArray<{ label: string; href: string }> = [
  { label: "Siparişlerim", href: "/customer/siparislerim" },
  { label: "Adreslerim", href: "/customer/adreslerim" },
  { label: "Kullanıcı Bilgilerim", href: "/customer/kullanici-bilgilerim" },
  { label: "Ayarlarım", href: "/customer/ayarlar" },
];

/* ========== Helpers ========== */
function readCustomerAuth(): AuthState {
  if (typeof window === "undefined") return { isLoggedIn: false };
  const key = CUSTOMER_TOKEN_KEYS.find((k) => !!localStorage.getItem(k));
  const token = key ? localStorage.getItem(key) : null;
  const email = localStorage.getItem("customerEmail") ?? localStorage.getItem("email") ?? undefined;
  return { isLoggedIn: !!token, email: email ?? undefined };
}

export default function Navbar() {
  const router = useRouter();

  const [categories, setCategories] = useState<CategoryName[]>([]);
  const [auth, setAuth] = useState<AuthState>({ isLoggedIn: false });
  const [mounted, setMounted] = useState(false);

  const [mobileOpen, setMobileOpen] = useState(false);

  const [accountOpen, setAccountOpen] = useState(false);
  const hoverTimerRef = useRef<number | null>(null);
  const accountWrapRef = useRef<HTMLDivElement | null>(null);

  const firstAccountHref = ACCOUNT_MENU[0].href;

  /* Kategoriler */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetchListCategory();
        setCategories(res.data as CategoryName[]);
      } catch (e) {
        console.error("Kategori listesi alınamadı:", e);
      }
    })();
  }, []);

  /* Auth + mount */
  useEffect(() => {
    setMounted(true);
    setAuth(readCustomerAuth());

    const onStorage = (e: StorageEvent) => {
      if (e.storageArea !== localStorage) return;
      if (!e.key || !CUSTOMER_TOKEN_KEYS.includes(e.key)) return;
      setAuth(readCustomerAuth());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  /* Dışarı tıklayınca kapat */
  useEffect(() => {
    const onClickOutside = (ev: MouseEvent) => {
      if (accountWrapRef.current && !accountWrapRef.current.contains(ev.target as Node)) {
        setAccountOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  /* Çıkış */
  const handleLogout = () => {
    CUSTOMER_TOKEN_KEYS.forEach((k) => localStorage.removeItem(k));
    localStorage.removeItem("customerEmail");
    localStorage.removeItem("email");
    setAuth({ isLoggedIn: false });
    setAccountOpen(false);
    router.push("/customer/giris");
  };

  /* Hover intent helpers (menüye inerken kapanmasın) */
  const openNow = () => {
    if (hoverTimerRef.current) window.clearTimeout(hoverTimerRef.current);
    setAccountOpen(true);
  };
  const closeWithDelay = () => {
    if (hoverTimerRef.current) window.clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = window.setTimeout(() => setAccountOpen(false), 150);
  };

  return (
    <>
      {/* ================= Desktop (fixed) ================= */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-white/95 backdrop-blur shadow">
        <div className="container">
          {/* Üst satır */}
          <div className="flex h-16 items-center justify-between">
            <div className="text-xl font-bold tracking-wide text-gray-900">ShopEase</div>

            <div className="flex items-center gap-6">
              {/* Arama */}
              <div className="relative w-72">
                <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
                  <SearchIcon className="w-5 h-5 opacity-60" />
                </div>
                <input
                  type="text"
                  placeholder="arama yap"
                  className="w-full pl-3 pr-10 py-2 rounded-lg text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
              </div>

              {/* User / Hesap */}
              {!mounted ? (
                <div className="invisible flex items-center gap-2">
                  <UserIcon className="w-6 h-6" />
                  <span className="text-base font-medium">Giriş Yap</span>
                </div>
              ) : !auth.isLoggedIn ? (
                <Link
                  href="/customer/giris"
                  aria-label="Giriş Yap"
                  className="group flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-gray-100 transition whitespace-nowrap"
                >
                  <UserIcon className="w-6 h-6 group-hover:scale-105 transition-transform" />
                  <span className="text-base font-medium">Giriş Yap</span>
                </Link>
              ) : (
                <div
                  ref={accountWrapRef}
                  className="relative"
                  onPointerEnter={openNow}
                  onPointerLeave={closeWithDelay}
                >
                  {/* Tıkla → ilk menü sayfasına gider; ayrıca menüyü de açar */}
                  <Link
                    href={firstAccountHref}
                    aria-label="Hesabım"
                    className="group flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-gray-100 transition whitespace-nowrap"
                    onClick={() => setAccountOpen(true)}
                  >
                    <UserIcon className="w-6 h-6 group-hover:scale-105 transition-transform" />
                    <span className="text-base font-medium">Hesabım</span>
                  </Link>

                  {/* Açılır menü */}
                  {accountOpen && (
                    <div
                      role="menu"
                      className="absolute right-0 mt-2 w-56 rounded-xl border border-gray-200 bg-white shadow-lg py-2 z-[60]"
                      onPointerEnter={openNow}
                      onPointerLeave={closeWithDelay}
                    >
                      {ACCOUNT_MENU.map((item) => (
                        <button
                          key={item.href}
                          type="button"
                          className="w-full text-left block px-4 py-2 text-sm hover:bg-gray-50"
                          onClick={() => {
                            setAccountOpen(false);
                            router.push(item.href); // ← garanti navigasyon
                          }}
                        >
                          {item.label}
                        </button>
                      ))}

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Çıkış Yap
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Sepet */}
              <Link
                href="/customer/sepet"
                className="group flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-gray-100 transition whitespace-nowrap"
              >
                <ShopIcon className="w-6 h-6 group-hover:scale-105 transition-transform" />
                <span className="text-base font-medium">Sepetim</span>
              </Link>
            </div>
          </div>

          {/* Kategori şeridi */}
          <div className="h-10 flex items-center border-t border-gray-100">
            <div className="w-full overflow-x-auto whitespace-nowrap no-scrollbar">
              <div className="inline-flex gap-6 px-1">
                {categories.map((c) => (
                  <Link
                    key={c.id}
                    href={`/customer/${c.name.toLowerCase().replace(/\s+/g, "-")}`}
                    className="text-sm md:text-base text-gray-800 hover:underline"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* ---- Küçük spacer: içerik navbar’ın altına gelsin (fazla boşluk yok) ---- */}
      <div className="hidden md:block h-[40px]" />
      <div className="md:hidden h-[30px]" />

      {/* ================= Mobile ================= */}
      <nav className="mb-30 md:hidden">
        <div className="fixed top-0 left-0 w-full pt-4 z-50 bg-white/95 backdrop-blur px-2">
          <div className="container flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                className={`menu ${mobileOpen ? "opened" : ""}`}
                onClick={() => setMobileOpen((p) => !p)}
                aria-label="Main Menu"
              >
                <svg width="36" height="36" viewBox="0 0 100 100">
                  <path className="line line1" d="M 20,29 H 80" />
                  <path className="line line2" d="M 20,50 H 80" />
                  <path className="line line3" d="M 20,71 H 80" />
                </svg>
              </button>
              <div className="text-3xl font-bold text-gray-900">ShopEase</div>
            </div>

            <div className="flex items-center gap-3">
              {!mounted ? (
                <div className="invisible flex items-center gap-2">
                  <UserIcon className="w-6 h-6" />
                  <span className="text-xs">Giriş Yap</span>
                </div>
              ) : !auth.isLoggedIn ? (
                <Link
                  href="/customer/giris"
                  aria-label="Giriş Yap"
                  className="group flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-gray-100 transition whitespace-nowrap"
                >
                  <UserIcon className="w-6 h-6" />
                  <span className="text-xs font-medium">Giriş Yap</span>
                </Link>
              ) : (
                <div
                  ref={accountWrapRef}
                  className="relative"
                  onPointerEnter={openNow}
                  onPointerLeave={closeWithDelay}
                >
                  <button
                    className="group flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-gray-100 transition whitespace-nowrap"
                    onClick={() => setAccountOpen((p) => !p)}
                    aria-label="Hesabım"
                  >
                    <UserIcon className="w-6 h-6" />
                    <span className="text-xs font-medium">Hesabım</span>
                  </button>
                  {accountOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 rounded-xl border border-gray-200 bg-white shadow-lg py-2 z-[60]"
                      onPointerEnter={openNow}
                      onPointerLeave={closeWithDelay}
                    >
                      {ACCOUNT_MENU.map((item) => (
                        <button
                          key={item.href}
                          type="button"
                          className="w-full text-left block px-4 py-2 text-sm hover:bg-gray-50"
                          onClick={() => {
                            setAccountOpen(false);
                            setMobileOpen(false);
                            router.push(item.href);
                          }}
                        >
                          {item.label}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Çıkış Yap
                      </button>
                    </div>
                  )}
                </div>
              )}

              <Link
                href="/customer/sepet"
                className="group flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-gray-100 transition whitespace-nowrap"
              >
                <ShopIcon className="w-6 h-6" />
                <span className="text-xs font-medium">Sepetim</span>
              </Link>
            </div>
          </div>

          {/* Mobile tam ekran menü */}
          {mobileOpen && (
            <div className="fixed inset-0 bg-white z-50 p-4 overflow-y-auto">
              <div className="text-3xl font-bold text-gray-900 flex justify-end">ShopEase</div>

              <div className="relative w-full my-4">
                <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
                  <SearchIcon className="w-5 h-5 opacity-60" />
                </div>
                <input
                  type="text"
                  placeholder="arama yap"
                  className="w-full pl-3 pr-10 py-2 rounded-lg text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
              </div>

              <div className="flex flex-col gap-4 mt-8">
                {categories.map((link) => (
                  <Link
                    key={link.id}
                    href={`/customer/${link.name.toLowerCase().replace(/\s+/g, "-")}`}
                    onClick={() => setMobileOpen(false)}
                    className="bg-gray-100 p-3 rounded-xl"
                  >
                    <span className="text-md font-semibold text-gray-800 hover:underline">
                      {link.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Tailwind yardımcı sınıfı:
      .no-scrollbar::-webkit-scrollbar { display: none; }
      .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      */}
    </>
  );
}
