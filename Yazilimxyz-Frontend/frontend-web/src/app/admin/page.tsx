"use client";

import React from "react";

// Bu bileşen, Kontrol Paneli (Admin Panel) sayfasının içeriğini içerir.
// This component contains the content for the Admin Panel page.

export default function AdminPanelPage() {
  return (
    <>
      <h1 className="text-2xl font-bold mb-4">Kontrol Paneli</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700">Toplam Satışlar</h2>
          <p className="text-3xl font-bold text-gray-900 mt-2">$245,678</p>
          <p className="text-sm text-green-500">+12% bu ay</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700">Yeni Siparişler</h2>
          <p className="text-3xl font-bold text-gray-900 mt-2">1,200</p>
          <p className="text-sm text-green-500">+8% bu ay</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700">Kullanıcı Sayısı</h2>
          <p className="text-3xl font-bold text-gray-900 mt-2">45,123</p>
          <p className="text-sm text-green-500">+15% bu ay</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700">Ortalama Sepet</h2>
          <p className="text-3xl font-bold text-gray-900 mt-2">$24.50</p>
          <p className="text-sm text-red-500">-2% bu ay</p>
        </div>
      </div>
      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Son Siparişler</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sipariş ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Müşteri Adı</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Toplam</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#1024</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Ali Yılmaz</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Tamamlandı</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">$59.99</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#1023</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Ayşe Demir</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Beklemede</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">$120.50</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#1022</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Mehmet Kaya</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Tamamlandı</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">$249.00</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}