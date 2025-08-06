"use client"; 
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

const staticCartItems = [
  {
    id: 1,
    title: "Loose Straight Jean",
    price: 1000,
    image: "/product-img-1.jpg",
    size: "36",
    quantity: 1,
  },
  {
    id: 2,
    title: "Siyah Deri Kol Çantası",
    price: 980,
    image: "/product-img-3.jpg",
    size: "Tek Beden",
    quantity: 2,
  },
];

export default function SepetimPage() {
  const router = useRouter();

  const subtotal = staticCartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const shippingCost = 100;
  const total = subtotal + shippingCost;

  const handleCheckout = () => {
    router.push("/customer/odeme"); // yönlendirme buradan oluyor
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Sepet</h1>

      <nav
        className="text-sm text-gray-500 mb-6"
        aria-label="Breadcrumb"
      >
        <ol className="list-reset flex gap-2">
          <li>
            <Link href="/" className="hover:underline cursor-pointer">
              Anasayfa
            </Link>
            <span> &gt; </span>
          </li>
          <li className="text-black font-semibold">Sepetim</li>
        </ol>
      </nav>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          {staticCartItems.length === 0 ? (
            <p>Sepetinizde ürün bulunmamaktadır.</p>
          ) : (
            <div className="bg-white rounded-lg p-6">
              <div className="grid grid-cols-5 text-gray-500 border-b pb-4 mb-4">
                <div className="col-span-2">Ürün</div>
                <div>Fiyat</div>
                <div>Adet</div>
                <div>Toplam</div>
                <div></div>
              </div>

              {staticCartItems.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-5 items-center mb-6 border-b pb-6 last:border-b-0 last:pb-0"
                >
                  <div className="col-span-2 flex items-center gap-4">
                    <Image
                      src={item.image}
                      alt={item.title}
                      width={80}
                      height={100}
                      className="object-cover rounded"
                    />
                    <div>
                      <h2 className="font-semibold">{item.title}</h2>
                      <p className="text-sm text-gray-500">
                        Ürün Kodu: {item.id}
                      </p>
                      <p className="text-sm text-gray-500">
                        Beden: {item.size}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold">
                      {item.price.toLocaleString("tr-TR", {
                        style: "currency",
                        currency: "TRY",
                      })}
                    </p>
                  </div>
                  <div>
                    <p>{item.quantity}</p>
                  </div>
                  <div>
                    <p className="font-semibold">
                      {(item.price * item.quantity).toLocaleString("tr-TR", {
                        style: "currency",
                        currency: "TRY",
                      })}
                    </p>
                  </div>
                  <div>
                    <button className="text-gray-400 hover:text-red-500">
                      X
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:w-1/3 bg-white rounded-lg p-6 h-fit">
          <h2 className="text-xl font-bold mb-4">Sepet Toplamı</h2>
          <div className="flex justify-between mb-2">
            <p>Sipariş Toplamı</p>
            <p className="font-semibold">
              {subtotal.toLocaleString("tr-TR", {
                style: "currency",
                currency: "TRY",
              })}
            </p>
          </div>
          <div className="flex justify-between mb-4">
            <p>Kargo</p>
            <p className="font-semibold">
              {shippingCost.toLocaleString("tr-TR", {
                style: "currency",
                currency: "TRY",
              })}
            </p>
          </div>
          <div className="flex justify-between font-bold text-lg border-t pt-4 mt-4">
            <p>Toplam</p>
            <p>
              {total.toLocaleString("tr-TR", {
                style: "currency",
                currency: "TRY",
              })}
            </p>
          </div>
          <button>Sepete Ekle</button>
          <button
            onClick={handleCheckout}
            className="w-full bg-black text-white py-3 mt-6 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
          >
            Satın Al
          </button>
        </div>
      </div>
    </div>
  );
}