using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Yazilimxyz.EntityLayer.Entities;

namespace Yazilimxyz.InfrastructureLayer.Security
{
	public class JwtTokenService : ITokenService
	{
		private readonly IConfiguration _config;

		public JwtTokenService(IConfiguration config)
		{
			_config = config;
		}

		public string CreateToken(AppUser user, string? role = null)
		{
			var claims = new List<Claim>
		{
			new Claim(ClaimTypes.NameIdentifier, user.Id),
			new Claim(ClaimTypes.Name, $"{user.Name} {user.LastName}"),
			new Claim(ClaimTypes.Email, user.Email ?? string.Empty)
		};

			// Admin policy için kritik claim
			if (user.IsAdmin)
			{
				claims.Add(new Claim("IsAdmin", "true"));
			}

			// İstersen rolleri yine de ekleyebilirsin (kullanmasak da zararı yok)
			if (!string.IsNullOrWhiteSpace(role))
			{
				claims.Add(new Claim(ClaimTypes.Role, role));
			}

			var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]));
			var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

			// Süreyi config’ten yönetmek istersen: Jwt:ExpireDays
			var expireDays = int.TryParse(_config["Jwt:ExpireDays"], out var d) ? d : 7;

			var token = new JwtSecurityToken(
				issuer: _config["Jwt:Issuer"],
				audience: _config["Jwt:Audience"],
				claims: claims,
				notBefore: DateTime.UtcNow,
				expires: DateTime.UtcNow.AddDays(expireDays),
				signingCredentials: creds
			);

			return new JwtSecurityTokenHandler().WriteToken(token);
		}
	}
}
