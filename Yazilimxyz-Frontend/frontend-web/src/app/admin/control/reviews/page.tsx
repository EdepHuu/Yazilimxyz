"use client";

import React, { useState, useEffect } from "react";

// Bu bileşen, Müşteri Yorumları sayfasının içeriğini içerir.
// This component contains the content for the Customer Reviews page.

// TypeScript için yorum tipi tanımlaması
interface Review {
  id: number;
  productName: string;
  reviewerName: string;
  rating: number; // 1-5 arası bir puan
  reviewText: string;
  date: string;
}

export default function ReviewsPage() {
  // Yorum verilerini, yükleme durumunu ve hata durumunu yönetmek için React durumunu kullanıyoruz.
  // We use React state to manage review data, loading state, and error state.
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // useEffect hook'u, bileşen ilk yüklendiğinde veri çekme işlemini tetikler.
  // The useEffect hook triggers the data fetching process when the component first mounts.
  useEffect(() => {
    const fetchReviews = () => {
      // Bir API çağrısı simüle etmek için setTimeout kullanıyoruz.
      // In a real project, you would make an API call here using 'fetch' or a library like 'axios'.
      setTimeout(() => {
        try {
          // Örnek API yanıtı (dinamik veri)
          const fetchedData: Review[] = [
            { id: 1, productName: "Akıllı Saat X1", reviewerName: "Ayşe Yılmaz", rating: 5, reviewText: "Harika bir ürün, çok hızlı geldi!", date: "2024-07-25" },
            { id: 2, productName: "Bluetooth Kulaklık", reviewerName: "Mehmet Çelik", rating: 3, reviewText: "Ses kalitesi iyi ama şarjı daha uzun sürebilirdi.", date: "2024-07-24" },
            { id: 3, productName: "Yazlık Elbise", reviewerName: "Fatma Demir", rating: 5, reviewText: "Kumaşı çok güzel, tam istediğim gibi.", date: "2024-07-23" },
            { id: 4, productName: "Oyuncu Mouse", reviewerName: "Can Kaya", rating: 4, reviewText: "Tasarımı güzel, tepkime hızı harika.", date: "2024-07-22" },
            { id: 5, productName: "Kablosuz Şarj Cihazı", reviewerName: "Ece Arslan", rating: 2, reviewText: "Çok ısınıyor, beklediğim performansı vermedi.", date: "2024-07-21" },
          ];
          setReviews(fetchedData);
          setIsLoading(false);
        } catch (err) {
          console.error("Failed to fetch reviews:", err);
          setError("Veri çekilirken bir hata oluştu."); // An error occurred while fetching data.
          setIsLoading(false);
        }
      }, 1000); // 1 saniyelik gecikme ile API çağrısı simülasyonu
    };

    fetchReviews();
  }, []); // Boş bağımlılık dizisi, bileşenin sadece bir kez yüklenmesini sağlar.

  // Puanlama için yıldızları oluşturan yardımcı fonksiyon
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <span key={i} className={`text-xl ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}>
          ★
        </span>
      );
    }
    return stars;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Yorumlar yükleniyor...</p>
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
      <h1 className="text-2xl font-bold mb-4">Müşteri Yorumları</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-700">Yorum Listesi</h2>
          {/* İsterseniz buraya yeni yorum ekleme butonu eklenebilir. */}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ürün Adı</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Yorumcu</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Puan</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Yorum</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reviews.map((review) => (
                <tr key={review.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{review.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{review.productName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{review.reviewerName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex">
                        {renderStars(review.rating)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-normal text-sm text-gray-500 max-w-xs">{review.reviewText}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{review.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-indigo-600 hover:text-indigo-900 mr-2">Yanıtla</button>
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