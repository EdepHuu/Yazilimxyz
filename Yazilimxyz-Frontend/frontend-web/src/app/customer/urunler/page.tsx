"use client";
import Accordion from "@/components/customer/Accordion";
import ProductCard from "@/components/customer/ProductCard";
import { SearchGrayIcon } from "@/components/customer/icons/icon";
import { fetchListProduct } from "@/lib/customerApi";
import React, { useEffect, useState } from "react";

interface SizeOption {
  id: number;
  label: string;
}
interface ColorOption {
  id: number;
  label: string;
  hex: string;
}
interface BrandOption {
  id: number;
  label: string;
}
interface GenderOption {
  id: number;
  label: string;
}
interface PriceOption {
  id: number;
  label: string;
  min: number;
  max: number;
}

interface Product {
  id: number;
    name: string;
    description: string;
    basePrice: number;
    gender: number;
    isActive: boolean;
    mainPhoto: string;
}


// const products = [
//   {
//     id: 1,
//     title: "Loose Straight Jean",
//     colors: "Açık mavi",
//     price: 1000,
//     image: "/product-img-1.jpg",
//   },
//   {
//     id: 2,
//     title: "Loose Straight Jean",
//     colors: "Koyu mavi",
//     price: 1050,
//     image: "/product-img-2.jpg",
//   },
//   {
//     id: 3,
//     title: "Siyah Deri Kol Çantası",
//     colors: "Siyah",
//     price: 980,
//     image: "/product-img-3.jpg",
//   },
//   {
//     id: 4,
//     title: "Kırmızı Güneş Gözlüğü",
//     colors: "Kırmızı",
//     price: 1100,
//     image: "/product-img-4.jpg",
//   },
//   {
//     id: 5,
//     title: "Turuncu Sweatshirt",
//     colors: "Turuncu",
//     price: 950,
//     image: "/product-img-5.jpg",
//   },
//   {
//     id: 6,
//     title: "Lacivert Pileli Uzun Etek",
//     colors: "Lacivert",
//     price: 1020,
//     image: "/product-img-6.jpg",
//   },
//   {
//     id: 7,
//     title: "Beyaz Spor Ayakkabı",
//     colors: "Beyaz",
//     price: 1080,
//     image: "/product-img-7.jpg",
//   },
//   {
//     id: 8,
//     title: "Oversize Bej Kaban",
//     colors: "Bej",
//     price: 990,
//     image: "/product-img-8.jpg",
//   },
// ];

const sizes: SizeOption[] = [
  { id: 1, label: "XS" },
  { id: 2, label: "S" },
  { id: 3, label: "M" },
  { id: 4, label: "XL" },
  { id: 5, label: "2XL" },
  { id: 6, label: "3XL" },
];
const colors: ColorOption[] = [
  { id: 1, label: "Siyah", hex: "#000000" },
  { id: 2, label: "Beyaz", hex: "#FFFFFF" },
  { id: 3, label: "Gri", hex: "#808080" },
  { id: 4, label: "Lacivert", hex: "#000080" },
  { id: 5, label: "Bej", hex: "#F5F5DC" },
  { id: 6, label: "Kırmızı", hex: "#FF0000" },
];
const brands: BrandOption[] = [
  { id: 1, label: "Nike" },
  { id: 2, label: "Adidas" },
  { id: 3, label: "Puma" },
  { id: 4, label: "Pull & Bear" },
  { id: 5, label: "Zara" },
  { id: 6, label: "Bershka" },
  { id: 7, label: "Mavi" },
  { id: 8, label: "Defacto" },
];
const genders: GenderOption[] = [
  { id: 1, label: "Kadın" },
  { id: 2, label: "Erkek" },
  { id: 3, label: "Unisex" },
  { id: 4, label: "Çocuk" },
];

const priceRanges: PriceOption[] = [
  { id: 1, label: "0 - 250 TL", min: 0, max: 250 },
  { id: 2, label: "250 - 500 TL", min: 250, max: 500 },
  { id: 3, label: "500 - 1000 TL", min: 500, max: 1000 },
  { id: 4, label: "1000 - 1500 TL", min: 1000, max: 1500 },
  { id: 5, label: "1500 TL ve üzeri", min: 1500, max: Infinity },
];

