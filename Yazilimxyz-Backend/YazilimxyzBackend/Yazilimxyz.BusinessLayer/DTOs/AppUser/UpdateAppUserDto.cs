using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Yazilimxyz.BusinessLayer.DTOs.AppUser
{
	public class UpdateAppUserDto
	{
		[StringLength(50, ErrorMessage = "Ad en fazla 50 karakter olmalıdır.")]
		public string? Name { get; set; }

		[StringLength(50, ErrorMessage = "Soyadı en fazla 50 karakter olmalıdır.")]
		public string? LastName { get; set; }

		[EmailAddress(ErrorMessage = "Geçerli bir email adresi giriniz.")]
		public string? Email { get; set; }

		public string? PhoneNumber { get; set; }
	}
}
