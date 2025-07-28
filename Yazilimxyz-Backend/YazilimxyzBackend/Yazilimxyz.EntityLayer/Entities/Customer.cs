using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Yazilimxyz.EntityLayer.Entities
{
	public class Customer
	{
		public int Id { get; set; } // Anahtar
		public string AppUserId { get; set; } = null!;  // Foreign Key
		public AppUser AppUser { get; set; } = null!;

		public string Address { get; set; } = null!;
	}
}
