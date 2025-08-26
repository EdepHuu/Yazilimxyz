"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import axios, { AxiosError, type AxiosInstance } from "axios";
import { getMyCart, clearCart, type CartItemDto } from "@/lib/cartApi";

type Address = {
  id: number; title: string; fullName: string; phone: string;
  address: string; addressLine2?: string | null; city: string; district: string;
  postalCode: string; country: string; isDefault?: boolean;
};
type ApiEnvelope<T> = { data: T; success?: boolean; message?: string };
type OrderCreateItem = { productVariantId: number; quantity: number };
type OrderCreateRequest = { shippingAddressId: number; items: OrderCreateItem[]; note: string };

type CreatedOrder = { id: number; orderNumber: string };
type CreateResp = CreatedOrder | CreatedOrder[] | ApiEnvelope<CreatedOrder> | ApiEnvelope<CreatedOrder[]>;

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://localhost:7206";
const ENDPOINT = { listMyAddresses: "/api/CustomerAddresses/my", createOrder: "/api/Orders" };

function readCustomerToken(): string | null {
  for (const k of ["customerToken","token","access_token","id_token"]) {
    const v = typeof window !== "undefined" ? localStorage.getItem(k) : null;
    if (v && v.trim()) return v;
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

/* Sepet dönüşü farklı yapılarda olabilir → güvenli çıkar */
type CartResp = CartItemDto[] | { items: CartItemDto[] } | { data: CartItemDto[] } | { data: { items: CartItemDto[] } };
function hasItemsKey(x: unknown): x is { items: CartItemDto[] } {
  return typeof x === "object" && x !== null && "items" in (x as Record<string, unknown>);
}
function hasDataKey(x: unknown): x is { data: unknown } {
  return typeof x === "object" && x !== null && "data" in (x as Record<string, unknown>);
}
function extractCartItems(resp: CartResp): CartItemDto[] {
  if (Array.isArray(resp)) return resp;
  if (hasItemsKey(resp) && Array.isArray(resp.items)) return resp.items;
  if (hasDataKey(resp)) {
    const d = resp.data as unknown;
    if (Array.isArray(d)) return d as CartItemDto[];
    if (hasItemsKey(d) && Array.isArray(d.items)) return d.items;
  }
  return [];
}

export default function OdemePage() {
  const [client] = useState(createClient);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [addrError, setAddrError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Kart (dummy – sunucuya gönderilmiyor)
  const [cardName, setCardName] = useState("Mehmet Gani");
  const [cardNumber, setCardNumber] = useState("TR76 0009 9012 3456 7800 1000 01");
  const [expiry, setExpiry] = useState("01/01");
  const [cvc, setCvc] = useState("123");
  const [use3DS, setUse3DS] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true); setAddrError(null);
      try {
        const res = await client.get<ApiEnvelope<Address[]>>(ENDPOINT.listMyAddresses);
        const list = res.data.data ?? [];
        setAddresses(list);
        const def = list.find((x) => x.isDefault) ?? list[0] ?? null;
        setSelectedId(def ? def.id : null);
      } catch (e) {
        const ae = e as AxiosError<{ message?: string }>;
        setAddrError(ae.response?.data?.message ?? "Adresler alınamadı.");
      } finally { setLoading(false); }
    })();
  }, [client]);

  const selectedAddress = useMemo(
    () => addresses.find((a) => a.id === selectedId) ?? null, [addresses, selectedId]
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedAddress) { alert("Lütfen bir teslimat adresi seçin."); return; }

    setSubmitting(true);
    try {
      // 1) Sepeti çek
      const cartRaw = (await getMyCart()) as CartResp;
      const cartItems = extractCartItems(cartRaw);
      if (cartItems.length === 0) { alert("Sepet boş görünüyor."); return; }

      // 2) Tek POST: backend merchant’a kendi yönlendirecek
      const body: OrderCreateRequest = {
        shippingAddressId: Number(selectedAddress.id),
        items: cartItems.map<OrderCreateItem>((x) => ({
          productVariantId: Number(x.productVariantId),
          quantity: Number(x.quantity)
        })),
        note: "" // 🔴 NOT NULL kolon için daima boş string gönder
      };

      const res = await client.post<CreateResp>(ENDPOINT.createOrder, body);
      const raw = ((): CreatedOrder | CreatedOrder[] | undefined => {
        if (Array.isArray(res.data)) return res.data;
        if (hasDataKey(res.data)) return (res.data as { data?: unknown }).data as (CreatedOrder | CreatedOrder[] | undefined);
        return res.data as CreatedOrder;
      })();
      const created = !raw ? [] : (Array.isArray(raw) ? raw : [raw]);

      // 3) Dummy ödeme log (sunucuya kart gönderilmez)
      console.log("Ödeme (dummy):", {
        name: cardName.trim(), numberLast4: cardNumber.replace(/\s+/g, "").slice(-4),
        expiry, cvc: "***", use3DS, createdOrders: created
      });

      // 4) Temizle & yönlendir
      await clearCart();
      alert(
        created.length > 1
          ? `Siparişlerin oluşturuldu: ${created.map(o => "#" + o.orderNumber).join(", ")} — onay için iletildi ✅`
          : `Siparişin oluşturuldu. #${created[0]?.orderNumber ?? "—"} — onay için iletildi ✅`
      );
      window.location.href = "/customer/siparislerim";
    } catch (err) {
      const ae = err as AxiosError<{ message?: string; errors?: unknown }>;
      console.error("ORDER CREATE FAILED >>>", { status: ae.response?.status, data: ae.response?.data });
      const msg =
        ae.response?.data?.message ||
        (typeof ae.response?.data === "string" ? ae.response?.data : undefined) ||
        ae.message || "Sipariş oluşturulurken bir hata oluştu.";
      alert(msg);
    } finally { setSubmitting(false); }
  }

  const box = "rounded-xl border border-gray-200 bg-white shadow-sm";

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Ödeme</h1>

      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
        <ol className="list-reset flex gap-2">
          <li><Link href="/" className="hover:underline cursor-pointer">Anasayfa</Link><span> &gt; </span></li>
          <li><Link href="/customer/sepetim" className="hover:underline cursor-pointer">Sepetim</Link><span> &gt; </span></li>
          <li className="text-black font-semibold">Ödeme</li>
        </ol>
      </nav>

      {/* 2 kolon */}
      <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-8">
        {/* SOL: Kart bilgileri */}
        <div className="col-span-12 lg:col-span-7">
          <div className={`${box} p-6`}>
            <h2 className="text-lg font-semibold mb-4">Kart Bilgileri</h2>
            <div className="space-y-5">
              <div>
                <label className="block mb-2 font-medium">Kart Üzerindeki İsim</label>
                <input value={cardName} onChange={(e)=>setCardName(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white" />
              </div>
              <div>
                <label className="block mb-2 font-medium">Kart Numarası</label>
                <input value={cardNumber} onChange={(e)=>setCardNumber(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white" />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block mb-2 font-medium">Son Kullanma Tarihi</label>
                  <input value={expiry} onChange={(e)=>setExpiry(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white" />
                </div>
                <div className="flex-1">
                  <label className="block mb-2 font-medium">CVC</label>
                  <input value={cvc} onChange={(e)=>setCvc(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white" />
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" checked={use3DS} onChange={(e)=>setUse3DS(e.target.checked)} className="rounded border-gray-300" />
                  3D Secure ile ödemek istiyorum.
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* SAĞ: Adres + Satın Al */}
        <div className="col-span-12 lg:col-span-5">
          <div className={`${box} p-6`}>
            <h2 className="text-lg font-semibold mb-4">Teslimat Adresi</h2>

            {loading ? (
              <div className="text-sm text-gray-500">Adresler yükleniyor…</div>
            ) : addrError ? (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{addrError}</div>
            ) : addresses.length === 0 ? (
              <div className="text-sm text-gray-600">
                Kayıtlı adresin yok. <Link className="underline" href="/customer/adreslerim">Adres ekle</Link>
              </div>
            ) : (
              <div className="space-y-4">
                {addresses.map((a) => (
                  <label key={a.id} className="flex gap-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50 cursor-pointer">
                    <input type="radio" name="address" checked={selectedId === a.id} onChange={() => setSelectedId(a.id)} className="mt-1" />
                    <div className="text-sm">
                      <div className="font-medium">{a.title}</div>
                      <div>{a.fullName}</div>
                      <div>{a.address}{a.addressLine2 ? `, ${a.addressLine2}` : ""}</div>
                      <div>{a.district} / {a.city}</div>
                      <div>{a.postalCode} · {a.country}</div>
                    </div>
                  </label>
                ))}
              </div>
            )}

            <button
              type="submit"
              className="mt-6 w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-60"
              disabled={!selectedAddress || submitting}
            >
              {submitting ? "Gönderiliyor…" : "Satın Al"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
