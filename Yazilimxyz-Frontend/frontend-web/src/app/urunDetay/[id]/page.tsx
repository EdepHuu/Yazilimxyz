"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
const products = [
  {
    id: 1,
    title: "Loose Straight Jean",
    price: 1000,
    colors: ["#ADD8E6", "#00008B"],
    sizes: ["XS", "S", "M", "L", "XL"],
    description: {
      features: "Denim koleksiyonundan Jane Classic Denim Puslu Açık Mavi Jean Pantolon. Normal bel, düz kesim, düz paça...",
      fabric: "%100 Pamuk",
      model: "Boy: 176 cm / Bel: 59 cm / Göğüs: 84 cm / Kalça: 90 cm",
      code: "8670669685566-05",
    },
    image: "/product-img-1.jpg",
  },
  {
    id: 2,
    title: "Loose Straight Jean",
    price: 1050,
    colors: ["#00008B"],
    sizes: ["S", "M", "L", "XL"],
    description: {
      features: "Farklı özellikler, Koyu mavi denim.",
      fabric: "%98 Pamuk, %2 Elastan",
      model: "Boy: 176 cm / Bel: 59 cm / Göğüs: 84 cm / Kalça: 90 cm",
      code: "8670669685566-06",
    },
    image: "/product-img-2.jpg",
  },
  {
    id: 3,
    title: "Siyah Deri Kol Çantası",
    price: 980,
    colors: ["#000000"],
    sizes: ["Tek Beden"],
    description: {
      features: "Siyah, şık deri kol çantası.",
      fabric: "%100 Deri",
      model: "Model boy bilgisi yok.",
      code: "ÇNT-SYH-01",
    },
    image: "/product-img-3.jpg",
  },
  {
    id: 4,
    title: "Kırmızı Güneş Gözlüğü",
    price: 1100,
    colors: ["#FF0000"],
    sizes: ["Tek Beden"],
    description: {
      features: "Kırmızı çerçeveli, modern güneş gözlüğü.",
      fabric: "Plastik, UV korumalı cam.",
      model: "Model boy bilgisi yok.",
      code: "GZL-KRM-02",
    },
    image: "/product-img-4.jpg",
  },
  {
    id: 5,
    title: "Turuncu Sweatshirt",
    price: 950,
    colors: ["#FFA500"],
    sizes: ["S", "M", "L"],
    description: {
      features: "Rahat kesim, turuncu sweatshirt.",
      fabric: "%80 Pamuk, %20 Polyester",
      model: "Model boy bilgisi yok.",
      code: "SWT-TRN-03",
    },
    image: "/product-img-5.jpg",
  },
  {
    id: 6,
    title: "Lacivert Pileli Uzun Etek",
    price: 1020,
    colors: ["#000080"],
    sizes: ["36", "38", "40"],
    description: {
      features: "Pileli, lacivert uzun etek.",
      fabric: "%100 Polyester",
      model: "Model boy bilgisi yok.",
      code: "ETK-LVR-04",
    },
    image: "/product-img-6.jpg",
  },
  {
    id: 7,
    title: "Beyaz Spor Ayakkabı",
    price: 1080,
    colors: ["#FFFFFF"],
    sizes: ["37", "38", "39", "40"],
    description: {
      features: "Beyaz, rahat spor ayakkabı.",
      fabric: "Deri, Kauçuk taban.",
      model: "Model boy bilgisi yok.",
      code: "AYK-BYZ-05",
    },
    image: "/product-img-7.jpg",
  },
  {
    id: 8,
    title: "Oversize Bej Kaban",
    price: 990,
    colors: ["#F5F5DC"],
    sizes: ["S", "M", "L"],
    description: {
      features: "Oversize kesim, bej kaban.",
      fabric: "%70 Yün, %30 Polyester",
      model: "Model boy bilgisi yok.",
      code: "KBN-BEJ-06",
    },
    image: "/product-img-8.jpg",
  },
];

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();

  const productId = Number(params.id);
  const product = products.find((p) => p.id === productId);

  const [selectedColor, setSelectedColor] = React.useState(product?.colors[0] || "");
  const [selectedSize, setSelectedSize] = React.useState("");

  const { addToCart } = useCart();

  if (!product) {
    return <div>Ürün bulunamadı.</div>;
  }

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert("Lütfen beden seçiniz.");
      return;
    }

    addToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      color: selectedColor,
      size: selectedSize,
    });

    router.push("/sepetim");
  };

  return (
    <div className="max-w-5xl mx-auto p-6 flex flex-col md:flex-row gap-8">
      <div className="flex-1">
        <Image
          src={product.image}
          alt={product.title}
          width={500}
          height={600}
          className="rounded"
          priority
        />
      </div>
      <div className="flex-1 flex flex-col gap-4">
        <h1 className="text-3xl font-bold">{product.title}</h1>
        <p className="text-xl font-semibold text-green-700">
          {product.price.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
        </p>

        <div>
          <h2 className="font-semibold mb-1">Renk Seçenekleri</h2>
          <div className="flex gap-3">
            {product.colors.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`w-8 h-8 rounded-full border-2 cursor-pointer ${
                  selectedColor === color ? "border-black" : "border-gray-300"
                }`}
                style={{ backgroundColor: color }}
                aria-label={`Renk seçimi ${color}`}
              />
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-semibold mb-1 mt-4">Beden Seçimi</h2>
          <select
            value={selectedSize}
            onChange={(e) => setSelectedSize(e.target.value)}
            className="border border-gray-300 rounded px-4 py-2 w-full max-w-xs"
          >
            <option value="">Beden Seç</option>
            {product.sizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={!selectedSize}
          className={`mt-6 bg-black text-white py-3 rounded font-semibold max-w-xs ${
            selectedSize ? "hover:bg-gray-800 cursor-pointer" : "opacity-50 cursor-not-allowed"
          }`}
        >
          Sepete Ekle
        </button>
        

        <div className="mt-8 text-sm text-gray-700 space-y-4 max-w-lg">
          <div>
            <h3 className="font-semibold">Ürün Özellikleri</h3>
            <p>{product.description.features}</p>
          </div>
          <div>
            <h3 className="font-semibold">Kumaş Bilgileri</h3>
            <p>{product.description.fabric}</p>
          </div>
          <div>
            <h3 className="font-semibold">Model Bilgileri</h3>
            <p>{product.description.model}</p>
          </div>
          <div>
            <h3 className="font-semibold">Ürün Kodu</h3>
            <p>{product.description.code}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

