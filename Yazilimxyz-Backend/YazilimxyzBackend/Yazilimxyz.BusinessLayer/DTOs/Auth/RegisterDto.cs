using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Yazilimxyz.BusinessLayer.DTOs.Auth
{
	public class RegisterDto
	{
		public string Name { get; set; }
		public string LastName { get; set; }
		public string Email { get; set; }
		public string Password { get; set; }
		public string Role { get; set; } // "AppAdmin", "Merchant", "Customer"

		// Ek alanlar sadece Merchant için zorunlu olabilir
		public string? Phone { get; set; }
		public string? CompanyName { get; set; }
		public string? Iban { get; set; }
		public string? TaxNumber { get; set; }
		public string? CompanyAddress { get; set; }
	}
}
