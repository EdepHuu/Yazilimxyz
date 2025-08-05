using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Yazilimxyz.BusinessLayer.DTOs.AppUser
{
   public class ResultAppUserWithCustomerDto
    {
        // AppUser alanları
        public string Id { get; set; }
        public string UserName { get; set; }
        public string Name { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public DateTime CreatedAt { get; set; }

        // Customer alanları
        public int CustomerId { get; set; }
        public int AddressCount { get; set; }
    }
}
