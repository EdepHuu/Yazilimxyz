# 👕 Yazilimxyz - Giyim E-Ticaret Platformu

Kullanıcıların ürünleri inceleyip sipariş verebildiği, mağaza yöneticilerinin ürün ekleyip stok takibi yapabildiği ve destek birimiyle anlık iletişim kurabildiği modern bir giyim e-ticaret platformudur.

## 🛠️ Kullanılan Teknolojiler

- **Frontend:** React.js, Next.js (App Router, SSR), Tailwind CSS, Zustand
- **Backend:** .NET 8 Web API, RESTful mimari, Entity Framework Core
- **Veritabanı:** SQL Server
- **Kimlik Doğrulama:** Identity + JWT
- **Gerçek Zamanlı İletişim:** SignalR

## 🧩 Modül Yapısı

### Müşteri Paneli
- Ürün kategorileri ve filtreleme (beden, renk, cinsiyet)
- Ürün detay ve sepete ekleme
- Sipariş oluşturma ve görüntüleme
- Canlı destek (SignalR)

### Mağaza Paneli
- Ürün ekleme / güncelleme
- Sipariş yönetimi (Hazırlanıyor, Kargoda vb.)
- Varyant & stok yönetimi

### Destek Paneli
- Müşteriyle anlık mesajlaşma
- Online / offline durumu
- Mesaj geçmişi ve hazır yanıtlar

## 📌 Branch Stratejisi

> Geliştirme `develop` branch’inde yapılır.  
> Her geliştirici kendi feature branch’inde çalışır.  
> PR ile `develop` → kontrol sonrası `main`'e merge edilir.

## 📋 Yol Haritası

- [x] Rehber dokümantasyon (.pdf)
- [ ] Katmanlı yapı kurulumu
- [ ] Authentication sistemi
- [ ] SignalR canlı destek entegrasyonu
- [ ] Demo yayını (Vercel + Azure)


