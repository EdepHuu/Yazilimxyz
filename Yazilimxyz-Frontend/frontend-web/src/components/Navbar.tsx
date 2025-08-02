"use client";



import { FavoriteIcon, SearchIcon, ShopIcon, UserIcon } from "@/icons/icon";
import Link from "next/link";

const navLinks = ["Kadın", "Erkek", "Çocuk", "Outlet"];

export default function Navbar() {
  return (
    <>
      <nav className="container hidden md:flex h-16 items-center justify-between">
        <div className="flex space-x-2 md:space-x-4 lg:space-x-8">
          {navLinks.map((link, index) => (
            <Link
              key={index}
              href={`/${link.toLowerCase().replace(/\s+/g, "-")}`}
            >
              <span className="heading-sm-3 md:heading-md-4 cursor-pointer">
                {link}
              </span>
            </Link>
          ))}
        </div>

        <div className="text-xl font-bold tracking-wide text-gray-800">
          ShopEase
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative w-full">
            <div className="absolute inset-y-0 right-0 pr-2 flex items-center ">
              <SearchIcon className="w-3 h-3 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="arama yap"
              className="w-full pl-2 pr-8 py-2 border-none bg-gray rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
          </div>
          <Link href="/login">
            <UserIcon />
          </Link>
          <Link href="/sepet">
            <ShopIcon />
          </Link>
        </div>
      </nav>

      <nav className="container md:hidden mt-8 flex flex-col">
        <div className="flex-1">
          <div className="flex items-center justify-center space-x-6">
            <div className="text-4xl font-bold tracking-wide text-gray-800">
              ShopEase
            </div>
            <Link href="/login">
              <UserIcon />
            </Link>
            <Link href="/sepet">
              <ShopIcon />
            </Link>
          </div>

          <div className="relative w-full my-4">
            <div className="absolute inset-y-0 right-0 pr-2 flex items-center ">
              <SearchIcon className="w-3 h-3 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="arama yap"
              className="w-full pl-2 pr-8 py-2 border-none bg-gray rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
          </div>
        </div>

        <div className="w-full bg-white py-2 flex justify-center gap-8 fixed bottom-0 left-0">
          <div className="flex flex-col items-center">
            <div className="text-lg font-bold tracking-wide text-gray-800">
              ShopEase
            </div>
            <Link href="/">Anasayfa</Link>
          </div>
          <div className="flex flex-col items-center">
            <SearchIcon />
            <Link href="/kategoriler">Kategoriler</Link>
          </div>
          <div className="flex flex-col items-center">
            <ShopIcon />
            <Link href="/sepet">Sepetim</Link>
          </div>
          <div className="flex flex-col items-center">
            <FavoriteIcon />
            <Link href="/favoriler">Favoriler</Link>
          </div>
        </div>
      </nav>
    </>
  );
}
