"use client";

import React, { useState } from "react";

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface SubmittedMessage {
  id: string;
  senderName: string;
  subject: string;
  message: string;
  timestamp: string;
}

export default function AdminContactPage() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [submittedMessages, setSubmittedMessages] = useState<SubmittedMessage[]>([
    { id: "msg1", senderName: "Ahmet Yılmaz", subject: "Destek Talebi", message: "Hesabıma giriş yapamıyorum.", timestamp: "2024-08-18 11:30" },
    { id: "msg2", senderName: "Ayşe Kaya", subject: "Geri Bildirim", message: "Yeni özellikler harika olmuş!", timestamp: "2024-08-17 15:00" },
    { id: "msg3", senderName: "Mehmet Çelik", subject: "Hata Raporu", message: "Mobil uygulamada bir hata buldum.", timestamp: "2024-08-16 09:45" },
  ]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setMessage({ type: 'error', text: "Lütfen tüm alanları doldurunuz." });
      setIsLoading(false);
      return;
    }

    setTimeout(() => {
      try {
        const newMessage: SubmittedMessage = {
          id: `msg${submittedMessages.length + 1}`,
          senderName: formData.name,
          subject: formData.subject,
          message: formData.message,
          timestamp: new Date().toLocaleString(),
        };
        setSubmittedMessages(prev => [newMessage, ...prev]);
        setMessage({ type: 'success', text: "Mesajınız başarıyla gönderildi! En kısa sürede size dönüş yapacağız." });
        setFormData({ name: "", email: "", subject: "", message: "" });
      } catch (err) {
        console.error("Form gönderimi başarısız oldu:", err);
        setMessage({ type: 'error', text: "Mesajınız gönderilirken bir hata oluştu. Lütfen tekrar deneyin." });
      } finally {
        setIsLoading(false);
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full bg-white p-8 md:p-12 rounded-2xl shadow-xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Admin - İletişim Formu</h1>
          <p className="mt-2 text-md text-gray-500">Kullanıcılardan gelen mesajları görüntüleyin ve yanıt verin.</p>
        </div>

        {message && (
          <div className={`flex items-center p-4 rounded-lg mb-6 transition-all duration-300 ${message.type === 'success' ? 'bg-green-50 text-green-700 ring-1 ring-green-200' : 'bg-red-50 text-red-700 ring-1 ring-red-200'}`}>
            <div className="mr-3">
              {message.type === 'success' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              )}
            </div>
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight border-b pb-2">Yeni Mesaj Gönder</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {["name", "email", "subject"].map((field) => (
              <div key={field}>
                <label htmlFor={field} className="block text-sm font-medium text-gray-700 mb-1">
                  {field === "name" ? "Adınız Soyadınız" : field === "email" ? "E-posta Adresiniz" : "Konu"}
                </label>
                <input
                  type={field === "email" ? "email" : "text"}
                  id={field}
                  name={field}
                  value={(formData as any)[field]}
                  onChange={handleInputChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm h-10 px-4"
                  placeholder={field === "name" ? "Adınız Soyadınız" : field === "email" ? "e-posta@adresiniz.com" : "Konu başlığı"}
                />
              </div>
            ))}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Mesajınız</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                rows={4}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-4"
                placeholder="Mesajınızı buraya yazınız..."
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform duration-150 transform hover:scale-105"
              disabled={isLoading}
            >
              {isLoading ? "Gönderiliyor..." : "Mesajı Gönder"}
            </button>
          </form>
        </div>

        <hr className="my-10 border-gray-200" />

        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight border-b pb-2">Gelen Mesajlar</h2>
          <div className="space-y-4">
            {submittedMessages.map((msg) => (
              <div key={msg.id} className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-900">{msg.senderName}</span>
                  <span className="text-xs text-gray-500">{msg.timestamp}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-1">{msg.subject}</h3>
                <p className="text-sm text-gray-600">{msg.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}