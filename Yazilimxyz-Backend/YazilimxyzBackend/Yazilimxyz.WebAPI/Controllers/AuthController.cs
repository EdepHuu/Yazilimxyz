using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Yazilimxyz.BusinessLayer.Abstract;

using Yazilimxyz.BusinessLayer.DTOs.Auth;


namespace Yazilimxyz.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
	public class AuthController : ControllerBase
	{
		private readonly IAuthService _authService;

		public AuthController(IAuthService authService)
		{
			_authService = authService;
		}

		[HttpPost("register")]
		public async Task<IActionResult> Register([FromBody] RegisterDto dto)
		{
			var result = await _authService.RegisterAsync(dto);

			if (!result.Success)
			{
				return BadRequest(new
				{
					result.Success,
					result.Message
				});
			}

			return Ok(result);
		}

		[HttpPost("login")]
		public async Task<IActionResult> Login([FromBody] LoginDto dto)
		{
			var result = await _authService.LoginAsync(dto);

			if (!result.Success)
			{
				return Unauthorized(new
				{
					result.Success,
					result.Message
				});
			}

			return Ok(result);
		}
	}
}
