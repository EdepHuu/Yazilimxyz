"use client";
import Link from "next/link";
import { useState } from "react";

const tabs = ["Giriş Yap", "Üye Ol", "Bizimle Çalış"];

export default function Tabs() {
  const [activeTab, setActiveTab] = useState("Giriş Yap");
  const [seller, setSeller] = useState<string | null>(null);

  return (
    <div className="w-full max-w-md mx-auto my-12">
      <div className="text-center mb-6">
        <span className="block text-xl"> Merhaba,</span>
        ShopEase’a giriş yap veya hesap oluştur, indirimleri kaçırma!
      </div>
      <div className="flex bg-gray-100 rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 heading-sm-1 rounded-lg transition-all duration-200
              ${
                activeTab === tab
                  ? "bg-white text-black shadow"
                  : "text-gray-500 hover:text-black"
              }
            `}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {activeTab === "Giriş Yap" && (
          <div>
            <div>
              <label className="block heading-sm-2 mb-1">E-posta</label>
              <input
                type="email"
                placeholder="ornek@mail.com"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500"
              />
            </div>
            <div className="mt-4">
              <label className="block heading-sm-2 mb-1">Şifre</label>
              <input
                type="password"
                placeholder="*****"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500"
              />
            </div>
            <div>
              <button className="w-full heading-sm-2 rounded-lg mt-8 px-4 py-2 bg-gray-300">
                Giriş yap
              </button>
            </div>
          </div>
        )}
        {activeTab === "Üye Ol" && (
          <div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Telefon Numarası
              </label>
              <input
                type="tel"
                placeholder="+90 5xx xxx xx xx"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500"
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">
                E-posta Adresi
              </label>
              <input
                type="email"
                placeholder="ornek@mail.com"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500"
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">Şifre</label>
              <input
                type="password"
                placeholder="*****"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500"
              />
            </div>
            <div className="flex items-center mt-4">
              <input
                type="checkbox"
                id="sozlesme"
                className="mr-2 rounded border-gray-300 text-gray-600 focus:ring-1 focus:ring-gray-500"
              />
              <label htmlFor="sozlesme" className="text-sm text-gray-700">
                <span className="font-medium">Kullanıcı Sözleşmesi’ni</span>{" "}
                okudum ve kabul ediyorum.
              </label>
            </div>

            <div>
              <button className="w-full heading-sm-2 rounded-lg mt-6 px-4 py-2 bg-gray-300">
                Üye Ol
              </button>
            </div>
          </div>
        )}

        {activeTab === "Bizimle Çalış" && (
          <div>
            <div className="text-center">
              <label className="block heading-sm-1 mb-2">
                ShopEase'te satıcı olmak ister misiniz?
              </label>
              <div className="flex gap-4 justify-center">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="saticiOlmak"
                    value="evet"
                    checked={seller === "evet"}
                    onChange={() => setSeller("evet")}
                    className="mr-2"
                  />
                  Evet
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="saticiOlmak"
                    value="hayir"
                    checked={seller === "hayir"}
                    onChange={() => setSeller("hayir")}
                    className="mr-2"
                  />
                  Hayır
                </label>
              </div>
            </div>

            {seller === "evet" && (
              <div className="mt-6 space-y-4">
                <div>
                  <label className="block heading-sm-2 mb-1">Firma Adı</label>
                  <input
                    type="text"
                    placeholder="Firma / Marka Adı"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>

                <div>
                  <label className="block heading-sm-2 mb-1">E-posta</label>
                  <input
                    type="email"
                    placeholder="firma@mail.com"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>

                <div>
                  <label className="block heading-sm-2 mb-1">Telefon</label>
                  <input
                    type="tel"
                    placeholder="+90 5xx xxx xx xx"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>

                <div>
                  <label className="block heading-sm-2 mb-1">
                    Kısa Açıklama
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Ne tür ürünler satmak istiyorsunuz? Kısaca bahsedin."
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  ></textarea>
                </div>

                <div className="flex items-center">
                  <input type="checkbox" id="kvkk" className="mr-2" />
                  <label htmlFor="kvkk" className="text-sm">
                    KVKK metnini okudum ve kabul ediyorum.
                  </label>
                </div>

                <Link href="/satici-paneli">
                  <button className="w-full heading-sm-2 rounded-lg mt-2 px-4 py-2 bg-gray-300">
                    Başvur
                  </button>
                </Link>
              </div>
            )}

            {seller === "hayir" && (
              <div className="mt-6 heading-sm-2 text-center text-gray-600">
                Anladık, şu anlık satıcı olmak istemiyorsunuz. Fikrinizi
                değiştirirseniz buradayız! 😊
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
