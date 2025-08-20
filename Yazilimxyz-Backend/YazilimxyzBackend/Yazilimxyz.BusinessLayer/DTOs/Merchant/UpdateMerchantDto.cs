using System.ComponentModel.DataAnnotations;

namespace Yazilimxyz.BusinessLayer.DTOs.Merchant
{
	public class UpdateMerchantDto
	{
		 
		 public string CompanyName { get; set; }
		 public string Iban { get; set; }
		 public string TaxNumber { get; set; }
		 public string CompanyAddress { get; set; }
		 public string Phone { get; set; }
	}
}
