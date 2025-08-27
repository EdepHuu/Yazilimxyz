"use client"
import Button from "@/components/customer/Button";
import Link from "next/link";
import { useLanguage } from "./context/LanguageContext";

export default function Home() {
  const { t } = useLanguage();

  

  return (
    <>
      <section>
        <div className="image-wrapper">
          <img
            src="/home-image-1.jpg"
            alt={t("home_selected_products")}
            className="home-image"
          />
          <div className="image-overlay"></div>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center space-y-2">
            <h2 className="heading-xl">{t("home_selected_products")}</h2>
            <p className="heading-3xl">{t("home_discount")}</p>
            <Link href="/customer/urunler">
              <Button bgColor="white" className="mt-32">
                {t("home_start_shopping")}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section>
        <div className="">
          <h3 className="heading-lg-1 text-center">{t("home_new_summer_collection")}</h3>

          <div className="relative h-[498px] flex">
            <img
              src="/home-image-2.jpg"
              alt={t("home_new_summer_collection")}
              className="w-1/2 object-cover"
            />
            <img
              src="/home-image-3.jpg"
              alt={t("home_new_summer_collection")}
              className="w-1/2 object-cover"
            />
            <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
              <Button bgColor="black">{t("home_discover_now")}</Button>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h3 className="heading-lg-1 text-center">{t("home_recycle_and_earn")}</h3>
        <div className="relative">
          <img
            src="/home-image-4.jpg"
            alt={t("home_recycle_and_earn")}
            className="h-[554px] w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20 z-10"></div>
          <div className="absolute inset-0 mt-64 flex flex-col items-center justify-center text-center px-4 z-20">
            <h2 className="heading-md-1 text-white mb-4 max-w-2xl">
              {t("home_recycle_text")}
            </h2>
            <Button bgColor="black">{t("home_more_info")}</Button>
          </div>
        </div>
      </section>
    </>
  );
}
