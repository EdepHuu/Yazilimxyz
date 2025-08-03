"use client";

import { FavoriteIcon, SearchIcon, ShopIcon, UserIcon } from "@/icons/icon";
import Link from "next/link";
import { useState } from "react";

const navLinks = ["Tüm Kategoriler", "Kadın", "Erkek", "Çocuk", "Outlet"];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };
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
          <Link href="/giris">
            <UserIcon />
          </Link>
          <Link href="/sepet">
            <ShopIcon />
          </Link>
        </div>
      </nav>

      <nav className="mb-30 md:hidden flex flex-col">
        <div className="flex-1 fixed pt-4 z-50 bg-white w-full px-2">
          <div className="container flex items-center justify-between space-x-6">
            <div className="flex gap-4">
              <button
                className={`menu ${isOpen ? "opened" : ""} z-60`}
                onClick={toggleMenu}
                aria-label="Main Menu"
              >
                <svg width="40" height="40" viewBox="0 0 100 100">
                  <path
                    className="line line1"
                    d="M 20,29.000046 H 80.000231 C 80.000231,29.000046 94.498839,28.817352 94.532987,66.711331 94.543142,77.980673 90.966081,81.670246 85.259173,81.668997 79.552261,81.667751 75.000211,74.999942 75.000211,74.999942 L 25.000021,25.000058"
                  />
                  <path className="line line2" d="M 20,50 H 80" />
                  <path
                    className="line line3"
                    d="M 20,70.999954 H 80.000231 C 80.000231,70.999954 94.498839,71.182648 94.532987,33.288669 94.543142,22.019327 90.966081,18.329754 85.259173,18.331003 79.552261,18.332249 75.000211,25.000058 75.000211,25.000058 L 25.000021,74.999942"
                  />
                </svg>
              </button>

              <div className="text-4xl font-bold text-gray-800">ShopEase</div>
            </div>

            <div className="flex gap-4">
              <Link href="/login">
                <UserIcon />
              </Link>
              <Link href="/sepet">
                <ShopIcon />
              </Link>
            </div>
          </div>

          {isOpen && (
            <div className="fixed inset-0 bg-white z-50 p-4 overflow-y-auto">
              <div className="text-4xl font-bold text-gray-800 flex justify-end">
                ShopEase
              </div>
              <div className="flex flex-col gap-4 mt-12">
                {navLinks.map((link, index) => (
                  <Link
                    key={index}
                    href={`/${link.toLowerCase().replace(/\s+/g, "-")}`}
                    onClick={() => setIsOpen(false)}
                    className="bg-gray-200 p-3 rounded-xl"
                  >
                    <span className="text-md font-semibold text-gray-800 hover:underline">
                      {link}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="relative w-full my-4">
            <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
              <SearchIcon className="w-3 h-3 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="arama yap"
              className="w-full pl-2 pr-8 py-2 border-none bg-gray rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
          </div>
        </div>
      </nav>
    </>
  );
}
