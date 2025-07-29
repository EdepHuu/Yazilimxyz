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

		public string CreateToken(AppUser user, string role)
		{
			var claims = new List<Claim>
			{
				new Claim(ClaimTypes.NameIdentifier, user.Id),
				new Claim(ClaimTypes.Name, user.Name + " " + user.LastName),
				new Claim(ClaimTypes.Email, user.Email),
				new Claim(ClaimTypes.Role, role)
			};

			var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]));
			var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

			var token = new JwtSecurityToken(
				issuer: _config["Jwt:Issuer"],
				audience: _config["Jwt:Audience"],
				claims: claims,
				expires: DateTime.UtcNow.AddDays(7),
				signingCredentials: creds
			);

			return new JwtSecurityTokenHandler().WriteToken(token);
		}
	}
}
