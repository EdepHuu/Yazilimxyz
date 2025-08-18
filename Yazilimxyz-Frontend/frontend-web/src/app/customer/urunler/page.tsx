"use client";
import Accordion from "@/components/customer/Accordion";
import ProductCard from "@/components/customer/ProductCard";
import { SearchGrayIcon } from "@/components/customer/icons/icon";
import { fetchListFilter, fetchListProduct } from "@/lib/customerApi";
import React, { useEffect, useState } from "react";

interface Product {
  id: number;
  name: string;
  description: string;
  basePrice: number;
  gender: number;
  isActive: boolean;
  mainPhoto: string;
}
interface Brand {
  id: number;
  name: string;
}

interface FilteredProps {
  brands: Brand[];
  colors: string[];
  genders: string[];
  sizes: string[];
  priceRange: {
    min: number;
    max: number;
  };
}

function UrunlerPage() {
  const [selectedColors, setSelectedColors] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPriceId, setSelectedPriceId] = useState<number | null>(null);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [products, setProduct] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<FilteredProps | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const toggleColor = (id: number) => {
    setSelectedColors((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };
  const filteredColors = filtered?.colors.filter((color) =>
    color.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const brandColors = filtered?.brands.filter((color) =>
    color.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleManualInput = (type: "min" | "max", value: string) => {
    if (type === "min") setMinPrice(value);
    if (type === "max") setMaxPrice(value);
    setSelectedPriceId(null);
  };

  // const handleApply = () => {
  //   if (selectedPriceId) {
  //     const selected = filtered?.priceRange.find((p) => p.id === selectedPriceId);
  //     console.log("Seçilen radio aralık:", selected);
  //   } else {
  //     console.log("Manuel aralık:", minPrice, "-", maxPrice);
  //   }
  // };

  useEffect(() => {
    async function getListProduct() {
      try {
        const fetchedListProduct = await fetchListProduct();
        const fetchData = fetchedListProduct.data;
        console.log("product", fetchData);
        setProduct(fetchData);
      } catch (err) {
        console.log(err);
      }
    }
    getListProduct();
  }, []);

  useEffect(() => {
    async function getListFilter() {
      try {
        const fetchedListFilter = await fetchListFilter();
        const fetchData = fetchedListFilter;
        console.log("filter", fetchData);
        setFiltered(fetchData);
      } catch (err) {
        console.log(err);
      }
    }
    getListFilter();
  }, []);

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
                {filtered?.brands?.map((brand) => (
                  <label key={brand.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      value={brand.name}
                      className="accent-gray-600 w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">{brand.name}</span>
                  </label>
                ))}
              </div>
            </Accordion>
            <Accordion title="Beden">
              <div className="flex flex-col gap-2">
                {filtered?.sizes?.map((size, index) => (
                  <label key={index} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      key={index}
                      value={size}
                      className="border px-3 py-1 text-sm rounded hover:bg-gray-100"
                    />
                    <span className="text-sm text-gray-700">{size}</span>
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
                {filtered?.colors?.map((color, index) => {
                  const isSelected = selectedColors.includes(index);
                  return (
                    <label
                      key={index}
                      htmlFor={`color-${index}`}
                      className="flex items-center gap-2 cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        id={`color-${index}`}
                        value={color}
                        checked={isSelected}
                        onChange={() => {
                          setSelectedColors((prev) =>
                            prev.includes(index)
                              ? prev.filter((c) => c !== index)
                              : [...prev, index]
                          );
                        }}
                        className="hidden"
                      />

                      {/* <span
                        className={`w-6 h-6 rounded border relative transition-all ${
                          isSelected ? "shadow-md" : "border-gray-300"
                        }`}
                        style={{ backgroundColor: color.hex }}
                      ></span> */}

                      <span className="text-sm text-gray-700 flex items-center gap-1">
                        {color}
                        {isSelected && (
                          <span className="text-red-600 font-bold text-sm">
                            ✓
                          </span>
                        )}
                      </span>
                    </label>
                  );
                })}

                {/* {filteredColors.length === 0 && (
                  <span className="text-sm text-gray-400">
                    Renk bulunamadı.
                  </span>
                )} */}
              </div>
            </Accordion>
            <Accordion title="Cinsiyet">
              <div className="flex flex-col gap-2">
                {filtered?.genders?.map((gender, index) => (
                  <label key={index} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      value={gender}
                      className="accent-gray-600 w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">{gender}</span>
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
                </div>
                {filtered?.priceRange && (
                  <label className="flex items-center gap-3 cursor-pointer text-sm text-gray-700">
                    <input
                      type="radio"
                      name="priceRange"
                      onChange={() => {
                        setMinPrice(filtered.priceRange.min.toString());
                        setMaxPrice(filtered.priceRange.max.toString());
                      }}
                      className="w-4 h-4 accent-gray-600"
                    />
                    <span>
                      {filtered.priceRange.min}₺ - {filtered.priceRange.max}₺
                    </span>
                  </label>
                )}
              </div>
            </Accordion>

            <button
              // onClick={handleApplyFilters}
              disabled={isLoading}
              className="w-full bg-black text-white rounded-md py-2 mt-4 hover:bg-gray-700 disabled:opacity-60"
            >
              {isLoading ? "Uygulanıyor..." : "Filtrele"}
            </button>
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
