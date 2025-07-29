using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Yazilimxyz.EntityLayer.Entities
{
    public class AppUser : IdentityUser
    {
        public string Name { get; set; }
        public string LastName { get; set; }

        public Customer Customer { get; set; }
        public Merchant Merchant { get; set; }

        public ICollection<Product> Products { get; set; } // Store olarak eklediği ürünler
        public ICollection<Order> Orders { get; set; }
        public ICollection<SupportMessage> SupportMessages { get; set; }
    }
}
