using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Yazilimxyz.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
	public class UserController : ControllerBase
	{
		[HttpGet("me")]
		[Authorize] // sadece login olan kullanıcılar erişebilir
		public IActionResult GetCurrentUser()
		{
			// JWT içindeki claim’leri çekiyoruz
			var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
			var email = User.FindFirst(ClaimTypes.Email)?.Value;
			var name = User.FindFirst(ClaimTypes.Name)?.Value;
			var role = User.FindFirst(ClaimTypes.Role)?.Value;

			if (userId == null)
				return Unauthorized("Giriş yapılmamış.");

			var userInfo = new
			{
				Id = userId,
				Name = name,
				Email = email,
				Role = role
			};

			return Ok(userInfo);
		}
	}
}
