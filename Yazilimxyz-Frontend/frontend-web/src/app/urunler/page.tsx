// app/urunler/page.tsx
import ProductCard from "@/components/ProductCard";
import React from "react";

const products = [
  {
    id: 1,
    title: "Loose Straight Jean",
    colors: "Açık mavi, Koyu mavi",
    price: 1000,
    image: "/product-img-1.jpg",
  },
  {
    id: 2,
    title: "Loose Straight Jean",
    colors: "Koyu mavi",
    price: 1050,
    image: "/product-img-2.jpg",
  },
  {
    id: 3,
    title: "Loose Straight Jean",
    colors: "Açık mavi",
    price: 980,
    image: "/product-img-3.jpg",
  },
  {
    id: 4,
    title: "Loose Straight Jean",
    colors: "Buz mavisi, Koyu mavi",
    price: 1100,
    image: "/product-img-4.jpg",
  },
  {
    id: 5,
    title: "Loose Straight Jean",
    colors: "Taş rengi",
    price: 950,
    image: "/product-img-5.jpg",
  },
  {
    id: 6,
    title: "Loose Straight Jean",
    colors: "Açık mavi",
    price: 1020,
    image: "/product-img-6.jpg",
  },
  {
    id: 7,
    title: "Loose Straight Jean",
    colors: "Koyu mavi, Gri",
    price: 1080,
    image: "/product-img-7.jpg",
  },
  {
    id: 8,
    title: "Loose Straight Jean",
    colors: "Lacivert",
    price: 990,
    image: "/product-img-8.jpg",
  },
];

function UrunlerPage() {
  return (
    <section className="container p-0 m-0">
      <div className="heading-lg-3 mb-4">Yeni Ürünler</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-0">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

export default UrunlerPage;
