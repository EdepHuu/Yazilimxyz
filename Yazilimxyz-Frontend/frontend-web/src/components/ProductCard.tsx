// components/ProductCard.tsx
import { FavoriteGrayIcon } from "@/icons/icon";
import React from "react";

type Product = {
  title: string;
  colors: string;
  price: number;
  image: string;
};

type ProductCardProps = {
  product: Product;
};

function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="overflow-hidden">
      <img
        src={product.image}
        alt={product.title}
        className="w-full h-[442px] object-fill"
      />

      <div className="flex justify-between items-center p-4">
        <div>
          <h2 className="heading-sm-1 mb-1">{product.title}</h2>
          <p className="heading-sm-1 text-main-gray  mb-1">{product.colors}</p>
          <p className="heading-sm-1">{product.price} TL</p>
        </div>

        <div className="ml-4">
          <FavoriteGrayIcon />
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
