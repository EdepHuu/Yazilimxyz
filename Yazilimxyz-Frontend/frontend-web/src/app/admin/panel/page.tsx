"use client";

import React from 'react';


export default function PanelPage() {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Kontrol Paneli</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        
        <div className="bg-blue-100 p-4 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-blue-800">Toplam Sipariş</h2>
          <p className="text-3xl font-bold text-blue-600 mt-2">1,250</p>
          <p className="text-sm text-blue-500 mt-1">Geçen aya göre %15 artış</p>
        </div>
        
        <div className="bg-green-100 p-4 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-green-800">Toplam Ciro</h2>
          <p className="text-3xl font-bold text-green-600 mt-2">₺85,000</p>
          <p className="text-sm text-green-500 mt-1">Bu ayın geliri</p>
        </div>
        
        <div className="bg-yellow-100 p-4 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-yellow-800">Yeni Kullanıcılar</h2>
          <p className="text-3xl font-bold text-yellow-600 mt-2">78</p>
          <p className="text-sm text-yellow-500 mt-1">Son 30 gün içinde</p>
        </div>
         

      </div>
      
     
      <div className="mt-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Hızlı Erişim</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a href="/admin/products" className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-4 px-6 rounded-lg text-center transition-colors duration-200">
            Ürünleri Yönet
          </a>
          <a href="/admin/orders" className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-4 px-6 rounded-lg text-center transition-colors duration-200">
            Siparişleri Görüntüle
          </a>
          <a href="/admin/users" className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-4 px-6 rounded-lg text-center transition-colors duration-200">
            Kullanıcıları Listele
          </a>
          <a href="/admin/reviews" className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-4 px-6 rounded-lg text-center transition-colors duration-200">
            Yorumları İncele
          </a>
        </div>
      </div>
      
    </div>
  );
}