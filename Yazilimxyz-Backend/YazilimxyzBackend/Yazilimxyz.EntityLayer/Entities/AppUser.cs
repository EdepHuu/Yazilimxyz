using Microsoft.AspNetCore.Identity;
using SignalRNotificationApi.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Yazilimxyz.EntityLayer.Entities;

namespace Yazilimxyz.EntityLayer.Entities
{
    public class AppUser : IdentityUser
    {
        public string Name { get; set; }
        public string LastName { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public Customer? Customer { get; set; }
        public Merchant? Merchant { get; set; }
		public bool IsAdmin { get; set; } // Bu gerekli

		public ICollection<Product> Products { get; set; } = new List<Product>();
        public ICollection<Order> Orders { get; set; } = new List<Order>();
        public ICollection<SupportMessage> SentMessages { get; set; } = new List<SupportMessage>();
        public ICollection<SupportMessage> ReceivedMessages { get; set; } = new List<SupportMessage>();
        public ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();

    }
}
