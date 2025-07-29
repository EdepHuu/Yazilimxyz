using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Yazilimxyz.EntityLayer.Entities
{
    public class Merchant
    {
        public int Id { get; set; }
        public string AppUserId { get; set; }
        public AppUser AppUser { get; set; }
        public string CompanyName { get; set; }
        public string Iban { get; set; }
        public string TaxNumber { get; set; }
        public string CompanyAddress { get; set; }
        public string Phone { get; set; }
    }
}
