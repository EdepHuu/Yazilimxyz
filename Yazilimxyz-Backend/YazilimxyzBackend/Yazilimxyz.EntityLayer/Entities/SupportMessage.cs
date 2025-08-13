using System;
using Yazilimxyz.EntityLayer.Entities;

namespace SignalRNotificationApi.Models
{
    public class SupportMessage
    {
        public int Id { get; set; }
        public string SenderId { get; set; }
        public string ReceiverId { get; set; }
        public string Message { get; set; }
        public bool IsFromSupport { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // object yerine AppUser tipinde
        public AppUser Sender { get; set; }
        public AppUser Receiver { get; set; }
    }
}
