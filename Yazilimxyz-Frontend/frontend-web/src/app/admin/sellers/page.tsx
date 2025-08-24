"use client";

import React, { useState, useEffect } from "react";

// Bu bileşen, Satıcı Yönetimi sayfasının içeriğini içerir.
// This component contains the content for the Sellers Management page.

// TypeScript için satıcı tipi tanımlaması
interface Seller {
  id: number;
  name: string;
  email: string;
  status: "Aktif" | "Pasif";
  totalProducts: number;
}

export default function SellersPage() {
  // Satıcı verilerini, yükleme durumunu ve hata durumunu yönetmek için React durumunu kullanıyoruz.
  // We use React state to manage seller data, loading state, and error state.
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // useEffect hook'u, bileşen ilk yüklendiğinde veri çekme işlemini tetikler.
  // The useEffect hook triggers the data fetching process when the component first mounts.
  useEffect(() => {
    const fetchSellers = () => {
      // Bir API çağrısı simüle etmek için setTimeout kullanıyoruz.
      // In a real project, you would make an API call here using 'fetch' or a library like 'axios'.
      setTimeout(() => {
        try {
          // Örnek API yanıtı (dinamik veri)
          const fetchedData: Seller[] = [
            { id: 1, name: "TrendyStore", email: "trendy@example.com", status: "Aktif", totalProducts: 150 },
            { id: 2, name: "TechCorner", email: "tech@example.com", status: "Aktif", totalProducts: 320 },
            { id: 3, name: "FashionHub", email: "fashion@example.com", status: "Pasif", totalProducts: 80 },
            { id: 4, name: "HomeGoods Co.", email: "homegoods@example.com", status: "Aktif", totalProducts: 450 },
            { id: 5, name: "Bookworm Alley", email: "books@example.com", status: "Aktif", totalProducts: 210 },
          ];
          setSellers(fetchedData);
          setIsLoading(false);
        } catch (err) {
          console.error("Failed to fetch sellers:", err);
          setError("Veri çekilirken bir hata oluştu."); // An error occurred while fetching data.
          setIsLoading(false);
        }
      }, 1000); // 1 saniyelik gecikme ile API çağrısı simülasyonu
    };

    fetchSellers();
  }, []); // Boş bağımlılık dizisi, bileşenin sadece bir kez yüklenmesini sağlar.

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Satıcılar yükleniyor...</p>
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
    <div>
      <h1 className="text-2xl font-bold mb-4">Satıcı Yönetimi</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-700">Satıcı Listesi</h2>
          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200">
            Yeni Satıcı Ekle
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Satıcı Adı</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">E-posta</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Toplam Ürün</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sellers.map((seller) => (
                <tr key={seller.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{seller.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{seller.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{seller.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${seller.status === "Aktif" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                      {seller.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{seller.totalProducts}</td>
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
