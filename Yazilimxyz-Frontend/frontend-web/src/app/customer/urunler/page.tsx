"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";            // <-- NEW
import Accordion from "@/components/customer/Accordion";
import ProductCard from "@/components/customer/ProductCard";
import { fetchListFilter } from "@/lib/customerApi";
import { useLanguage } from "../context/LanguageContext";

export const translations = {
  tr: {
    brand_placeholder: "Marka ara...",
    size: "Beden",
    color: "Renk",
    gender: "Cinsiyet",
    price: "Fiyat",
    apply_filters: "Filtrele",
    applying: "Uygulanıyor...",
    min: "En az",
    max: "En çok",
    new_products: "Yeni Ürünler",
    male: "Erkek",
    female: "Kadın",
    unisex: "Unisex",
  },
  en: {
    brand_placeholder: "Search Brand...",
    size: "Size",
    color: "Color",
    gender: "Gender",
    price: "Price",
    apply_filters: "Apply Filters",
    applying: "Applying...",
    min: "Min",
    max: "Max",
    new_products: "New Products",
    male: "Men",
    female: "Women",
    unisex: "Unisex",
  },
} as const;


 

/* ================== Tipler ================== */
interface Product {
  id: number;
  name: string;
  description: string;
  basePrice: number;
  gender: number;        // 1: Erkek, 2: Kadın, 3: Unisex
  isActive: boolean;
  mainPhoto: string | null;
}
interface Brand { id: number; name: string; }
interface FilteredProps {
  brands: Brand[];
  colors: string[];
  genders: string[];
  sizes: string[];
  priceRange: { min: number; max: number };
}
interface ApiEnvelope<T> { data: T }

/* ================== Sabitler & Yardımcılar ================== */
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null;
const isString = (v: unknown): v is string => typeof v === "string";

const toNumber = (v: unknown): number =>
  typeof v === "number" && Number.isFinite(v) ? v :
  typeof v === "string" && v.trim() !== "" && Number.isFinite(Number(v)) ? Number(v) : NaN;

const getSafePrice = (obj: unknown): number => {
  if (!isRecord(obj)) return 0;
  const candidates = [obj.basePrice, obj.price, obj.unitPrice, obj.minPrice];
  const n = candidates.map(toNumber).find(Number.isFinite);
  return typeof n === "number" ? n : 0;
};

const COLOR_HEX: Record<string, string> = {
  kırmızı: "red", kirmizi: "red", mavi: "blue", lacivert: "navy",
  siyah: "black", beyaz: "white", yeşil: "green", yesil: "green",
  sarı: "yellow", sari: "yellow", mor: "purple", turuncu: "orange",
  pembe: "pink", gri: "gray", kahverengi: "brown", bej: "beige", bordo: "maroon",
  "açık gri": "#d3d3d3",
  "acik gri": "#d3d3d3",
  "açık mavi": "lightblue",
  "acik mavi": "lightblue",
};
const toCssColor = (c: string) => COLOR_HEX[c.trim().toLowerCase()] ?? c;

function normalizeProducts(json: unknown): Product[] {
  if (Array.isArray(json)) return (json as unknown[]).map((x) => sanitizeProduct(x));
  if (isRecord(json)) {
    if (Array.isArray(json.data)) return (json.data as unknown[]).map(sanitizeProduct);
    if (Array.isArray(json.items)) return (json.items as unknown[]).map(sanitizeProduct);
    if (Array.isArray(json.results)) return (json.results as unknown[]).map(sanitizeProduct);
    if (isRecord(json.data)) {
      const d = json.data as Record<string, unknown>;
      if (Array.isArray(d.items)) return (d.items as unknown[]).map(sanitizeProduct);
      if (Array.isArray(d.results)) return (d.results as unknown[]).map(sanitizeProduct);
    }
  }
  return [];
}
function sanitizeProduct(raw: unknown): Product {
  const r = isRecord(raw) ? raw : {};
  return {
    id: toNumber(r.id) || 0,
    name: isString(r.name) ? r.name : "",
    description: isString(r.description) ? r.description : "",
    basePrice: getSafePrice(raw),
    gender: toNumber(r.gender) || 0,
    isActive: Boolean(r.isActive),
    mainPhoto: isString(r.mainPhoto) ? r.mainPhoto : null,
  };
}

type WithArrayData<T> = { data: T[] };
const hasArrayData = <T,>(v: unknown): v is WithArrayData<T> =>
  isRecord(v) && Array.isArray((v as { data?: unknown }).data);

