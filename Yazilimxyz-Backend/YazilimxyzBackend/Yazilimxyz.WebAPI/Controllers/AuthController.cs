using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Yazilimxyz.BusinessLayer.Abstract;
using Yazilimxyz.BusinessLayer.DTOs.Auth;

namespace Yazilimxyz.WebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")] // => /api/Auth/*
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        public AuthController(IAuthService authService) => _authService = authService;

        // POST: /api/Auth/register
        [HttpPost("register")]
        [AllowAnonymous]
        [ProducesResponseType(typeof(ResultUserDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            if (dto == null)
                return BadRequest(new { success = false, message = "Geçersiz istek gövdesi." });

            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage);
                return BadRequest(new { success = false, message = string.Join(" | ", errors) });
            }

            var result = await _authService.RegisterAsync(dto);
            if (!result.Success)
                return BadRequest(new { success = result.Success, message = result.Message });

            return Ok(result); // result.Success true, result.Token vs.
        }

        // POST: /api/Auth/login
        [HttpPost("login")]
        [AllowAnonymous]
        [ProducesResponseType(typeof(ResultUserDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            if (dto == null)
                return Unauthorized(new { success = false, message = "Geçersiz istek gövdesi." });

            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage);
                return Unauthorized(new { success = false, message = string.Join(" | ", errors) });
            }

            var result = await _authService.LoginAsync(dto);
            if (!result.Success)
                return Unauthorized(new { success = result.Success, message = result.Message });

            return Ok(result);
        }
    }
}
