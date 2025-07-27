using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Yazilimxyz.Domain.Entities
{
    public class AppUser : IdentityUser
    {
        public string FullName { get; set; }

        public ICollection<Product> Products { get; set; } // Store olarak eklediği ürünler
        public ICollection<Order> Orders { get; set; }
        public ICollection<SupportMessage> SupportMessages { get; set; }
    }
}
