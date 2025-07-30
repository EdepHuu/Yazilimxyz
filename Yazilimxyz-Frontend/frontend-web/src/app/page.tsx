import Button from "@/components/Button";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <section>
        <div className="image-wrapper">
          <img
            src="/home-image-1.jpg"
            alt="magaza resmi"
            className="home-image"
          />
          <div className="image-overlay"></div>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center space-y-2">
            <h2 className="heading-xl">Seçili Ürünlerde</h2>
            <p className="heading-3xl">%40 İndirim</p>
            <Link href="/urunler">
              <Button bgColor="white" className="mt-32">
                Alışverişe Başla
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section>
        <div className="">
          <h3 className="heading-lg-1 text-center">Yeni | Yaz Koleksiyonu</h3>

          <div className="relative h-[498px] flex">
            <img
              src="/home-image-2.jpg"
              alt=""
              className="w-1/2 object-cover"
            />
            <img
              src="/home-image-3.jpg"
              alt=""
              className="w-1/2 object-cover"
            />
            <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
              <Button bgColor="black">Şimdi Keşfet</Button>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h3 className="heading-lg-1 text-center">Geri Dönüştür & Kazan</h3>
        <div className="relative">
          <img
            src="/home-image-4.jpg"
            alt=""
            className="h-[554px] w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20 z-10"></div>
          <div className="absolute inset-0 mt-64 flex flex-col items-center justify-center text-center px-4 z-20">
            <h2 className="heading-md-1 text-white mb-4 max-w-2xl">
              Kullanmadığın kıyafetleri gönder, ShopEase puanı olarak indirim
              kazan
            </h2>
            <Button bgColor="black">Detaylı Bilgi İçin</Button>
          </div>
        </div>
      </section>
    </>
  );
}
