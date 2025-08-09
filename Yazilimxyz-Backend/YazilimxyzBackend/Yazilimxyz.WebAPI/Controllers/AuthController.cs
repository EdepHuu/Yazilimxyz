using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Yazilimxyz.BusinessLayer.Abstract;


using Yazilimxyz.BusinessLayer.DTOs.Auth;


namespace Yazilimxyz.WebAPI.Controllers
{
	public class AuthController : ControllerBase
	{
		private readonly IAuthService _authService;

		public AuthController(IAuthService authService)
		{
			_authService = authService;
		}

		// POST: /api/auth/register
		[HttpPost("register")]
		[AllowAnonymous]
		[ProducesResponseType(typeof(ResultUserDto), StatusCodes.Status200OK)]
		[ProducesResponseType(StatusCodes.Status400BadRequest)]
		public async Task<IActionResult> Register([FromBody] RegisterDto dto)
		{
			if (dto == null)
			{
				return BadRequest(new { Success = false, Message = "Geçersiz istek gövdesi." });
			}

			if (!ModelState.IsValid)
			{
				var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage);
				return BadRequest(new { Success = false, Message = string.Join(" | ", errors) });
			}

			var result = await _authService.RegisterAsync(dto);

			if (!result.Success)
			{
				return BadRequest(new { result.Success, result.Message });
			}

			return Ok(result);
		}

		// POST: /api/auth/login
		[HttpPost("login")]
		[AllowAnonymous]
		[ProducesResponseType(typeof(ResultUserDto), StatusCodes.Status200OK)]
		[ProducesResponseType(StatusCodes.Status401Unauthorized)]
		public async Task<IActionResult> Login([FromBody] LoginDto dto)
		{
			if (dto == null)
			{
				return Unauthorized(new { Success = false, Message = "Geçersiz istek gövdesi." });
			}

			if (!ModelState.IsValid)
			{
				var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage);
				return Unauthorized(new { Success = false, Message = string.Join(" | ", errors) });
			}

			var result = await _authService.LoginAsync(dto);

			if (!result.Success)
			{
				return Unauthorized(new { result.Success, result.Message });
			}

			return Ok(result);
		}
	}
}