async function fetchMainImageUrl(productId: number): Promise<string | null> {
  try {
    const r1 = await fetch(`${API_BASE}/api/ProductImage/product/${productId}/main`, { cache: "no-store" });
    if (r1.ok) {
      const j1: unknown = await r1.json();
      if (isRecord(j1)) {
        const d = j1.data;
        if (isRecord(d) && isString(d.imageUrl)) return d.imageUrl;
        if (Array.isArray(j1.data) && j1.data.length > 0) {
          const first = j1.data[0];
          if (isRecord(first) && isString(first.imageUrl)) return first.imageUrl;
        }
      }
    }
  } catch {}
  try {
    const r2 = await fetch(`${API_BASE}/api/Product/${productId}/images`, { cache: "no-store" });
    if (r2.ok) {
      const j2: unknown = await r2.json();
      type ImageRow = { imageUrl: string; isMain?: boolean };
      let arr: ImageRow[] = [];
      if (hasArrayData<ImageRow>(j2)) arr = j2.data;
      if (!arr.length) return null;
      const main = arr.find((x) => x.isMain) ?? arr[0];
      return main?.imageUrl ?? null;
    }
  } catch {}
  return null;
}
async function enrichWithMainImages(list: Product[]): Promise<Product[]> {
  const enriched = await Promise.all(
    list.map(async (p) => {
      const img = await fetchMainImageUrl(p.id);
      return { ...p, mainPhoto: img ?? p.mainPhoto ?? null };
    })
  );
  return enriched;
}

