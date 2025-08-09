using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Yazilimxyz.BusinessLayer.DTOs.Merchant
{
	public class UpdateMyMerchantProfileDto
	{
		public string CompanyName { get; set; }
		public string Iban { get; set; }
		public string TaxNumber { get; set; }
		public string CompanyAddress { get; set; }
		public string Phone { get; set; }
	}
}
