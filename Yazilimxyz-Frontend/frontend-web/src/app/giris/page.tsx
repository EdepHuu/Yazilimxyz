'use client';

import React, { useState } from 'react';
import axios from 'axios';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}${process.env.NEXT_PUBLIC_LOGIN_ENDPOINT}`,
        { email, password }
      );

      const data = response.data;

      if (data.success) {
      localStorage.setItem('token', data.token);
      setMessage('✅ Giriş başarılı!');

      //Giriş başarılıysa urunler sayfasına yönlendir
      window.location.href = '/urunler';
      } else {
        setMessage(`❌ ${data.message}`);
      }
    } catch (error) {
      setMessage('❌ Hata: Sunucuya bağlanılamadı.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Giriş Yap</h1>
      <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
        <input
          type="email"
          placeholder="E-posta"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="password"
          placeholder="Şifre"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded"
        >
          Giriş Yap
        </button>
      </form>
      {message && <p className="mt-4 text-sm">{message}</p>}
    </div>
  );
};

export default LoginPage;