/* ================== Sayfa ================== */
export default function UrunlerPage() {
  const searchParams = useSearchParams();                    // <-- NEW
  const initialCategoryId = Number(searchParams.get("categoryId")) || null; // <-- NEW

  // UI seçimleri
  const [selectedBrandIds, setSelectedBrandIds] = useState<number[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");

  // Data
  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<FilteredProps | null>(null);
  const [searchBrand, setSearchBrand] = useState("");
  const [searchColor, setSearchColor] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // İlk yüklemede filtreler + (varsa) kategoriye göre ürünler
  useEffect(() => {
    (async () => {
      try {
        const f = await fetchListFilter();
        setFiltered(f);

        // NEW: URL'de categoryId varsa Filter endpointine gidiyoruz
        if (initialCategoryId && Number.isFinite(initialCategoryId)) {
          const qs = new URLSearchParams();
          qs.set("CategoryId", String(initialCategoryId));
          qs.set("IncludeSubCategories", "true");
          qs.set("Page", "1");
          qs.set("PageSize", "24");

          const r = await fetch(`${API_BASE}/api/Product/Filter?${qs.toString()}`, { method: "POST" });
          const j: unknown = await r.json();
          const list = normalizeProducts(j);
          const withImages = await enrichWithMainImages(list);
          setProducts(withImages);
        } else {
          // kategori yoksa tüm ürünler
          const r = await fetch(`${API_BASE}/api/Product/get-all`, { cache: "no-store" });
          const j: unknown = await r.json();
          const list = normalizeProducts(j);
          const withImages = await enrichWithMainImages(list);
          setProducts(withImages);
        }
      } catch {
        setProducts([]);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCategoryId]); // NEW: URL değişirse tekrar uygula

  // Arama ile filtrelenmiş seçenekler
  const brandList = useMemo(() => {
    const all = filtered?.brands ?? [];
    return searchBrand
      ? all.filter((b) => b.name.toLowerCase().includes(searchBrand.toLowerCase()))
      : all;
  }, [filtered?.brands, searchBrand]);

  const colorList = useMemo(() => {
    const all = filtered?.colors ?? [];
    return searchColor
      ? all.filter((c) => c.toLowerCase().includes(searchColor.toLowerCase()))
      : all;
  }, [filtered?.colors, searchColor]);

  // Toggle yardımcıları
  const toggleId = (list: number[], id: number, set: (v: number[]) => void) =>
    set(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  const toggleStr = (list: string[], val: string, set: (v: string[]) => void) =>
    set(list.includes(val) ? list.filter((x) => x !== val) : [...list, val]);

  // =========== FİLTRE UYGULA =========== //
  const handleApplyFilters = async () => {
    try {
      setIsLoading(true);

      const qs = new URLSearchParams();
      selectedBrandIds.forEach((id) => qs.append("MerchantIds", String(id)));
      selectedSizes.forEach((s) => qs.append("Sizes", s));
      selectedColors.forEach((c) => qs.append("Colors", c));

      // NEW: Genders'ı string gönderiyoruz (backend kadin/erkek/unisex anlıyor)
      selectedGenders.forEach((g) => qs.append("Genders", g.toLowerCase()));

      if (minPrice) qs.set("MinPrice", minPrice);
      if (maxPrice) qs.set("MaxPrice", maxPrice);

      // NEW: URL'den gelen kategori varsa onu da koru
      if (initialCategoryId && Number.isFinite(initialCategoryId)) {
        qs.set("CategoryId", String(initialCategoryId));
        qs.set("IncludeSubCategories", "true");
      }

      qs.set("Page", "1");
      qs.set("PageSize", "24");

      const url = `${API_BASE}/api/Product/Filter?${qs.toString()}`;
      const resp = await fetch(url, { method: "POST" });
      if (!resp.ok) throw new Error(`Filter failed: ${resp.status}`);

      const json: unknown = await resp.json();
      let list = normalizeProducts(json);

      // NaN fiyatları engelle
      list = list.map((p) => ({ ...p, basePrice: getSafePrice(p) }));

      const withImages = await enrichWithMainImages(list);
      setProducts(withImages);
    } catch {
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

   const { lang, changeLang,t } = useLanguage();

  return (
     <section className="container p-0 m-0">
      <div className="flex flex-col md:flex-row">
        {/* ================= Sol Filtre ================= */}
        <div className="w-full md:w-1/5">
          <Accordion title={t("brand_placeholder")}>
            <div className="flex flex-col gap-2">
              <input
                type="text"
                placeholder={t("brand_placeholder")}
                value={searchBrand}
                onChange={(e) => setSearchBrand(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
              />
              {(filtered?.brands ?? []).map((b) => (
                <label key={b.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedBrandIds.includes(b.id)}
                    onChange={() => toggleId(selectedBrandIds, b.id, setSelectedBrandIds)}
                    className="accent-gray-600 w-4 h-4"
                  />
                  <span className="text-sm text-gray-700">{b.name}</span>
                </label>
              ))}
            </div>
          </Accordion>

          <Accordion title={t("size")}>
            <div className="flex flex-col gap-2">
              {(filtered?.sizes ?? []).map((s) => (
                <label key={s} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedSizes.includes(s)}
                    onChange={() => toggleStr(selectedSizes, s, setSelectedSizes)}
                    className="accent-gray-600 w-4 h-4"
                  />
                  <span className="text-sm text-gray-700">{s}</span>
                </label>
              ))}
            </div>
          </Accordion>

          <Accordion title={t("color")}>
            <div className="flex flex-col gap-2">
              {(filtered?.colors ?? []).map((c) => (
                <label key={c} className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={selectedColors.includes(c)}
                    onChange={() => toggleStr(selectedColors, c, setSelectedColors)}
                    className="accent-gray-600 w-4 h-4"
                  />
                  <span className="text-sm text-gray-700">{c}</span>
                </label>
              ))}
            </div>
          </Accordion>

          <Accordion title={t("gender")}>
            <div className="flex flex-col gap-2">
              {["Erkek", "Kadın", "Unisex"].map((g) => {
                const label = g === "Erkek" ? t("male") : g === "Kadın" ? t("female") : t("unisex");
                return (
                  <label key={g} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedGenders.includes(g)}
                      onChange={() => toggleStr(selectedGenders, g, setSelectedGenders)}
                      className="accent-gray-600 w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">{label}</span>
                  </label>
                );
              })}
            </div>
          </Accordion>

          <Accordion title={t("price")}>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="number"
                  placeholder={t("min")}
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-1 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
                />
                <span>-</span>
                <input
                  type="number"
                  placeholder={t("max")}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-1 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
                />
              </div>
            </div>
          </Accordion>

          <button
            onClick={() => {}}
            disabled={false}
            className="w-full bg-black text-white rounded-md py-2 mt-4 hover:bg-gray-700 disabled:opacity-60"
          >
            {t("apply_filters")}
          </button>
        </div>

        {/* ================= Ürün Grid ================= */}
        <div className="w-4/5 mt-6 md:mt-0 ml-12">
          <div className="heading-lg-3 mb-4">{t("new_products")}</div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-0">
            {(products ?? []).map((p) => (
              <ProductCard
                key={p.id}
                product={{
                  id: p.id,
                  name: p.name,
                  description: p.description,
                  basePrice: p.basePrice,
                  gender: p.gender,
                  isActive: p.isActive,
                  mainPhoto: p.mainPhoto ?? "",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
