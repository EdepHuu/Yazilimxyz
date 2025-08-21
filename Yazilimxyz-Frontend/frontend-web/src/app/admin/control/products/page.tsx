"use client";

import React, { useState } from 'react';

const ProductsPage = () => {
  const [products, setProducts] = useState([
    { id: 1, name: 'Örnek Ürün 1', sku: 'SKU123', price: '199.99 TL', stock: 50 },
    { id: 2, name: 'Örnek Ürün 2', sku: 'SKU456', price: '249.50 TL', stock: 120 },
    { id: 3, name: 'Örnek Ürün 3', sku: 'SKU789', price: '75.00 TL', stock: 0 },
  ]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Ürün Yönetimi</h1>
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200 ease-in-out shadow-md">
          Yeni Ürün Ekle
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead>
            <tr className="bg-gray-100 text-left text-gray-600 uppercase text-sm leading-normal">
              <th className="py-3 px-6">Ürün Adı</th>
              <th className="py-3 px-6">SKU</th>
              <th className="py-3 px-6">Fiyat</th>
              <th className="py-3 px-6">Stok</th>
              <th className="py-3 px-6">İşlemler</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm font-light">
            {products.map((product) => (
              <tr key={product.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-3 px-6">{product.name}</td>
                <td className="py-3 px-6">{product.sku}</td>
                <td className="py-3 px-6">{product.price}</td>
                <td className="py-3 px-6">
                  <span className={`py-1 px-3 rounded-full text-xs font-semibold ${
                    product.stock > 0 ? 'bg-green-200 text-green-700' : 'bg-red-200 text-red-700'
                  }`}>
                    {product.stock > 0 ? 'Stokta' : 'Stokta Yok'}
                  </span>
                </td>
                <td className="py-3 px-6">
                  <div className="flex items-center">
                    <button className="w-8 h-8 mr-2 transform hover:text-purple-500 hover:scale-110">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button className="w-8 h-8 mr-2 transform hover:text-red-500 hover:scale-110">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductsPage;
