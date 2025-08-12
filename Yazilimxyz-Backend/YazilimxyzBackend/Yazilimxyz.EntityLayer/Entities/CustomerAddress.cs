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

		public string Title { get; set; }          // "Ev", "İş" vb.
		public string FullName { get; set; }
		public string Phone { get; set; }          // E.164 normalize edeceğiz
		public string Address { get; set; }        // AddressLine1
		public string? AddressLine2 { get; set; }  // apartman/kat/daire/not
		public string City { get; set; }
		public string District { get; set; }
		public string? PostalCode { get; set; }
		public string Country { get; set; } = "Türkiye";
		public bool IsDefault { get; set; } = false;
	}
}
