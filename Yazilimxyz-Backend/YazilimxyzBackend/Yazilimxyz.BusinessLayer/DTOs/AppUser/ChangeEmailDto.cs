using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Yazilimxyz.BusinessLayer.DTOs.AppUser
{
	public class ChangeEmailDto
	{
		[Required, EmailAddress, StringLength(200)]
		public string NewEmail { get; set; } = default!;
	}
}
