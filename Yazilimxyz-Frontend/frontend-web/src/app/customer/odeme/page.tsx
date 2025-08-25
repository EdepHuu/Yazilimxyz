"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import axios, { AxiosError, AxiosInstance } from "axios";

/* --- Tipler --- */
type Address = {
  id: number;
  title: string;
  fullName: string;
  phone: string;
  address: string;
  addressLine2?: string | null;
  city: string;
  district: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
};
type ApiEnvelope<T> = { data: T; success?: boolean; message?: string };

/* --- API yardımcıları (adresler için) --- */
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://localhost:7206";
const ENDPOINT = { listMy: "/api/CustomerAddresses/my" };

function readCustomerToken(): string | null {
  const keys = ["customerToken", "token", "access_token", "id_token"];
  for (const k of keys) {
    const v = typeof window !== "undefined" ? localStorage.getItem(k) : null;
    if (v) return v;
  }
  return null;
}
function createClient(): AxiosInstance {
  const token = readCustomerToken();
  return axios.create({
    baseURL: API_BASE,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
}

/* --- Sayfa --- */
export default function OdemePage() {
  const [client] = useState(createClient);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Dummy kart state (prefilled)
  const [cardName, setCardName] = useState("Gani");
  const [cardNumber, setCardNumber] = useState("0101 0101 0101 010"); // dummy
  const [expiry, setExpiry] = useState("01/01");
  const [cvc, setCvc] = useState("123");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await client.get<ApiEnvelope<Address[]>>(ENDPOINT.listMy);
        const list = res.data.data ?? [];
        setAddresses(list);
        const def = list.find((x) => x.isDefault) ?? list[0] ?? null;
        setSelectedId(def ? def.id : null);
      } catch (e) {
        const ae = e as AxiosError<{ message?: string }>;
        setError(ae.response?.data?.message ?? "Adresler alınamadı.");
      } finally {
        setLoading(false);
      }
    })();
  }, [client]);

  const selectedAddress = useMemo(() => addresses.find((a) => a.id === selectedId) ?? null, [addresses, selectedId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAddress) {
      alert("Lütfen bir teslimat adresi seçin.");
      return;
    }
    // DUMMY ödeme sonucu
    const payload = {
      card: {
        name: cardName.trim(),
        numberLast4: cardNumber.replace(/\s+/g, "").slice(-4),
        expiry,
        cvc: "***",
      },
      shippingAddressId: selectedAddress.id,
    };
    console.log("Ödeme (dummy) gönderildi:", payload);
    alert("Ödeme başarılı ✅");
  };

  const boxCls = "rounded-xl border border-gray-200 bg-white shadow-sm";

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Ödeme</h1>

      {/* Breadcrumb */}
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

      {/* 2 kolon: Sol kart kutusu, sağ adres seçimi */}
      <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-8">
        {/* SOL: Kart bilgileri */}
        <div className="col-span-12 lg:col-span-7">
          <div className={`${boxCls} p-6`}>
            <h2 className="text-lg font-semibold mb-4">Kart Bilgileri</h2>

            <div className="space-y-5">
              <div>
                <label className="block mb-2 font-medium">Kart Üzerindeki İsim</label>
                <input
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">Kart Numarası</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white"
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block mb-2 font-medium">Son Kullanma Tarihi</label>
                  <input
                    type="text"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white"
                  />
                </div>
                <div className="flex-1">
                  <label className="block mb-2 font-medium">CVC</label>
                  <input
                    type="text"
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SAĞ: Adres seçim + satın al */}
        <div className="col-span-12 lg:col-span-5">
          <div className={`${boxCls} p-6`}>
            <h2 className="text-lg font-semibold mb-4">Teslimat Adresi</h2>

            {loading ? (
              <div className="text-sm text-gray-500">Adresler yükleniyor…</div>
            ) : error ? (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
            ) : addresses.length === 0 ? (
              <div className="text-sm text-gray-600">
                Kayıtlı adresin yok. <Link className="underline" href="/customer/adreslerim">Adres ekle</Link>
              </div>
            ) : (
              <div className="space-y-4">
                {addresses.map((a) => (
                  <label key={a.id} className="flex gap-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="address"
                      checked={selectedId === a.id}
                      onChange={() => setSelectedId(a.id)}
                      className="mt-1"
                    />
                    <div className="text-sm">
                      <div className="font-medium">{a.title}</div>
                      <div>{a.fullName}</div>
                      <div>
                        {a.address}
                        {a.addressLine2 ? `, ${a.addressLine2}` : ""}
                      </div>
                      <div>
                        {a.district} / {a.city}
                      </div>
                      <div>
                        {a.postalCode} · {a.country}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}

            {/* Satın al butonu */}
            <button
              type="submit"
              className="mt-6 w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
              disabled={!selectedAddress}
            >
              Satın Al
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
