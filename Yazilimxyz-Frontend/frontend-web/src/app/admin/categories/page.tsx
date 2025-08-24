"use client";

import React, { useState } from 'react';

// Sadece giyim kategorisi için mock data
const mockCategories = [
  { id: 1, name: 'Erkek Giyim', productCount: 65 },
  { id: 2, name: 'Kadın Giyim', productCount: 55 },
  { id: 3, name: 'Çocuk Giyim', productCount: 30 },
];

// Kategoriler sayfasının içeriğini barındıran bileşen
export default function CategoriesPage() {
  const [categories, setCategories] = useState(mockCategories);
  const [showAddCategoryForm, setShowAddCategoryForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');

  // Yeni kategori ekleme formu gönderildiğinde çalışacak fonksiyon
  const handleAddCategory = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!newCategoryName) {
        return;
    }

    const newCategory = {
      id: categories.length + 1,
      name: newCategoryName,
      productCount: 0,
    };
    
    // Kategoriler listesine yeni kategoriyi ekle
    setCategories([...categories, newCategory]);
    
    // Formu sıfırla ve gizle
    setNewCategoryName('');
    setNewCategoryDescription('');
    setShowAddCategoryForm(false);
    
    console.log('Yeni kategori eklendi:', newCategory);
  };
  
  // Kategori düzenleme işlemi için geçici fonksiyon
  const handleEditCategory = (categoryId: number) => {
      console.log(`Kategori düzenleniyor: ID - ${categoryId}`);
      // Burada düzenleme formunu açma veya API çağrısı yapma işlemleri eklenecek.
  };

  // Kategori silme işlemi için geçici fonksiyon
  const handleDeleteCategory = (categoryId: number) => {
      console.log(`Kategori siliniyor: ID - ${categoryId}`);
      // Kategoriyi listeden kaldırmak için bir state güncellemesi
      const updatedCategories = categories.filter(category => category.id !== categoryId);
      setCategories(updatedCategories);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Giyim Kategori Yönetimi</h1>
        <button
          onClick={() => setShowAddCategoryForm(!showAddCategoryForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200 ease-in-out shadow-md"
        >
          {showAddCategoryForm ? 'Vazgeç' : 'Yeni Kategori Ekle'}
        </button>
      </div>

      {showAddCategoryForm && (
        <div className="mb-8">
          <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Yeni Kategori Formu</h2>
            <form onSubmit={handleAddCategory}>
              {/* Kategori Adı */}
              <div className="mb-4">
                <label htmlFor="categoryName" className="block text-gray-700 text-sm font-bold mb-2">
                  Kategori Adı
                </label>
                <input
                  type="text"
                  id="categoryName"
                  className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  required
                />
              </div>

              {/* Açıklama */}
              <div className="mb-6">
                <label htmlFor="categoryDescription" className="block text-gray-700 text-sm font-bold mb-2">
                  Açıklama (Opsiyonel)
                </label>
                <textarea
                  id="categoryDescription"
                  className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  value={newCategoryDescription}
                  onChange={(e) => setNewCategoryDescription(e.target.value)}
                />
              </div>
              
              {/* Kaydet butonu */}
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-200 ease-in-out w-full"
              >
                Kategoriyi Kaydet
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Kategoriler tablosu */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead>
            <tr className="bg-gray-100 text-left text-gray-600 uppercase text-sm leading-normal">
              <th className="py-3 px-6 text-left">Kategori Adı</th>
              <th className="py-3 px-6 text-left">Ürün Sayısı</th>
              <th className="py-3 px-6 text-left">İşlemler</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm font-light">
            {categories.map(category => (
              <tr key={category.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-3 px-6 text-left whitespace-nowrap">{category.name}</td>
                <td className="py-3 px-6 text-left">{category.productCount}</td>
                <td className="py-3 px-6 text-left">
                  <div className="flex item-center justify-start">
                    <button
                      onClick={() => handleEditCategory(category.id)}
                      className="w-8 h-8 mr-2 transform hover:text-purple-500 hover:scale-110"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="w-8 h-8 mr-2 transform hover:text-red-500 hover:scale-110"
                    >
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
}
