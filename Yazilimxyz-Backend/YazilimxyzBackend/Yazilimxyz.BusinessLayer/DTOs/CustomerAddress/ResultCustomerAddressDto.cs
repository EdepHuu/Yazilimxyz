namespace Yazilimxyz.BusinessLayer.DTOs.CustomerAddress
{
	public class ResultCustomerAddressDto
	{
		public int Id { get; set; }
		public int CustomerId { get; set; }
		public string CustomerName { get; set; }
		public string Title { get; set; }
		public string FullName { get; set; }
		public string Phone { get; set; }
		public string Address { get; set; }
		public string? AddressLine2 { get; set; }
		public string City { get; set; }
		public string District { get; set; }
		public string? PostalCode { get; set; }
		public string Country { get; set; }
		public bool IsDefault { get; set; }
		public DateTime CreatedAt { get; set; }
		public DateTime? UpdatedDate { get; set; }
	}
}
