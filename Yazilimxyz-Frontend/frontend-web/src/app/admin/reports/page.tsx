"use client";

import React, { useState, useEffect } from "react";

// Bu bileşen, Rapor Yönetimi sayfasının içeriğini içerir.
// This component contains the content for the Reports Management page.

// TypeScript için rapor tipi tanımlaması
interface Report {
  id: number;
  reportName: string;
  creationDate: string;
  status: "Hazır" | "Oluşturuluyor";
}

export default function ReportsPage() {
  // Rapor verilerini, yükleme durumunu ve hata durumunu yönetmek için React durumunu kullanıyoruz.
  // We use React state to manage report data, loading state, and error state.
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // useEffect hook'u, bileşen ilk yüklendiğinde veri çekme işlemini tetikler.
  // The useEffect hook triggers the data fetching process when the component first mounts.
  useEffect(() => {
    const fetchReports = () => {
      // Bir API çağrısı simüle etmek için setTimeout kullanıyoruz.
      // In a real project, you would make an API call here using 'fetch' or a library like 'axios'.
      setTimeout(() => {
        try {
          // Örnek API yanıtı (dinamik veri)
          const fetchedData: Report[] = [
            { id: 1, reportName: "Aylık Satış Raporu", creationDate: "2024-07-25", status: "Hazır" },
            { id: 2, reportName: "Stok Durum Analizi", creationDate: "2024-07-24", status: "Hazır" },
            { id: 3, reportName: "Kullanıcı Etkileşim İstatistikleri", creationDate: "2024-07-23", status: "Oluşturuluyor" },
            { id: 4, reportName: "Pazar Trendleri Raporu", creationDate: "2024-07-22", status: "Hazır" },
            { id: 5, reportName: "Kampanya Performansı", creationDate: "2024-07-21", status: "Hazır" },
          ];
          setReports(fetchedData);
          setIsLoading(false);
        } catch (err) {
          console.error("Failed to fetch reports:", err);
          setError("Veri çekilirken bir hata oluştu."); // An error occurred while fetching data.
          setIsLoading(false);
        }
      }, 1000); // 1 saniyelik gecikme ile API çağrısı simülasyonu
    };

    fetchReports();
  }, []); // Boş bağımlılık dizisi, bileşenin sadece bir kez yüklenmesini sağlar.

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Raporlar yükleniyor...</p>
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
      <h1 className="text-2xl font-bold mb-4">Rapor Yönetimi</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-700">Rapor Listesi</h2>
          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200">
            Yeni Rapor Oluştur
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rapor Adı</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Oluşturulma Tarihi</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reports.map((report) => (
                <tr key={report.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{report.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.reportName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.creationDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${report.status === "Hazır" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-indigo-600 hover:text-indigo-900 mr-2">Düzenle</button>
                    <button className="text-blue-600 hover:text-blue-900">İndir</button>
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