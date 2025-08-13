using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Yazilimxyz.BusinessLayer.DTOs.AppUser
{
	public class ChangePasswordDto
	{
		[Required]
		public string CurrentPassword { get; set; } = default!;

		[Required, StringLength(100, MinimumLength = 6)]
		public string NewPassword { get; set; } = default!;

		[Required, Compare(nameof(NewPassword), ErrorMessage = "Yeni şifre ve doğrulama eşleşmiyor.")]
		public string ConfirmNewPassword { get; set; } = default!;
	}
}
