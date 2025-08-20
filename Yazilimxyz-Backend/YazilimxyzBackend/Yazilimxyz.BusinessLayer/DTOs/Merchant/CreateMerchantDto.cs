namespace Yazilimxyz.BusinessLayer.DTOs.Merchant
{
	public class CreateMerchantDto
	{
		 public string AppUserId { get; set; }
		 public string CompanyName { get; set; }
		 public string Iban { get; set; }
		 public string TaxNumber { get; set; }
		 public string CompanyAddress { get; set; }
		 public string Phone { get; set; }
	}
}
