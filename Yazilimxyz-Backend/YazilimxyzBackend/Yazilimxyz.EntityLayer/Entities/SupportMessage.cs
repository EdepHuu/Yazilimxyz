using System;
using Yazilimxyz.EntityLayer.Entities;

namespace SignalRNotificationApi.Models
{
    public class SupportMessage
    {
        public int Id { get; set; }

        // Mesajı gönderen kullanıcının ID'si
        public string SenderId { get; set; }
        public AppUser Sender { get; set; }  // Burada object değil AppUser

        // Mesajı alan kullanıcının ID'si
        public string ReceiverId { get; set; }
        public AppUser Receiver { get; set; } // Burada da object değil AppUser

        // Mesaj içeriği
        public string Message { get; set; }

        // Destek ekibinden mi geldi?
        public bool IsFromSupport { get; set; } = false;

        // Mesajın gönderildiği tarih ve zaman
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
