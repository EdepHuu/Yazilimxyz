"use client";

import React, { useState } from "react";

interface Order {
  id: string;
  customer: string;
  status: "Tamamlandı" | "Beklemede" | "Kargoda" | "İptal Edildi";
  total: string;
  date: string;
}

export default function OrdersPage() {
  const [orders] = useState<Order[]>([
    { id: "#1024", customer: "Ali Yılmaz", status: "Tamamlandı", total: "$59.99", date: "2025-08-10" },
    { id: "#1023", customer: "Ayşe Demir", status: "Beklemede", total: "$120.50", date: "2025-08-09" },
    { id: "#1022", customer: "Mehmet Kaya", status: "Kargoda", total: "$249.00", date: "2025-08-08" },
    { id: "#1021", customer: "Zeynep Arslan", status: "Tamamlandı", total: "$75.00", date: "2025-08-08" },
    { id: "#1020", customer: "Murat Çelik", status: "İptal Edildi", total: "$0.00", date: "2025-08-07" },
  ]);

  // Sipariş durumuna göre renkleri belirleyen yardımcı fonksiyon
  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "Tamamlandı":
        return "bg-green-100 text-green-800";
      case "Beklemede":
        return "bg-yellow-100 text-yellow-800";
      case "Kargoda":
        return "bg-blue-100 text-blue-800";
      case "İptal Edildi":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Sipariş Yönetimi</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4">Tüm Siparişler</h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sipariş ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Müşteri</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Toplam</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tarih</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{order.customer}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{order.total}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">Detay</button>
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