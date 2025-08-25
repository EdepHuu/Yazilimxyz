"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { API_BASE, fetchListProductDetail } from "@/lib/customerApi";

/* ================= Types ================= */
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
  sizeColorMatrix: {
    size: string;
    sizeTotalStock: number;
    colors: { color: string; stock: number }[];
  }[];
}

/* ===== Helpers: renk eşleme & kontrast ===== */
const COLOR_MAP: Record<string, string> = {
  "siyah": "#000000", "beyaz": "#FFFFFF", "lacivert": "#000080", "mavi": "#1E90FF",
  "açık mavi": "#ADD8E6", "koyu mavi": "#00008B", "kırmızı": "#FF0000", "bordo": "#800020",
  "yeşil": "#008000", "zümrüt": "#50C878", "mint": "#98FF98", "gri": "#808080",
  "açık gri": "#D1D5DB", "füme": "#4B5563", "antrasit": "#374151", "bej": "#F5F5DC",
  "kahverengi": "#8B4513", "krem": "#FFFDD0", "mor": "#800080", "lila": "#C8A2C8",
  "pembe": "#FFC0CB", "turuncu": "#FFA500", "sarı": "#FFD200", "altın": "#D4AF37",
  "gümüş": "#C0C0C0", "çok renkli": "#e5e7eb", "şeffaf": "transparent",
  "black":"#000000","white":"#FFFFFF","navy":"#000080","blue":"#1E90FF",
  "dark blue":"#00008B","red":"#FF0000","green":"#008000","gray":"#808080",
  "light gray":"#D1D5DB","beige":"#F5F5DC","brown":"#8B4513","purple":"#800080",
  "pink":"#FFC0CB","orange":"#FFA500","gold":"#D4AF37","silver":"#C0C0C0",
};
const isHex = (v: string) => /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v.trim());
const isFn  = (v: string) => /^(rgba?|hsla?)\(/i.test(v.trim());
function toCssColor(raw: string): string {
  if (!raw) return "#e5e7eb";
  const k = raw.trim().toLowerCase();
  if (isHex(k) || isFn(k)) return k;
  return COLOR_MAP[k] ?? (/^[a-z\s]+$/.test(k) ? k : "#e5e7eb");
}
function needsDarkBorder(cssColor: string): boolean {
  const hex = isHex(cssColor) ? cssColor : "#ffffff";
  const c = hex.replace("#", "");
  if (!isHex(`#${c}`)) return false;
  const r = parseInt(c.length===3 ? c[0]+c[0] : c.slice(0,2),16);
  const g = parseInt(c.length===3 ? c[1]+c[1] : c.slice(2,4),16);
  const b = parseInt(c.length===3 ? c[2]+c[2] : c.slice(4,6),16);
  const y = 0.2126*r + 0.7152*g + 0.0722*b;
  return y > 200; // çok açık renklerde koyu kenarlık
}

/* ===== Helpers: beden sıralama (küçük → büyük) ===== */
const SIZE_ORDER: Record<string, number> = {
  "xxs": 0, "xs": 1, "s": 2, "m": 3, "l": 4, "xl": 5, "xxl": 6, "3xl": 7, "4xl": 8, "tek beden": 1000
};
function sizeRank(s: string): number {
  const k = s.trim().toLowerCase();
  const num = parseInt(k, 10);               // 34, 36, 38...
  if (!Number.isNaN(num)) return 200 + num;  // metinsel bedenlerden sonra doğal artış
  if (SIZE_ORDER[k] !== undefined) return SIZE_ORDER[k];
  if (k.includes("/")) {                     // L/XL gibi
    const parts = k.split("/").map(p => sizeRank(p));
    return Math.round(parts.reduce((a,b)=>a+b,0)/parts.length);
  }
  return 9999;
}

/* ================= Page ================= */
export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = Number(params.id);

  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [qty, setQty] = useState<number>(1);
  const [productDetail, setProductDetail] = useState<ProductDetail[]>([]);

  const { addToCart } = useCart();

  useEffect(() => {
    (async () => {
      try {
        const fetched = await fetchListProductDetail(productId);
        setProductDetail([fetched]);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [productId]);

  if (!productDetail || productDetail.length === 0) {
    return <div>Yükleniyor...</div>;
  }

  const product = productDetail.find((p) => p.id === productId);
  if (!product) return <div>Ürün bulunamadı.</div>;

  // seçilen bedene göre stokta olmayan renkleri pasifleştir (hook değil → kural hatası yok)
  const outOfStockColors: Set<string> = (() => {
    if (!selectedSize) return new Set<string>();
    const row = product.sizeColorMatrix.find(x => x.size === selectedSize);
    const s = new Set<string>();
    if (!row) return s;
    row.colors.forEach(c => { if (c.stock <= 0) s.add(c.color); });
    return s;
  })();

      const handleBuyNow = () => {
      if (!selectedSize) {
        alert("Lütfen beden seçiniz.");
        return;
      }
      router.push("/customer/odeme"); // ödeme sayfasına git
    };


  const sortedSizes = [...product.availableSizes].sort((a,b)=> sizeRank(a) - sizeRank(b));

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert("Lütfen beden seçiniz.");
      return;
    }
    // addToCart(...) // entegrasyon hazır olunca
    router.push("/customer/sepetim");
  };

  return (
    <div className="max-w-5xl mx-auto p-6 flex flex-col md:flex-row gap-8">
      {/* Images */}
      <div className="flex-1">
        <div className="grid gap-4">
          {product.images.map((img, index) => (
            <img
              key={index}
              src={img ? `${API_BASE}${img}` : "/placeholder-image.jpg"}
              alt={product.description}
              width={500}
              height={600}
              className={`rounded object-cover ${index === 0 ? "w-full h-[500px]" : "w-50 h-52"}`}
            />
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 flex flex-col gap-4">
        <h1 className="text-3xl font-bold">{product.name}</h1>
        <p className="text-xl font-semibold text-green-700">
          {product.price.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
        </p>

          {/* Renk Seçenekleri */}
          <div>
            <h2 className="font-semibold mb-1">Renk Seçenekleri</h2>
            <div className="flex gap-3">
              {product.availableColors.map((rawColor) => {
                const cssColor = toCssColor(rawColor);
                const isSelected = selectedColor === rawColor;
                const disabled = outOfStockColors.has(rawColor);
                const darkBorder = needsDarkBorder(cssColor);

                return (
                  <button
                    key={rawColor}
                    onClick={() => {
                      if (disabled) return;
                      // aynı renge tekrar tıklanırsa seçimi kaldır
                      if (isSelected) {
                        setSelectedColor("");
                      } else {
                        setSelectedColor(rawColor);
                      }
                    }}
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

        {/* Butonlar */}
        <div className="mt-6 flex items-center gap-3">
          {/* Sepete Ekle (küçük, siyah – önceki tasarımın aynısı) */}
          <button
            onClick={handleAddToCart}
            disabled={!selectedSize}
            className="bg-black text-white py-3 px-5 rounded font-semibold w-40 hover:bg-gray-800 cursor-pointer disabled:cursor-not-allowed"
          >
            Sepete Ekle
          </button>

          {/* Şimdi Satın Al (aynı tasarım, yan yana) */}
          <button
            onClick={handleBuyNow}
            disabled={!selectedSize}
            className="bg-black text-white py-3 px-5 rounded font-semibold w-44 hover:bg-gray-800 cursor-pointer disabled:cursor-not-allowed"
          >
            Şimdi Satın Al
          </button>
        </div>

        {/* Açıklama (aynı) */}
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
