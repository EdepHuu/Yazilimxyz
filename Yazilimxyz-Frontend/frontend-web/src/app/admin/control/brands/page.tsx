"use client";

import React, { useState, useEffect } from "react";

// TypeScript için marka tipi tanımlaması
interface Brand {
  id: number;
  name: string;
  totalProducts: number;
  status: "Aktif" | "Pasif";
}

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBrands = () => {
      // API çağrısı simülasyonu
      setTimeout(() => {
        try {
          const fetchedData: Brand[] = [
            { id: 1, name: "ShopEase Markası", totalProducts: 500, status: "Aktif" },
            { id: 2, name: "ElectroTech", totalProducts: 320, status: "Aktif" },
            { id: 3, name: "Fashionista", totalProducts: 180, status: "Pasif" },
            { id: 4, name: "HomeLiving", totalProducts: 450, status: "Aktif" },
            { id: 5, name: "BookHaven", totalProducts: 210, status: "Aktif" },
          ];
          setBrands(fetchedData);
          setIsLoading(false);
        } catch (err) {
          console.error("Failed to fetch brands:", err);
          setError("Veri çekilirken bir hata oluştu.");
          setIsLoading(false);
        }
      }, 1000);
    };

    fetchBrands();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Markalar yükleniyor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Marka Yönetimi</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-700">Marka Listesi</h2>
          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200">
            Yeni Marka Ekle
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marka Adı</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Toplam Ürün</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {brands.map((brand) => (
                <tr key={brand.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{brand.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{brand.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{brand.totalProducts}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${brand.status === "Aktif" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                      {brand.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-indigo-600 hover:text-indigo-900 mr-2">Düzenle</button>
                    <button className="text-red-600 hover:text-red-900">Sil</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}