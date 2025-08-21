import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Yazilimxyz Admin Giriş",
  description: "Yönetim paneli için giriş sayfası",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
