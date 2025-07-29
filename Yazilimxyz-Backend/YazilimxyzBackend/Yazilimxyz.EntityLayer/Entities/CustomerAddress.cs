using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Yazilimxyz.EntityLayer.Entities
{
    public class CustomerAddress : BaseEntity
    {
        public int CustomerId { get; set; }
        public Customer Customer { get; set; }
        public string Title { get; set; }  // Örneğin: "Ev Adresi", "İş Adresi"
        public string FullName { get; set; }
        public string Phone { get; set; }
        public string Address { get; set; }
        public string City { get; set; }
        public string District { get; set; }
        public string PostalCode { get; set; }
        public bool IsDefault { get; set; } = false;
    }
}
