using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Yazilimxyz.EntityLayer.Entities
{
	public class AppAdmin
	{
		[Key]
		public int Id { get; set; }

		public string AppUserId { get; set; } = null!;

		public AppUser AppUser { get; set; } = null!;

		public string Name { get; set; } = null!;
		public string LastName { get; set; } = null!;
		public bool IsActive { get; set; } = true;
	}
}
