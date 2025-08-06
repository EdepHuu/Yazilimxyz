"use client";

import React from "react";
import Link from "next/link";
import Navbar from "@/components/customer/Navbar";
import Footer from "@/components/customer/Footer";

export default function odemePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Ödeme</h1>

      <nav className="text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
        <ol className="list-reset flex gap-2">
          <li>
            <Link href="/" className="hover:underline cursor-pointer">
              Anasayfa
            </Link>
            <span> &gt; </span>
          </li>
          <li>
            <Link href="/customer/sepetim" className="hover:underline cursor-pointer">
              Sepetim
            </Link>
            <span> &gt; </span>
          </li>
          <li className="text-black font-semibold">Ödeme</li>
        </ol>
      </nav>

      <div className="bg-white rounded-lg p-6 max-w-2xl mx-auto">
        <form className="space-y-6">
          <div>
            <label className="block mb-2 font-medium">Kart Üzerindeki İsim</label>
            <input
              type="text"
              placeholder="Ad Soyad"
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">Kart Numarası</label>
            <input
              type="text"
              placeholder="1234 5678 9012 3456"
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block mb-2 font-medium">Son Kullanma Tarihi</label>
              <input
                type="text"
                placeholder="AA/YY"
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>
            <div className="flex-1">
              <label className="block mb-2 font-medium">CVC</label>
              <input
                type="text"
                placeholder="123"
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block mb-2 font-medium">Teslimat Adresi</label>
            <textarea
              rows={3}
              placeholder="Adresinizi buraya girin..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
          >
            Satın Al
          </button>
        </form>
      </div>
    </div>
  );
}
