"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { API_BASE, fetchListProductDetail } from "@/lib/customerApi";
import { addCartItem } from "@/lib/cartApi";

/* ============== Types ============== */
type ColorCell = { color: string; stock: number; variantId?: number };
type SizeRow = { size: string; sizeTotalStock: number; colors: ColorCell[] };

interface ProductDetail {
  id: number;
  name: string;
  description: string;
  gender: string;
  categoryName: string;
  price: number;
  isActive: boolean;
  images: string[];
  availableSizes: string[];
  availableColors: string[];
  sizeColorMatrix: SizeRow[];
}

interface ProductVariantRow {
  id: number;          // ProductVariants.Id
  productId: number;
  size: string;
  color: string;
  stock?: number | null;
}

/* ============== Helpers ============== */
const trLower = (s: string) => s.trim().toLocaleLowerCase("tr-TR");
const sameStr = (a: string, b: string) => trLower(a) === trLower(b);

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}
function isVariantRow(v: unknown): v is ProductVariantRow {
  return (
    isRecord(v) &&
    typeof v.id === "number" &&
    typeof v.productId === "number" &&
    typeof v.size === "string" &&
    typeof v.color === "string"
  );
}
function parseVariantList(json: unknown): ProductVariantRow[] {
  if (Array.isArray(json)) return json.filter(isVariantRow);
  if (isRecord(json) && Array.isArray((json as { data?: unknown }).data)) {
    return ((json as { data: unknown }).data as unknown[]).filter(isVariantRow);
  }
  return [];
}

const COLOR_MAP: Record<string, string> = {
  siyah:"#000", beyaz:"#fff", lacivert:"#000080", mavi:"#1E90FF", "açık mavi":"#ADD8E6",
  "koyu mavi":"#00008B", kırmızı:"#f00", bordo:"#800020", yeşil:"#008000", zümrüt:"#50C878",
  mint:"#98FF98", gri:"#808080", "açık gri":"#D1D5DB", füme:"#4B5563", antrasit:"#374151",
  bej:"#F5F5DC", kahverengi:"#8B4513", krem:"#FFFDD0", mor:"#800080", lila:"#C8A2C8",
  pembe:"#FFC0CB", turuncu:"#FFA500", sarı:"#FFD200", altın:"#D4AF37", gümüş:"#C0C0C0",
  black:"#000", white:"#fff", navy:"#000080", blue:"#1E90FF", red:"#f00", green:"#008000",
  gray:"#808080", "light gray":"#D1D5DB", beige:"#F5F5DC", brown:"#8B4513", purple:"#800080",
  pink:"#FFC0CB", orange:"#FFA500", gold:"#D4AF37", silver:"#C0C0C0",
};
const isHex = (v: string) => /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v.trim());
const isFn = (v: string) => /^(rgba?|hsla?)\(/i.test(v.trim());
function toCssColor(raw: string): string {
  const k = trLower(raw);
  if (isHex(k) || isFn(k)) return k;
  return COLOR_MAP[k] ?? "#e5e7eb";
}
function needsDarkBorder(cssColor: string): boolean {
  const hex = isHex(cssColor) ? cssColor : "#ffffff";
  const c = hex.replace("#", "");
  if (!isHex(`#${c}`)) return false;
  const r = parseInt(c.length===3 ? c[0]+c[0] : c.slice(0,2),16);
  const g = parseInt(c.length===3 ? c[1]+c[1] : c.slice(2,4),16);
  const b = parseInt(c.length===3 ? c[2]+c[2] : c.slice(4,6),16);
  const y = 0.2126*r + 0.7152*g + 0.0722*b;
  return y > 200;
}

/* Beden sıralama */
const SIZE_ORDER: Record<string, number> = {
  xxs:0, xs:1, s:2, m:3, l:4, xl:5, xxl:6, "3xl":7, "4xl":8, "tek beden":1000
};
function sizeRank(s: string): number {
  const k = trLower(s);
  const num = parseInt(k, 10);
  if (!Number.isNaN(num)) return 200 + num;
  if (SIZE_ORDER[k] !== undefined) return SIZE_ORDER[k];
  if (k.includes("/")) {
    const parts = k.split("/").map(p => sizeRank(p));
    return Math.round(parts.reduce((a,b)=>a+b,0)/parts.length);
  }
  return 9999;
}

/* Matriste (size+color) → variantId (varsa en hızlı) */
function variantIdFromMatrix(matrix: SizeRow[], size: string, color: string): number | null {
  const row = matrix.find(x => sameStr(x.size, size));
  if (!row) return null;
  const cell = row.colors.find(c => sameStr(c.color ?? "", color ?? ""));
  const vId = cell?.variantId;
  return typeof vId === "number" ? vId : null;
}

/* Swagger’a göre: /api/ProductVariants/by-product/{productId} */
async function fetchVariantsByProduct(productId: number): Promise<ProductVariantRow[]> {
  const url = `${API_BASE}/api/ProductVariants/by-product/${productId}`;
  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) return [];
  const j: unknown = await r.json();
  return parseVariantList(j);
}

