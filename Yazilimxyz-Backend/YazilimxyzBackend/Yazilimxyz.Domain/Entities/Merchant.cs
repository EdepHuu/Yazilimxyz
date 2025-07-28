using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Yazilimxyz.Domain.Entities
{
    public class Merchant
    {
        public string AppUserId { get; set; }
        public AppUser AppUser { get; set; }

        public string Iban { get; set; } = null!;
        public string TaxNumber { get; set; } = null!;
        public string CompanyAddress { get; set; } = null!;
    }

}
