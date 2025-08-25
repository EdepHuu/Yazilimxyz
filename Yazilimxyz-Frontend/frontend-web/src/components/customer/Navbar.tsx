"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fetchListCategory } from "@/lib/customerApi";
import { SearchIcon, ShopIcon, UserIcon } from "@/components/customer/icons/icon";

/* ================= Types ================= */
// parentCategoryId ve sortOrder eklendi (opsiyonel)  // NEW
type CategoryName = {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
  parentCategoryId?: number | null;   // NEW
  sortOrder?: number;                  // NEW
};
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
      if (ev.key === "Escape") {
        setAccountOpen(false);
        setAllOpen(false); // NEW
      }
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

  /* ==================== KATEGORİ MODELİ ==================== */
  // Ana/alt kategorileri ayır  // NEW
  const { roots, childMap } = useMemo(() => {
    const roots = (categories ?? [])
      .filter(c => !c.parentCategoryId)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.name.localeCompare(b.name));
    const map = new Map<number, CategoryName[]>();
    for (const c of categories) {
      if (c.parentCategoryId) {
        const arr = map.get(c.parentCategoryId) ?? [];
        arr.push(c);
        map.set(c.parentCategoryId, arr);
      }
    }
    for (const [k, arr] of map) {
      arr.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.name.localeCompare(b.name));
      map.set(k, arr);
    }
    return { roots, childMap: map };
  }, [categories]);

  const toProducts = (categoryId: number) => {           // NEW
    router.push(`/customer/urunler?categoryId=${categoryId}`);
    setAllOpen(false);
  };

  /* ==================== Tüm Kategoriler Overlay ==================== */
  const [allOpen, setAllOpen] = useState(false);               // NEW
  const [activeRootId, setActiveRootId] = useState<number | null>(null); // NEW
  const openAll = () => {                                      // NEW
    const first = roots[0]?.id ?? null;
    setActiveRootId(first);
    setAllOpen(true);
  };
  const closeAll = () => setAllOpen(false);                    // NEW

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
                {/* Tüm Kategoriler düğmesi */}
                <button
                  type="button"
                  onClick={openAll}
                  className="inline-flex items-center gap-2 text-sm font-medium text-gray-900 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition shadow-sm"
                  aria-expanded={allOpen}
                >
                  <span className="i-accordion" aria-hidden>☰</span>
                  Tüm Kategoriler
                </button>

                {/* Sadece ANA kategorileri göster, tıklayınca ürünlere yönlendir */} {/* NEW */}
                {roots.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toProducts(c.id)}
                    className="text-sm text-gray-700 hover:text-gray-900 hover:underline underline-offset-4"
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sert çizgi yerine ince gradient hairline */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-neutral-200/70 to-transparent" />
        </div>
      </nav>

      {/* ============ Tüm Kategoriler Overlay (Trendyol tarzı) ============ */} {/* NEW */}
      {allOpen && (
  <div className="fixed top-14 left-0 right-0 z-[80]">
    <div className="container mx-auto px-3 md:px-6">
      <div
        className="
          mt-1 bg-white rounded-xl border border-gray-200
          shadow-[0_20px_40px_-20px_rgba(0,0,0,0.25)]
          overflow-hidden
        "
      >
        <div className="grid grid-cols-[240px_1fr] min-h-[340px]">
          {/* Sol: ana kategoriler */}
          <aside className="bg-gray-50/70 border-r border-gray-200 p-3">
            <div className="flex flex-col gap-1">
              {roots.map((root) => {
                const isActive = activeRootId === root.id;
                return (
                  <button
                    key={root.id}
                    type="button"
                    onMouseEnter={() => setActiveRootId(root.id)}
                    onClick={() => setActiveRootId(root.id)}
                    className={`
                      group w-full text-left px-3 py-2 rounded-lg text-[13px]
                      transition
                      ${isActive
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-700 hover:bg-white hover:shadow-sm"}
                    `}
                  >
                    <span className="inline-flex items-center justify-between w-full">
                      <span className="truncate">{root.name}</span>
                      <span className="ml-3 text-gray-400 group-hover:text-gray-500">›</span>
                    </span>
                  </button>
                );
              })}

              {/* --- Aşağıya eklenen kalem --- */}
              <div className="mt-2 pt-2 border-t border-gray-200" />
              <button
                type="button"
                onClick={() => {
                  router.push("/customer/urunler"); // kategori filtresi olmadan
                  setAllOpen(false);
                }}
                className="
                  w-full text-left px-3 py-2 rounded-lg text-[13px]
                  bg-white text-gray-900 shadow-sm hover:shadow transition
                "
              >
                Tüm Ürünleri Gör
              </button>
            </div>
          </aside>

          {/* Sağ: alt kategoriler */}
          <section className="p-4 md:p-6">
            <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-3 md:mb-4">
              {roots.find(r => r.id === activeRootId)?.name ?? "Kategoriler"}
            </h3>

            <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-4" />

            {/* Çok kolonlu alt kategori ızgarası */}
            <div
              className="
                grid gap-x-8 gap-y-2
                sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5
              "
            >
              {(activeRootId ? (childMap.get(activeRootId) ?? []) : []).map((sc) => (
                <button
                  key={sc.id}
                  type="button"
                  onClick={() => {
                    router.push(`/customer/urunler?categoryId=${sc.id}`);
                    setAllOpen(false);
                  }}
                  className="
                    text-left text-[13px] md:text-sm text-gray-700 hover:text-black
                    px-2 py-1 rounded-md transition hover:bg-gray-50
                  "
                >
                  {sc.name}
                </button>
              ))}

              {activeRootId && (childMap.get(activeRootId)?.length ?? 0) === 0 && (
                <div className="text-sm text-gray-500 italic px-2 py-1">
                  Bu kategori altında alt kategori bulunmuyor.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  </div>
)}



      {/* spacer */}
      <div className="h-[30px] md:h-[40px]" aria-hidden="true" />
    </>
  );
}
