using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Yazilimxyz.BusinessLayer.Constans;
using Yazilimxyz.BusinessLayer.DTOs.AppUser;
using Yazilimxyz.EntityLayer.Entities;

namespace Yazilimxyz.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
	public class UserController : ControllerBase
	{
		private readonly UserManager<AppUser> _userManager;

		public UserController(UserManager<AppUser> userManager)
		{
			_userManager = userManager;
		}

		private string? GetUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier);

		[HttpGet("me")]
		[ProducesResponseType(StatusCodes.Status200OK)]
		[Authorize]
		public async Task<IActionResult> GetMe()
		{
			var uid = GetUserId();
			if (string.IsNullOrEmpty(uid))
				return Unauthorized("Kullanıcı doğrulanamadı.");

			var u = await _userManager.FindByIdAsync(uid);
			if (u is null)
				return NotFound(Messages.UserNotFound);

			return Ok(new
			{
				u.Id,
				u.Name,
				u.LastName,
				Email = u.Email,
				Phone = u.PhoneNumber,
				u.EmailConfirmed,
				u.PhoneNumberConfirmed
			});
		}

		[HttpPut("me")]
		[Authorize]
		[ProducesResponseType(StatusCodes.Status200OK)]
		[ProducesResponseType(StatusCodes.Status400BadRequest)]
		public async Task<IActionResult> UpdateMe([FromBody] UpdateMyProfileDto body)
		{
			if (body is null)
				return BadRequest("Geçersiz istek.");

			var uid = GetUserId();
			if (string.IsNullOrEmpty(uid))
				return Unauthorized("Kullanıcı doğrulanamadı.");

			var u = await _userManager.FindByIdAsync(uid);
			if (u is null)
				return NotFound(Messages.UserNotFound);

			// Sadece gönderilen alanları güncelle
			if (!string.IsNullOrWhiteSpace(body.Name))
				u.Name = body.Name.Trim();

			if (!string.IsNullOrWhiteSpace(body.LastName))
				u.LastName = body.LastName.Trim();

			if (!string.IsNullOrWhiteSpace(body.Phone))
			{
				u.PhoneNumber = body.Phone.Trim();
				u.PhoneNumberConfirmed = false; // güvenli varsayılan
			}

			var res = await _userManager.UpdateAsync(u);
			if (!res.Succeeded)
				return BadRequest(string.Join(", ", res.Errors.Select(e => e.Description)));

			return Ok(Messages.ProfileUpdated);
		}

		// E-posta değişimi 2 adımlı: istek + onay
		[HttpPost("change-email/request")]
		[Authorize]
		[ProducesResponseType(StatusCodes.Status200OK)]
		public async Task<IActionResult> RequestEmailChange([FromBody] ChangeEmailDto body)
		{
			if (body is null || string.IsNullOrWhiteSpace(body.NewEmail))
				return BadRequest("Yeni e-posta zorunludur.");

			var uid = GetUserId();
			if (string.IsNullOrEmpty(uid))
				return Unauthorized();

			var u = await _userManager.FindByIdAsync(uid);
			if (u is null)
				return NotFound(Messages.UserNotFound);

			var token = await _userManager.GenerateChangeEmailTokenAsync(u, body.NewEmail.Trim());

			// Prod’da token’ı e-posta ile gönder; geliştirme için döndürüyoruz:
			return Ok(new { message = "Onay için token üretildi.", token });
		}

		[HttpPost("change-email/confirm")]
		[Authorize]
		[ProducesResponseType(StatusCodes.Status200OK)]
		public async Task<IActionResult> ConfirmEmailChange([FromBody] ConfirmEmailChangeDto body)
		{
			if (body is null || string.IsNullOrWhiteSpace(body.NewEmail) || string.IsNullOrWhiteSpace(body.Token))
				return BadRequest("Yeni e-posta ve token zorunludur.");

			var uid = GetUserId();
			if (string.IsNullOrEmpty(uid))
				return Unauthorized();

			var u = await _userManager.FindByIdAsync(uid);
			if (u is null)
				return NotFound(Messages.UserNotFound);

			var result = await _userManager.ChangeEmailAsync(u, body.NewEmail.Trim(), body.Token);
			if (!result.Succeeded)
				return BadRequest(string.Join(", ", result.Errors.Select(e => e.Description)));

			// Username = email mantığı varsa eşitle
			await _userManager.SetUserNameAsync(u, body.NewEmail.Trim());

			return Ok(Messages.EmailChangedAndConfirmed);
		}

		[HttpPost("change-password")]
		[Authorize]
		[ProducesResponseType(StatusCodes.Status200OK)]
		[ProducesResponseType(StatusCodes.Status400BadRequest)]
		public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto body)
		{
			if (body is null)
				return BadRequest("Geçersiz istek.");

			var uid = GetUserId();
			if (string.IsNullOrEmpty(uid))
				return Unauthorized("Kullanıcı doğrulanamadı.");

			if (string.IsNullOrWhiteSpace(body.CurrentPassword) ||
				string.IsNullOrWhiteSpace(body.NewPassword) ||
				string.IsNullOrWhiteSpace(body.ConfirmNewPassword))
				return BadRequest("Tüm alanlar zorunludur.");

			if (!string.Equals(body.NewPassword, body.ConfirmNewPassword))
				return BadRequest("Yeni şifre ve doğrulama eşleşmiyor.");

			if (string.Equals(body.NewPassword, body.CurrentPassword))
				return BadRequest("Yeni şifre mevcut şifreyle aynı olamaz.");

			var u = await _userManager.FindByIdAsync(uid);
			if (u is null)
				return NotFound(Messages.UserNotFound);

			var result = await _userManager.ChangePasswordAsync(u, body.CurrentPassword, body.NewPassword);
			if (!result.Succeeded)
				return BadRequest(string.Join(", ", result.Errors.Select(e => e.Description)));

			return Ok(Messages.PasswordChanged);
		}
	}
}
