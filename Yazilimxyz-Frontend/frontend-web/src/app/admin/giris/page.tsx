'use client';

import React from 'react';

const LoginPage = () => {
  return (
    <div className="min-h-screen bg-[#fff3e0] flex items-center justify-center overflow-hidden">
      <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-lg w-full relative z-10">
        <div className="text-center mb-10">
          <i className="fas fa-store-alt text-5xl text-[#f39c12] mb-4"></i>
          <h1 className="text-4xl font-extrabold text-gray-800 mb-3">Satıcı Paneli</h1>
          <p className="text-gray-600 text-lg">Hesabınıza giriş yaparak yönetmeye başlayın</p>
        </div>

        <form>
          <div className="mb-5">
            <label htmlFor="email" className="block text-gray-700 text-base font-medium mb-2">
              E-posta Adresi
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="e-posta@ornek.com"
              className="border border-gray-300 rounded-xl px-5 py-4 w-full text-base focus:outline-none focus:border-[#f39c12] focus:ring-2 focus:ring-[#f39c12]/30"
              required
            />
          </div>

          <div className="mb-7">
            <label htmlFor="password" className="block text-gray-700 text-base font-medium mb-2">
              Şifre
            </label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Şifreniz"
              className="border border-gray-300 rounded-xl px-5 py-4 w-full text-base focus:outline-none focus:border-[#f39c12] focus:ring-2 focus:ring-[#f39c12]/30"
              required
            />
          </div>

          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                className="h-5 w-5 text-[#f39c12] focus:ring-[#f39c12] border-gray-300 rounded-md"
              />
              <label htmlFor="rememberMe" className="ml-2 block text-base text-gray-900">
                Beni Hatırla
              </label>
            </div>
            <a href="#" className="text-base text-[#f39c12] hover:text-[#e67e22] font-medium">
              Şifremi Unuttum?
            </a>
          </div>

          <button
            type="submit"
            className="bg-[#f39c12] hover:bg-[#e67e22] text-white rounded-xl transition duration-300 transform hover:-translate-y-0.5 font-semibold py-4 text-xl w-full"
          >
            Giriş Yap
          </button>
        </form>

        <div className="mt-8 text-center text-base text-gray-600">
          Hesabınız yok mu?{' '}
          <a href="#" className="text-[#f39c12] hover:text-[#e67e22] font-bold">
            Kayıt Olun
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
