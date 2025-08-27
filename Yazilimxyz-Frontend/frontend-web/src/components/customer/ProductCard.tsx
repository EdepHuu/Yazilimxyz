"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FavoriteGrayIcon } from "@/components/customer/icons/icon";
import { API_BASE, fetchListProductDetail } from "@/lib/customerApi";
import { addCartItem } from "@/lib/cartApi";
import { useLanguage } from "@/app/customer/context/LanguageContext";


/* ================= Types ================= */
interface Product {
  id: number;
  name: string;
  description: string;
  basePrice: number;
  gender: number;
  isActive: boolean;
  mainPhoto: string; // boş string gelebilir
}

type ProductCardProps = {
  product: Product;
};

type ProductDetail = {
  id: number;
  sizeColorMatrix: {
    size: string;
    sizeTotalStock?: number;
    colors: Array<{ color: string; stock: number; variantId?: number }>;
  }[];
};

/* ============= Helpers ============= */
const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null;

const formatTL = (v: number) => {
  const n = typeof v === "number" && Number.isFinite(v) ? v : 0;
  return `₺ ${n.toLocaleString("tr-TR")}`;
};

function buildImageUrl(src: string): string {
  return src && src.trim() ? `${API_BASE}${src}` : "/placeholder-image.jpg";
}

function extractVariantId(json: unknown): number | null {
  if (!isRecord(json)) return null;
  const d = (json as { data?: unknown }).data;
  if (typeof d === "number") return d;
  if (isRecord(d) && typeof (d as { variantId?: unknown }).variantId === "number") {
    return (d as { variantId: number }).variantId;
  }
  return null;
}

/**
 * Ürün kartından hızlıca kullanılabilir (stoklu) bir variantId bul.
 * 1) Olası hızlı uçlar (varsa) -> data:{variantId} veya data:number
 * 2) Fallback: ürün detayını çek, sizeColorMatrix içinden stoklu ve variantId'li ilk rengi bul
 * Bulunamazsa null döner (detaya yönlendiririz).
 */
async function getQuickVariantId(productId: number): Promise<number | null> {
  const candidates = [
    `${API_BASE}/api/Product/${productId}/first-available-variant`,
    `${API_BASE}/api/ProductVariant/product/${productId}/first-available`,
    `${API_BASE}/api/ProductVariant/first-available?productId=${productId}`,
  ];

  for (const url of candidates) {
    try {
      const r = await fetch(url, { cache: "no-store" });
      if (!r.ok) continue;
      const j: unknown = await r.json();
      const vId = extractVariantId(j);
      if (typeof vId === "number") return vId;
    } catch {
      /* yoksay ve diğerine dene */
    }
  }

  // Fallback: detaydan matrisi tara
  try {
    const detail = (await fetchListProductDetail(productId)) as ProductDetail;
    for (const row of detail.sizeColorMatrix ?? []) {
      const hit = (row.colors ?? []).find(
        (c) => (c?.stock ?? 0) > 0 && typeof c.variantId === "number"
      );
      if (hit && typeof hit.variantId === "number") return hit.variantId;
    }
  } catch {
    /* yoksay */
  }

  return null;
}

/* ============= Component ============= */
function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const [adding, setAdding] = React.useState(false);

  const imageUrl = buildImageUrl(product.mainPhoto);

  const handleAddToCart = async () => {
    if (adding) return;
    setAdding(true);
    try {
      const variantId = await getQuickVariantId(product.id);

      // Varyantı karta özel bulamazsak detaya yönlendir (beden/renk seçimi için)
      if (variantId == null) {
        router.push(`/customer/urunDetay/${product.id}`);
        return;
      }

      await addCartItem({ productVariantId: variantId, quantity: 1 });
      router.push("/customer/sepetim");
    } catch (e) {
      console.error(e);
      alert("Sepete eklenemedi.");
    } finally {
      setAdding(false);
    }
  };

   const { t } = useLanguage(); 

  return (
    <div className="group flex flex-col p-2">
      <Link href={`/customer/urunDetay/${product.id}`}>
        <div className="overflow-hidden">
          {/* Not: Next <Image> yerine <img> kullanımı korunuyor */}
          <img
            src={imageUrl}
            alt={product.name}
            width={442}
            height={442}
            className="w-full h-[320px] object-cover"
          />

          <div className="flex justify-between items-center p-2">
            <div>
              <h2 className="heading-sm-1 mb-1 truncate w-36 h-6">
                {product.name}
              </h2>
              <p className="heading-sm-3 text-black mb-1">
                {formatTL(product.basePrice)}
              </p>
            </div>

            <div>
              <FavoriteGrayIcon />
            </div>
          </div>
        </div>
      </Link>

      <div className="p-2">
        <button
          onClick={handleAddToCart}
          disabled={adding}
          className="w-full bg-black text-white text-sm py-2 rounded-md hover:bg-gray-800 transition-colors disabled:opacity-60"
        >
           {adding ? t("adding") : t("add_basket")}
        </button>
      </div>
    </div>
  );
}

export default ProductCard;
