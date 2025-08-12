import '../globals.css';

export const metadata = {
  title: 'ShopEase | Satıcı Girişi',
};

export default function MerchantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      {/* Sabit footer ile çakışmasın diye min-h + flex-col, ama esas çözüm main padding */}
      <body className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900">
        {/* Üst navbar */}
        <header className="bg-[#1B2A41] text-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              {/* Logo / Marka */}
              <span className="text-2xl font-bold">ShopEase</span>
              <span className="text-lg font-medium opacity-90">Satıcı Başvuru Formu</span>
            </div>
            <nav className="flex items-center gap-8 text-lg font-medium">
              <a href="#" className="hover:underline">Satıcı Bilgi Merkezi</a>
              <a href="#" className="hover:underline">Nasıl Başvuru Yapabilirim?</a>
            </nav>
          </div>
        </header>


        {/* İçerik - sabit footer’ın üstünde boşluk bırakalım */}
        <main className="flex-1 pb-20 md:pb-24">
          {children}
        </main>

        {/* SABİT FOOTER */}
        <footer className="fixed inset-x-0 bottom-0 z-50 border-t bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-4 text-xs text-neutral-500 md:flex-row">
            <span>©2025 ShopEase Teknoloji ve Ticaret A.Ş. Tüm hakları saklıdır.</span>
            <span>Satıcı Destek Hattı: 0 850 258 5 800</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
