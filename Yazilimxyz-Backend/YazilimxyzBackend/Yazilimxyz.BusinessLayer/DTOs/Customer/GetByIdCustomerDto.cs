using Yazilimxyz.BusinessLayer.DTOs.CustomerAddress;

namespace Yazilimxyz.BusinessLayer.DTOs.Customer
{
	public class GetByIdCustomerDto
	{
		public int Id { get; set; }
		public string AppUserId { get; set; }

		// AppUser’dan
		public string UserName { get; set; }
		public string Email { get; set; }
		public string FirstName { get; set; }   // AppUser.Name
		public string LastName { get; set; }    // AppUser.LastName
		public string PhoneNumber { get; set; } // AppUser.PhoneNumber

		public List<ResultCustomerAddressDto> Addresses { get; set; } = new();
	}
}
