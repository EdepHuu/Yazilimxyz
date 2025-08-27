"use client";

import {
  EmailIcon,
  InstagramIcon,
  MapIcon,
  PhoneIcon,
  TwitterIcon,
} from "@/components/customer/icons/icon";
import { useLanguage } from "@/app/customer/context/LanguageContext";

export default function Footer() {
  const { t } = useLanguage(); 

  return (
    <footer className="bg-gray-100 text-black py-10 mb-12 md:mb-0">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <h2 className="text-2xl font-semibold mb-2">ShopEase</h2>
          <p className="heading-sm-3">
            {t("footer_description")}
          </p>
        </div>
        <div>
          <h3 className="font-semibold heading-md-5 mb-3">{t("campaigns")}</h3>
          <ul className="space-y-2 heading-sm-3">
            <li><a href="#" className="hover:underline">{t("discounted_products")}</a></li>
            <li><a href="#" className="hover:underline">{t("best_sellers")}</a></li>
            <li><a href="#" className="hover:underline">{t("weekly_products")}</a></li>
            <li><a href="#" className="hover:underline">{t("new_products")}</a></li>
            <li><a href="#" className="hover:underline">{t("special_offers")}</a></li>
          </ul>
        </div>

        <div>
          <h3 className="heading-md-5 font-semibold mb-3">{t("contact")}</h3>
          <ul className="space-y-3 heading-sm-3">
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
          <h3 className="heading-md-5 mb-3 font-semibold">{t("newsletter")}</h3>
          <p className="mb-4 heading-sm-3">{t("newsletter_text")}</p>
          <form className="flex flex-col sm:flex-row items-center gap-2">
            <input
              type="email"
              placeholder={t("email_placeholder")}
              className="w-full px-3 py-2 border rounded-md text-sm"
            />
            <button
              type="submit"
              className="bg-gray-800 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-700"
            >
              {t("send")}
            </button>
          </form>

          <div className="mt-4">
            {t("social_media")}
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