function UrunlerPage() {
  const [selectedColors, setSelectedColors] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPriceId, setSelectedPriceId] = useState<number | null>(null);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [products, setProduct] = useState<Product[]>([]);
  // const [filtered, setFiltered]= useState();

  const toggleColor = (id: number) => {
    setSelectedColors((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };
  const filteredColors = colors.filter((color) =>
    color.label.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const brandColors = brands.filter((color) =>
    color.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleManualInput = (type: "min" | "max", value: string) => {
    if (type === "min") setMinPrice(value);
    if (type === "max") setMaxPrice(value);
    setSelectedPriceId(null);
  };

  const handleApply = () => {
    if (selectedPriceId) {
      const selected = priceRanges.find((p) => p.id === selectedPriceId);
      console.log("Seçilen radio aralık:", selected);
    } else {
      console.log("Manuel aralık:", minPrice, "-", maxPrice);
    }
  };

  useEffect(() => {
    async function getListProduct() {
      try {
        const fetchedListProduct = await fetchListProduct();
        const fetchData = fetchedListProduct.data;
        console.log("product",fetchData)
        setProduct(fetchData);
      } catch (err) {
        console.log(err);
      }
    }
    getListProduct();
  }, []);

  //  useEffect(() => {
  //   async function getListFilter() {
  //     try {
  //       const fetchedListFilter = await fetchListFilter();
  //       const fetchData = fetchedListFilter.data;
  //       console.log("filter",fetchData)
  //       setFiltered(fetchData);
  //     } catch (err) {
  //       console.log(err);
  //     }
  //   }
  //   getListFilter();
  // }, []);

  return (
    <>
      <section className="container p-0 m-0">
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-1/5">
            <Accordion title="Marka">
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  placeholder="Marka ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
                />
                {brandColors.map((color) => (
                  <label key={color.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      value={color.label}
                      className="accent-pink-600 w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">{color.label}</span>
                  </label>
                ))}
              </div>
            </Accordion>
            <Accordion title="Beden">
              <div className="flex flex-col gap-2">
                {sizes.map((size) => (
                  <label key={size.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      key={size.id}
                      value={size.label}
                      className="border px-3 py-1 text-sm rounded hover:bg-gray-100"
                    />
                    <span className="text-sm text-gray-700">{size.label}</span>
                  </label>
                ))}
              </div>
            </Accordion>
            <Accordion title="Renk">
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  placeholder="Renk ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
                />
                {filteredColors.map((color) => {
                  const isSelected = selectedColors.includes(color.id);
                  return (
                    <label
                      key={color.id}
                      htmlFor={`color-${color.id}`}
                      className="flex items-center gap-2 cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        id={`color-${color.id}`}
                        value={color.label}
                        checked={isSelected}
                        onChange={() => {
                          setSelectedColors((prev) =>
                            prev.includes(color.id)
                              ? prev.filter((c) => c !== color.id)
                              : [...prev, color.id]
                          );
                        }}
                        className="hidden"
                      />

                      <span
                        className={`w-6 h-6 rounded border relative transition-all ${
                          isSelected ? "shadow-md" : "border-gray-300"
                        }`}
                        style={{ backgroundColor: color.hex }}
                      ></span>

                      <span className="text-sm text-gray-700 flex items-center gap-1">
                        {color.label}
                        {isSelected && (
                          <span className="text-red-600 font-bold text-sm">
                            ✓
                          </span>
                        )}
                      </span>
                    </label>
                  );
                })}

                {filteredColors.length === 0 && (
                  <span className="text-sm text-gray-400">
                    Renk bulunamadı.
                  </span>
                )}
              </div>
            </Accordion>
            <Accordion title="Cinsiyet">
              <div className="flex flex-col gap-2">
                {genders.map((color) => (
                  <label key={color.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      value={color.label}
                      className="accent-pink-600 w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">{color.label}</span>
                  </label>
                ))}
              </div>
            </Accordion>
            <Accordion title="Fiyat">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="number"
                    placeholder="En az"
                    value={minPrice}
                    onChange={(e) => handleManualInput("min", e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-1 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
                  />
                  <span>-</span>
                  <input
                    type="number"
                    placeholder="En çok"
                    value={maxPrice}
                    onChange={(e) => handleManualInput("max", e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-1 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
                  />
                  <button
                    onClick={handleApply}
                    className="bg-gray-200 p-1 rounded-md "
                  >
                    <SearchGrayIcon />
                  </button>
                </div>
                {priceRanges.map((range) => (
                  <label
                    key={range.id}
                    htmlFor={`price-${range.id}`}
                    className="flex items-center gap-3 cursor-pointer text-sm text-gray-700"
                  >
                    <input
                      type="radio"
                      id={`price-${range.id}`}
                      name="priceRange"
                      value={range.id}
                      checked={selectedPriceId === range.id}
                      onChange={() => {
                        setSelectedPriceId(range.id);
                        setMinPrice("");
                        setMaxPrice("");
                      }}
                      className="w-4 h-4 accent-gray-600"
                    />
                    <span>{range.label}</span>
                  </label>
                ))}
              </div>
            </Accordion>
          </div>
          <div className="w-4/5 mt-6 md:mt-0 ml-12">
            <div className="heading-lg-3 mb-4">Yeni Ürünler</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-0">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default UrunlerPage;
