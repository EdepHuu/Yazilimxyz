using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Yazilimxyz.BusinessLayer.DTOs.Auth
{
	public class ResultUserDto
	{
		public string Name { get; set; }
		public string LastName { get; set; }
		public string Email { get; set; }
		public string Role { get; set; }
		public string Token { get; set; }
		public bool Success { get; set; }
		public string Message { get; set; } = string.Empty;
	}
}
