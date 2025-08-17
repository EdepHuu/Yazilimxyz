"use client";

import { FavoriteGrayIcon } from "@/components/customer/icons/icon";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { API_BASE } from "@/lib/customerApi";

interface Product {
  id: number;
  name: string;
  description: string;
  basePrice: number;
  gender: number;
  isActive: boolean;
  mainPhoto: string;
}

type ProductCardProps = {
  product: Product;
};

function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();

  const handleAddToCart = () => {
    const itemToAdd = {
      id: product.id,
      title: product.name,
      image: product.mainPhoto,
      price: product.basePrice,
      color: "Mevcut Renk",
      size: "M",
    };
    router.push("/customer/sepetim");
  };

  return (
    <div className="group flex flex-col p-2">
      <Link href={`/customer/urunDetay/${product.id}`}>
        <div className="overflow-hidden">
          {/* <Image
            src={
              product.mainPhoto
                ? `${API_BASE}${product.mainPhoto}`
                : "/placeholder-image.jpg"
            }
            alt={product.name}
            width={442}
            height={442}
            className="w-full h-[320px] object-fill"
          /> */}

          <div className="flex justify-between items-center p-2">
            <div>
              <h2 className="heading-sm-1 mb-1 truncate w-36 h-6">
                {product.name}
              </h2>
              {/* <p className="heading-sm-1 text-main-gray mb-1">
                {product.colors}
              </p> */}
              <p className="heading-sm-3 text-black mb-1">
                {product.basePrice}
              </p>
            </div>

            <div className="">
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
