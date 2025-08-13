using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Yazilimxyz.BusinessLayer.DTOs.AppUser
{
	public class ConfirmEmailChangeDto
	{
		[Required, EmailAddress, StringLength(200)]
		public string NewEmail { get; set; } = default!;

		[Required] public string Token { get; set; } = default!;
	}
}
