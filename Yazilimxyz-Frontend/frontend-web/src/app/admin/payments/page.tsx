"use client";

import React, { useState, useEffect } from "react";

// Bu bileşen, Ödeme Yönetimi sayfasının içeriğini içerir.
// This component contains the content for the Payments Management page.

// TypeScript için ödeme tipi tanımlaması
interface Payment {
  id: number;
  customerName: string;
  amount: number;
  status: "Başarılı" | "Beklemede" | "İptal Edildi";
  date: string;
  paymentMethod: "Kredi Kartı" | "Havale" | "PayPal";
}

export default function PaymentsPage() {
  // Ödeme verilerini, yükleme durumunu ve hata durumunu yönetmek için React durumunu kullanıyoruz.
  // We use React state to manage payment data, loading state, and error state.
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // useEffect hook'u, bileşen ilk yüklendiğinde veri çekme işlemini tetikler.
  // The useEffect hook triggers the data fetching process when the component first mounts.
  useEffect(() => {
    const fetchPayments = () => {
      // Bir API çağrısı simüle etmek için setTimeout kullanıyoruz.
      // In a real project, you would make an API call here using 'fetch' or a library like 'axios'.
      setTimeout(() => {
        try {
          // Örnek API yanıtı (dinamik veri)
          const fetchedData: Payment[] = [
            { id: 1, customerName: "Ayşe Yılmaz", amount: 150.75, status: "Başarılı", date: "2024-07-25", paymentMethod: "Kredi Kartı" },
            { id: 2, customerName: "Mehmet Çelik", amount: 750.00, status: "Başarılı", date: "2024-07-24", paymentMethod: "Havale" },
            { id: 3, customerName: "Fatma Demir", amount: 35.50, status: "Beklemede", date: "2024-07-23", paymentMethod: "Kredi Kartı" },
            { id: 4, customerName: "Can Kaya", amount: 1200.00, status: "Başarılı", date: "2024-07-22", paymentMethod: "PayPal" },
            { id: 5, customerName: "Ece Arslan", amount: 50.25, status: "İptal Edildi", date: "2024-07-21", paymentMethod: "Kredi Kartı" },
          ];
          setPayments(fetchedData);
          setIsLoading(false);
        } catch (err) {
          console.error("Failed to fetch payments:", err);
          setError("Veri çekilirken bir hata oluştu."); // An error occurred while fetching data.
          setIsLoading(false);
        }
      }, 1000); // 1 saniyelik gecikme ile API çağrısı simülasyonu
    };

    fetchPayments();
  }, []); // Boş bağımlılık dizisi, bileşenin sadece bir kez yüklenmesini sağlar.

  // Duruma göre renk döndüren yardımcı fonksiyon
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Başarılı":
        return "bg-green-100 text-green-800";
      case "Beklemede":
        return "bg-yellow-100 text-yellow-800";
      case "İptal Edildi":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Ödemeler yükleniyor...</p>
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
      <h1 className="text-2xl font-bold mb-4">Ödeme Yönetimi</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-700">Ödeme Listesi</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Müşteri Adı</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tutar</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ödeme Durumu</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ödeme Yöntemi</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{payment.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.customerName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.amount.toFixed(2)} TL</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.paymentMethod}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-indigo-600 hover:text-indigo-900 mr-2">Detaylar</button>
                    <button className="text-red-600 hover:text-red-900">İade</button>
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