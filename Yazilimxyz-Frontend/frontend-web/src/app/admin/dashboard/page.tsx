"use client";

import React, { useEffect, useRef } from "react";


export default function SellerDashboardPage() {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = React.useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const salesData = {
      labels: ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"],
      datasets: [
        {
          label: "Satışlar",
          data: [20, 45, 38, 62, 30, 70, 48],
          borderColor: "#3498db",
          backgroundColor: "rgba(52, 152, 219, 0.2)",
          tension: 0.4,
          fill: true,
          pointRadius: 5,
          pointBackgroundColor: "#3498db",
          pointBorderColor: "#fff",
          pointHoverRadius: 7,
          pointHoverBackgroundColor: "#2980b9",
          pointHoverBorderColor: "#fff",
        },
      ],
    };

    const salesOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: "rgba(0, 0, 0, 0.05)",
          },
        },
        x: {
          grid: {
            display: false,
          },
        },
      },
    };

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    chartInstanceRef.current = new Chart(chartRef.current, {
      type: "line",
      data: salesData,
      options: salesOptions,
    });

    return () => {
      chartInstanceRef.current?.destroy();
    };
  }, []);

  return (
    <div className="flex h-screen overflow-hidden font-inter bg-[#f0f2f5]">
      {/* Sidebar */}
      <aside className="w-64 p-6 flex flex-col justify-between overflow-y-auto bg-[#2c3e50]">
        <div>
          <h1 className="text-white text-2xl font-bold mb-8">Satıcı Paneli</h1>
          <nav>
            <ul>
              {[
                { icon: "tachometer-alt", label: "Kontrol Paneli", active: true },
                { icon: "box-open", label: "Ürünler", active: false },
                { icon: "shopping-cart", label: "Siparişler", active: false },
                { icon: "users", label: "Müşteriler", active: false },
                { icon: "comments", label: "Yorumlar", active: false },
                { icon: "cog", label: "Ayarlar", active: false },
              ].map(({ icon, label, active }) => (
                <li key={label} className="mb-4">
                  <a
                    href="#"
                    className={`flex items-center p-3 rounded-lg transition-colors ${
                      active
                        ? "bg-[#3498db] text-white"
                        : "text-gray-300 hover:bg-blue-600 hover:text-white"
                    }`}
                  >
                    <i className={`fas fa-${icon} mr-3 text-lg`}></i>
                    <span>{label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="mt-8">
          <a
            href="#"
            className="flex items-center p-3 text-gray-300 hover:bg-red-600 hover:text-white transition-colors rounded-lg"
          >
            <i className="fas fa-sign-out-alt mr-3 text-lg"></i>
            <span>Çıkış Yap</span>
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-semibold text-gray-800">Kontrol Paneli</h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Ara..."
                className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            </div>
            <button className="text-gray-600 hover:text-blue-500">
              <i className="fas fa-bell text-xl"></i>
            </button>
            <div className="flex items-center space-x-2">
              <img
                src="https://placehold.co/40x40/cccccc/ffffff?text=UY"
                alt="Kullanıcı Resmi"
                className="rounded-full w-10 h-10"
              />
              <span className="font-medium text-gray-700">Ficimord UY</span>
            </div>
          </div>
        </header>

        {/* Metrics */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { title: "Toplam Satışlar", value: "$45.210" },
            { title: "Siparişler", value: "315" },
            { title: "Ürünler", value: "120" },
            { title: "Müşteriler", value: "1.090" },
          ].map(({ title, value }) => (
            <div
              key={title}
              className="bg-white rounded-xl shadow p-6 text-center"
            >
              <h2 className="text-gray-500 text-sm font-medium uppercase mb-2">
                {title}
              </h2>
              <p className="text-3xl font-bold text-gray-900">{value}</p>
            </div>
          ))}
        </section>

        {/* Chart */}
        <section className="bg-white rounded-xl shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Satış Genel Bakışı
          </h2>
          <div className="relative h-[250px]">
            <canvas ref={chartRef} id="salesChart"></canvas>
          </div>
        </section>

        {/* Best Sellers & Recent Orders */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Best Sellers */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              En Çok Satan Ürünler
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { name: "Elbise", sales: 120 },
                { name: "Gömlek", sales: 98 },
                { name: "Tişört", sales: 75 },
                { name: "Kot Ceket", sales: 51 },
              ].map(({ name, sales }) => (
                <div
                  key={name}
                  className="bg-gray-100 p-3 rounded-md text-center"
                >
                  <p className="font-medium">{name}</p>
                  <p className="text-sm text-gray-600">{sales} satış</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Son Siparişler
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-xl">
                      Sipariş
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Müşteri
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tr-xl">
                      Tutar
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {[
                    { id: "#02134", customer: "John Doe", amount: "$49.80" },
                    { id: "#02133", customer: "Jane Smith", amount: "$49.80" },
                    { id: "#02132", customer: "Michael Brown", amount: "$99.99" },
                    { id: "#02131", customer: "Emily Johnson", amount: "$120.50" },
                  ].map(({ id, customer, amount }) => (
                    <tr key={id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {customer}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {amount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
