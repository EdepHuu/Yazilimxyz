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
		public string AppUserId { get; set; } = null!;
		public AppUser AppUser { get; set; } = null!;

		public string Iban { get; set; } = null!;
		public string TaxNumber { get; set; } = null!;
		public string CompanyAddress { get; set; } = null!;
	}
}
