"use client";

import {
  EmailIcon,
  InstagramIcon,
  MapIcon,
  PhoneIcon,
  TwitterIcon,
} from "@/components/customer/icons/icon";

export default function Footer() {
  return (
    <footer className="bg-gray-100 text-black py-10 mb-12 md:mb-0">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <h2 className="text-2xl font-semibold mb-2">ShopEase</h2>
          <p className="heading-sm-3">
            En iyi fırsatlar ve ürünlerle alışveriş keyfini yaşayın.
          </p>
        </div>
        <div>
          <h3 className="font-semibold heading-md-5 mb-3 ">Kampanyalar</h3>
          <ul className="space-y-2 heading-sm-3">
            <li>
              <a href="#" className="hover:underline">
                İndirimli Ürünler
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                En Çok Satanlar
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Haftanın Ürünleri
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Yeni Ürünler
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Fırsat Ürünleri
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="heading-md-5 font-semibold mb-3">İletişim</h3>
          <ul className="space-y-3  heading-sm-3">
            <li className="flex items-center gap-2">
              <PhoneIcon />
              +90 555 123 45 67
            </li>
            <li className="flex items-center gap-2">
              <EmailIcon />
              destek@shopease.com
            </li>
            <li className="flex items-center gap-2">
              <MapIcon />
              İstanbul, Türkiye
            </li>
          </ul>
        </div>
        <div>
          <h3 className="heading-md-5 mb-3 font-semibold">
            E-Bültene Kayıt Ol
          </h3>
          <p className="mb-4  heading-sm-3">
            Kampanyalardan ve yeniliklerden ilk sen haberdar ol!
          </p>
          <form className="flex flex-col sm:flex-row items-center gap-2">
            <input
              type="email"
              placeholder="E-posta adresiniz"
              className="w-full px-3 py-2 border rounded-md text-sm"
            />
            <button
              type="submit"
              className="bg-gray-800 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-700"
            >
              Gönder
            </button>
          </form>

          <div className="mt-4">
            SOSYAL MEDYA
            <div className="flex gap-6 mt-2">
              <InstagramIcon />
              <TwitterIcon />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
