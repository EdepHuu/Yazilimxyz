using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Yazilimxyz.BusinessLayer.DTOs.AppUser
{
	public class UpdateMyProfileDto
	{
		[StringLength(100)] public string? Name { get; set; }
		[StringLength(100)] public string? LastName { get; set; }
		[StringLength(20)] public string? Phone { get; set; }
	}
}
