'use client';

import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/customer/Navbar";
import Footer from "@/components/customer/Footer";
import { CartProvider } from "@/context/CartContext";
import { usePathname } from "next/navigation";
import '../../../src/app/globals.css'
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");

  return (
    <html lang="en">
      <body
        className={`min-h-screen flex flex-col ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <CartProvider>
          {!isAdminRoute && <Navbar />}
          <main className="flex-1">{children}</main>
          {!isAdminRoute && <Footer />}
        </CartProvider>
      </body>
    </html>
  );
}
