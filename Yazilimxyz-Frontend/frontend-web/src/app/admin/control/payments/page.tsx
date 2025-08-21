"use client";

import React, { useState, useEffect } from "react";

// Ödeme tipleri için TypeScript arayüzü
interface Payment {
  id: number;
  customerName: string;
  amount: number;
  status: "Başarılı" | "Beklemede" | "İptal Edildi";
  date: string;
  paymentMethod: "Kredi Kartı" | "Havale" | "PayPal";
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPayments = () => {
      // Simüle edilmiş API çağrısı
      setTimeout(() => {
        try {
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
          console.error("Ödemeler yüklenemedi:", err);
          setError("Ödemeler yüklenirken bir hata oluştu.");
          setIsLoading(false);
        }
      }, 1000);
    };

    fetchPayments();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Başarılı": return "bg-green-100 text-green-800";
      case "Beklemede": return "bg-yellow-100 text-yellow-800";
      case "İptal Edildi": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
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
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Ödeme Yönetimi</h1>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Müşteri Adı</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tutar</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ödeme Durumu</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tarih</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ödeme Yöntemi</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">İşlemler</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {payments.map(payment => (
              <tr key={payment.id} className="hover:bg-gray-50">
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
  );
}