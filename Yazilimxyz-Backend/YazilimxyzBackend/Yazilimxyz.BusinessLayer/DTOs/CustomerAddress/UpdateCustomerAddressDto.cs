using System.ComponentModel.DataAnnotations;

namespace Yazilimxyz.BusinessLayer.DTOs.CustomerAddress
{
	public class UpdateCustomerAddressDto
	{
		[Required] public int Id { get; set; }
		[Required] public int CustomerId { get; set; }

		[Required, StringLength(100)] public string Title { get; set; }
		[Required, StringLength(150)] public string FullName { get; set; }

		[Required, StringLength(20)]
		[RegularExpression(@"^\+?\d{10,15}$", ErrorMessage = "Telefon formatı geçerli değil.")]
		public string Phone { get; set; }

		[Required, StringLength(500)] public string Address { get; set; }
		[StringLength(200)] public string? AddressLine2 { get; set; }

		[Required, StringLength(50)] public string City { get; set; }
		[Required, StringLength(50)] public string District { get; set; }

		[StringLength(10)]
		[RegularExpression(@"^\d{5}$", ErrorMessage = "Posta kodu 5 haneli olmalıdır.")]
		public string? PostalCode { get; set; }

		[StringLength(50)] public string Country { get; set; } = "Türkiye";
		public bool IsDefault { get; set; }
	}
}
