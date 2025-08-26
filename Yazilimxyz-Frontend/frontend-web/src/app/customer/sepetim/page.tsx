"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getMyCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
  CartItemDto,
} from "@/lib/cartApi";

/* === ENV === */
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

/* Yardımcı: para formatı (TRY) */
function fmtTRY(v: number): string {
  return v.toLocaleString("tr-TR", { style: "currency", currency: "TRY" });
}

/* Olası boş alanlar için güvenli okuma */
function safeNumber(n: unknown, fallback = 0): number {
  return typeof n === "number" && Number.isFinite(n) ? n : fallback;
}

/* Sadece CART görseli için güvenli URL oluşturucu
   - productImageUrl varsa onu, yoksa imageUrl’i kullanır
   - relatif yolları API_BASE ile birleştirir
   - boşsa placeholder döner
*/
function buildCartImageUrl(it: CartItemDto): string {
  const rec = it as unknown as Record<string, unknown>;
  const raw =
    (typeof rec.productImageUrl === "string" && rec.productImageUrl) ||
    (typeof rec.imageUrl === "string" && rec.imageUrl) ||
    "";
  const val = raw.trim();
  if (!val) return "/placeholder-image.jpg";
  if (/^https?:\/\//i.test(val)) return val; // absolute URL
  const path = val.startsWith("/") ? val : `/${val}`;
  return `${API_BASE}${path}`;
}

export default function SepetimPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItemDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [workingId, setWorkingId] = useState<number | null>(null); // tek tek buton disable

  // İlk yükleme
  useEffect(() => {
    (async () => {
      try {
        const res = await getMyCart();
        setItems(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        console.error(e);
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Tutar hesapları
  const shippingCost = 100; // tasarımda sabitti
  const subtotal = useMemo(() => {
    return items.reduce((acc, it) => {
      const unit = safeNumber(it.unitPrice, 0);
      const q = safeNumber(it.quantity, 0);
      return acc + unit * q;
    }, 0);
  }, [items]);
  const total = useMemo(() => subtotal + shippingCost, [subtotal]);

  // Adet artır/azalt
  async function changeQty(it: CartItemDto, delta: number) {
    const next = Math.max(1, safeNumber(it.quantity, 1) + delta);
    setWorkingId(it.id);
    try {
      const res = await updateCartItemQuantity(it.id, next);
      setItems(Array.isArray(res.data) ? res.data : items.map(x => x.id === it.id ? { ...x, quantity: next } : x));
    } catch (e) {
      console.error(e);
      alert("Adet güncellenemedi.");
    } finally {
      setWorkingId(null);
    }
  }

  // Sil
  async function removeLine(it: CartItemDto) {
    if (!confirm("Ürünü sepetten kaldırmak istiyor musunuz?")) return;
    setWorkingId(it.id);
    try {
      const res = await removeCartItem(it.id);
      setItems(Array.isArray(res.data) ? res.data : items.filter(x => x.id !== it.id));
    } catch (e) {
      console.error(e);
      alert("Ürün kaldırılamadı.");
    } finally {
      setWorkingId(null);
    }
  }

  // Sepeti temizle
  async function clearAll() {
    if (!confirm("Sepeti tamamen temizlemek istiyor musunuz?")) return;
    setWorkingId(-1);
    try {
      await clearCart();
      setItems([]);
    } catch (e) {
      console.error(e);
      alert("Sepet temizlenemedi.");
    } finally {
      setWorkingId(null);
    }
  }

  function handleCheckout() {
    router.push("/customer/odeme");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Sepet</h1>

      <nav className="text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
        <ol className="list-reset flex gap-2">
          <li>
            <Link href="/" className="hover:underline cursor-pointer">Anasayfa</Link>
            <span> &gt; </span>
          </li>
          <li className="text-black font-semibold">Sepetim</li>
        </ol>
      </nav>

      {loading ? (
        <div className="text-gray-600">Yükleniyor…</div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            {items.length === 0 ? (
              <div className="bg-white rounded-lg p-6">
                <p>Sepetinizde ürün bulunmamaktadır.</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg p-6">
                <div className="grid grid-cols-5 text-gray-500 border-b pb-4 mb-4">
                  <div className="col-span-2">Ürün</div>
                  <div>Fiyat</div>
                  <div>Adet</div>
                  <div>Toplam</div>
                  <div></div>
                </div>

                {items.map((it) => {
                  const unit = safeNumber(it.unitPrice, 0);
                  const qty = safeNumber(it.quantity, 1);
                  const lineTotal = unit * qty;
                  return (
                    <div
                      key={it.id}
                      className="grid grid-cols-5 items-center mb-6 border-b pb-6 last:border-b-0 last:pb-0"
                    >
                      <div className="col-span-2 flex items-center gap-4">
                        <Image
                          src={buildCartImageUrl(it)}
                          alt={it.productName ?? "Ürün"}
                          width={80}
                          height={100}
                          className="object-cover rounded"
                          unoptimized  
                        />
                        <div>
                          <h2 className="font-semibold">{it.productName ?? `Ürün #${it.productVariantId}`}</h2>
                          <p className="text-sm text-gray-500">Varyant: {it.size ?? "-"} {it.color ? `/ ${it.color}` : ""}</p>
                        </div>
                      </div>

                      <div>
                        <p className="font-semibold">{fmtTRY(unit)}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => changeQty(it, -1)}
                          disabled={workingId === it.id}
                          className="px-2 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
                          aria-label="Azalt"
                        >
                          -
                        </button>
                        <span className="min-w-[2ch] text-center">{qty}</span>
                        <button
                          onClick={() => changeQty(it, +1)}
                          disabled={workingId === it.id}
                          className="px-2 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
                          aria-label="Arttır"
                        >
                          +
                        </button>
                      </div>

                      <div>
                        <p className="font-semibold">{fmtTRY(lineTotal)}</p>
                      </div>

                      <div>
                        <button
                          onClick={() => removeLine(it)}
                          disabled={workingId === it.id}
                          className="text-gray-400 hover:text-red-500 disabled:opacity-50"
                          aria-label="Kaldır"
                          title="Kaldır"
                        >
                          X
                        </button>
                      </div>
                    </div>
                  );
                })}

                <div className="flex justify-between mt-2">
                  <button
                    onClick={clearAll}
                    disabled={workingId !== null}
                    className="text-sm text-gray-600 hover:underline disabled:opacity-50"
                  >
                    Sepeti Temizle
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="lg:w-1/3 bg-white rounded-lg p-6 h-fit">
            <h2 className="text-xl font-bold mb-4">Sepet Toplamı</h2>
            <div className="flex justify-between mb-2">
              <p>Sipariş Toplamı</p>
              <p className="font-semibold">{fmtTRY(subtotal)}</p>
            </div>
            <div className="flex justify-between mb-4">
              <p>Kargo</p>
              <p className="font-semibold">{fmtTRY(shippingCost)}</p>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-4 mt-4">
              <p>Toplam</p>
              <p>{fmtTRY(total)}</p>
            </div>
            <button
              onClick={handleCheckout}
              disabled={items.length === 0}
              className="w-full bg-black text-white py-3 mt-6 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              Satın Al
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
