using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Yazilimxyz.InfrastructureLayer.Security
{
	public static class PasswordHasher
	{
		public static string HashPassword(string password)
		{
			return BCrypt.Net.BCrypt.HashPassword(password);
		}

		public static bool Verify(string password, string hashedPassword)
		{
			return BCrypt.Net.BCrypt.Verify(password, hashedPassword);
		}
	}
}