/* ============== Page ============== */
export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);
  const router = useRouter();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [qty, setQty] = useState<number>(1);
  const [adding, setAdding] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchListProductDetail(productId);
        setProduct(data);
      } catch (e) {
        console.error(e);
        setProduct(null);
      }
    })();
  }, [productId]);

  const outOfStockColors = useMemo(() => {
    if (!product || !selectedSize) return new Set<string>();
    const row = product.sizeColorMatrix.find((x) => x.size === selectedSize);
    const s = new Set<string>();
    if (!row) return s;
    row.colors.forEach((c) => { if (c.stock <= 0) s.add(c.color); });
    return s;
  }, [product, selectedSize]);

  const sortedSizes = useMemo(
    () => [...(product?.availableSizes ?? [])].sort((a, b) => sizeRank(a) - sizeRank(b)),
    [product?.availableSizes]
  );

  /* Sepete Ekle */
  const handleAddToCart = async () => {
    if (!product) return;

    // 1) beden zorunlu
    if (!selectedSize) {
      alert("Lütfen beden seçiniz.");
      return;
    }

    // 2) renk – tek renkse otomatik, çoksa seçtir
    const colors = product.availableColors ?? [];
    let colorToUse = selectedColor;
    if (!colorToUse) {
      if (colors.length === 1) {
        colorToUse = colors[0];
        setSelectedColor(colors[0]);
      } else if (colors.length > 1) {
        alert("Lütfen renk seçiniz.");
        return;
      }
    }

    // 3) variantId: önce matrix, yoksa by-product listesi
    let variantId = variantIdFromMatrix(product.sizeColorMatrix, selectedSize, colorToUse || "");
    if (!variantId) {
      const list = await fetchVariantsByProduct(product.id);
      const hit = list.find(v => sameStr(v.size, selectedSize) && sameStr(v.color, colorToUse || ""));
      variantId = hit?.id ?? null;
    }

    if (!variantId) {
      alert("Varyant bulunamadı. Lütfen beden/renk seçiminizi kontrol edin.");
      return;
    }

    // 4) sepete gönder
    setAdding(true);
    try {
      await addCartItem({ productVariantId: variantId, quantity: qty });
      router.push("/customer/sepetim");
    } catch (e) {
      console.error(e);
      alert("Sepete eklenemedi.");
    } finally {
      setAdding(false);
    }
  };

  if (!product) return <div className="max-w-5xl mx-auto p-6">Yükleniyor…</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 flex flex-col md:flex-row gap-8">
      {/* Images */}
  <div className="flex-1">
  <div className="grid gap-4">
    {product.images?.[0] && (
      <img
        src={`${API_BASE}${product.images[0]}`}
        alt={product.description}
        width={500}
        height={600}
        className="rounded object-cover h-[500px]"
      />
    )}
    {product.images?.length > 1 && (
      <div className="flex gap-4">
        {product.images.slice(1).map((img, index) => (
          <img
            key={index}
            src={img ? `${API_BASE}${img}` : "/placeholder-image.jpg"}
            alt={product.description}
            width={100}
            height={100}
            className="rounded object-cover w-36 h-40"
          />
        ))}
      </div>
    )}
  </div>
</div>


      {/* Info */}
      <div className="flex-1 flex flex-col gap-4">
        <h1 className="text-3xl font-bold">{product.name}</h1>
        <p className="text-xl font-semibold text-green-700">
          {product.price.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
        </p>

        {/* Renk */}
        <div>
          <h2 className="font-semibold mb-1">Renk Seçenekleri</h2>
          <div className="flex gap-3">
            {(product.availableColors ?? []).map((rawColor) => {
              const cssColor = toCssColor(rawColor);
              const isSelected = selectedColor === rawColor;
              const disabled = outOfStockColors.has(rawColor);
              const darkBorder = needsDarkBorder(cssColor);

              return (
                <button
                  key={rawColor}
                  onClick={() => { if (!disabled) setSelectedColor(isSelected ? "" : rawColor); }}
                  className={[
                    "w-8 h-8 rounded-full border-2 cursor-pointer transition",
                    isSelected ? "ring-2 ring-offset-2 ring-black" : "",
                    disabled ? "opacity-40 cursor-not-allowed" : "hover:scale-105",
                  ].join(" ")}
                  style={{
                    backgroundColor: cssColor,
                    borderColor: isSelected ? "#111827" : (darkBorder ? "#374151" : "#D1D5DB"),
                  }}
                  aria-label={`Renk ${rawColor}`}
                  title={rawColor}
                />
              );
            })}
          </div>
        </div>

        {/* Beden */}
        <div>
          <h2 className="font-semibold mb-1 mt-4">Beden Seçimi</h2>
          <select
            value={selectedSize}
            onChange={(e) => setSelectedSize(e.target.value)}
            className="border border-gray-300 rounded px-4 py-2 w-full max-w-xs"
          >
            <option value="">Beden Seç</option>
            {sortedSizes.map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>

        {/* Adet */}
        <div>
          <h2 className="font-semibold mb-1 mt-4">Adet</h2>
          <select
            value={qty}
            onChange={(e) => setQty(Number(e.target.value))}
            className="border border-gray-300 rounded px-4 py-2 w-full max-w-xs"
          >
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>

        {/* Sepete Ekle */}
        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={handleAddToCart}
            disabled={adding || !selectedSize}
            className="bg-black text-white py-3 px-5 rounded font-semibold w-40 hover:bg-gray-800 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
          >
            {adding ? "Ekleniyor…" : "Sepete Ekle"}
          </button>
        </div>

        {/* Açıklama */}
        <div className="mt-8 text-sm text-gray-700 space-y-4 max-w-lg">
          <div>
            <h3 className="font-semibold">Ürün Özellikleri</h3>
            <p>{product.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
