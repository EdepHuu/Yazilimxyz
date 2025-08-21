"use client";

import React, { useState, useEffect } from "react";

interface Report {
  id: number;
  reportName: string;
  creationDate: string;
  status: "Hazır" | "Oluşturuluyor";
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReports = () => {
      setTimeout(() => {
        try {
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
          console.error("Raporlar yüklenemedi:", err);
          setError("Raporlar yüklenirken bir hata oluştu.");
          setIsLoading(false);
        }
      }, 1000);
    };

    fetchReports();
  }, []);

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
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Rapor Yönetimi</h1>

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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rapor Adı</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Oluşturulma Tarihi</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">İşlemler</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reports.map((report) => (
              <tr key={report.id} className="hover:bg-gray-50">
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
  );
}

