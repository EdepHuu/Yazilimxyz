"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FavoriteGrayIcon } from "@/components/customer/icons/icon";
import { API_BASE } from "@/lib/customerApi";

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

// Güvenli TL formatlayıcı (NaN/undefined gelmez)
const formatTL = (v: number) => {
  const n = typeof v === "number" && Number.isFinite(v) ? v : 0;
  return `₺ ${n.toLocaleString("tr-TR")}`;
};

function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();

  const handleAddToCart = () => {
    // sepet akışı henüz entegrasyon aşamasında, yönlendiriyoruz
    router.push("/customer/sepetim");
  };

  const imageUrl = product.mainPhoto
    ? `${API_BASE}${product.mainPhoto}`
    : "/placeholder-image.jpg";

  return (
    <div className="group flex flex-col p-2">
      <Link href={`/customer/urunDetay/${product.id}`}>
        <div className="overflow-hidden">
          {/* Not: Next <Image> yerine <img> kullanımı bilinçli, mevcut yapıyı bozmayalım */}
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
          className="w-full bg-black text-white text-sm py-2 rounded-md hover:bg-gray-800 transition-colors"
        >
          Sepete Ekle
        </button>
      </div>
    </div>
  );
}

export default ProductCard;
