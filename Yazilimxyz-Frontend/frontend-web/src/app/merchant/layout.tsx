import "../globals.css";

export const metadata = {
  title: "ShopEase | Satıcı Girişi",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body className="bg-neutral-50 text-neutral-900">
        {children}
      </body>
    </html>
  );
}
