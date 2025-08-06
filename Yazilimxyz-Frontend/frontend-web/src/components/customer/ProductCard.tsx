"use client";

import { FavoriteGrayIcon } from "@/components/customer/icons/icon";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

type Product = {
  id: number;
  title: string;
  colors: string;
  price: number;
  image: string;
};

type ProductCardProps = {
  product: Product;
};

function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();

  const handleAddToCart = () => {
    const itemToAdd = {
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      color: "Mevcut Renk",
      size: "M",
    };
    router.push("/customer/sepetim");
  };

  return (
    <div className="group flex flex-col p-2">
      <Link href={`/customer/urunDetay/${product.id}`}>
        <div className="overflow-hidden">
          <Image
            src={product.image}
            alt={product.title}
            width={442}
            height={442}
            className="w-full h-[320px] object-fill"
          />

          <div className="flex justify-between items-center p-4">
            <div>
              <h2 className="heading-sm-1 mb-1 truncate w-32 h-6">
                {product.title}
              </h2>
              <p className="heading-sm-1 text-main-gray mb-1">
                {product.colors}
              </p>
            </div>

            <div className="ml-4">
              <FavoriteGrayIcon />
            </div>
          </div>
        </div>
      </Link>

      <div className="px-4 py-2">
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
