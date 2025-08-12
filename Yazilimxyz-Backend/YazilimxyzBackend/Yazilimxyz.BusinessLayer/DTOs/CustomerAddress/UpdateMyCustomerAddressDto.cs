using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Yazilimxyz.BusinessLayer.DTOs.CustomerAddress
{
	public class UpdateMyCustomerAddressDto
	{
		[Required, StringLength(100)] public string Title { get; set; }
		[Required, StringLength(150)] public string FullName { get; set; }
		[Required, StringLength(20)] public string Phone { get; set; }
		[Required, StringLength(500)] public string Address { get; set; }
		[StringLength(200)] public string? AddressLine2 { get; set; }
		[Required, StringLength(50)] public string City { get; set; }
		[Required, StringLength(50)] public string District { get; set; }
		[StringLength(10)] public string? PostalCode { get; set; }
		[StringLength(50)] public string Country { get; set; } = "Türkiye";
		public bool IsDefault { get; set; }
	}
}
