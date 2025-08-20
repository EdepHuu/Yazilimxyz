using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;

namespace Yazilimxyz.EntityLayer.Entities
{
    public class AppUser : IdentityUser
    {
        public string Name { get; set; }
        public string LastName { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public Customer? Customer { get; set; }
        public Merchant? Merchant { get; set; }
        public bool IsAdmin { get; set; }

        public ICollection<Product> Products { get; set; } = new List<Product>();
        public ICollection<Order> Orders { get; set; } = new List<Order>();
        public ICollection<SupportMessage> SentMessages { get; set; } = new List<SupportMessage>();
        public ICollection<SupportMessage> ReceivedMessages { get; set; } = new List<SupportMessage>();
        public ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();
    }
}
