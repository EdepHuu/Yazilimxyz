using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Yazilimxyz.BusinessLayer.Abstract;
using Yazilimxyz.BusinessLayer.DTOs.Customer;

namespace Yazilimxyz.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
	public class CustomerController : ControllerBase
	{
		private readonly ICustomerService _customerService;

		public CustomerController(ICustomerService customerService)
		{
			_customerService = customerService;
		}

		// ========= SELF =========
		// GET /api/customer/profile
		// Token'daki kullanıcının kendi müşteri profil özetini döner (AppUser alanları + AddressCount).
		[HttpGet("profile")]
		[Authorize]
		public async Task<IActionResult> GetMyProfile()
		{
			var me = await _customerService.GetMyProfileAsync();

			if (me == null)
			{
				return NotFound("Müşteri profili bulunamadı.");
			}

			return Ok(me);
		}

		// ========= ADMIN =========

		// POST /api/customer/admin
		// Var olan bir AppUserId için admin yeni Customer kaydı açar.
		[HttpPost("admin")]
		[Authorize(Policy = "Admin")]
		public async Task<IActionResult> AdminCreate([FromBody] AdminCreateCustomerDto dto)
		{
			if (dto == null)
			{
				return BadRequest("Geçersiz istek gövdesi.");
			}

			if (string.IsNullOrWhiteSpace(dto.AppUserId))
			{
				return BadRequest("AppUserId zorunludur.");
			}

			await _customerService.AdminCreateAsync(dto);
			return Ok("Müşteri kaydı oluşturuldu.");
		}

		// GET /api/customer/admin/{id}
		// Belirli bir customer'ı (AppUser bilgileriyle) getirir.
		[HttpGet("admin/{id:int}")]
		[Authorize(Policy = "Admin")]
		public async Task<IActionResult> AdminGetById(int id)
		{
			if (id <= 0)
			{
				return BadRequest("Geçersiz id.");
			}

			var cust = await _customerService.GetByIdAsync(id);

			if (cust == null)
			{
				return NotFound("Müşteri bulunamadı.");
			}

			return Ok(cust);
		}

		// GET /api/customer/admin/{id}/addresses
		// Customer'ı adresleriyle birlikte getirir.
		[HttpGet("admin/{id:int}/addresses")]
		[Authorize(Policy = "Admin")]
		public async Task<IActionResult> AdminGetWithAddresses(int id)
		{
			if (id <= 0)
			{
				return BadRequest("Geçersiz id.");
			}

			var cust = await _customerService.GetWithAddressesAsync(id);

			if (cust == null)
			{
				return NotFound("Müşteri bulunamadı.");
			}

			return Ok(cust);
		}

		// GET /api/customer/admin/by-user/{appUserId}
		// AppUserId üzerinden müşteri bilgisini getirir.
		[HttpGet("admin/by-user/{appUserId}")]
		[Authorize(Policy = "Admin")]
		public async Task<IActionResult> AdminGetByAppUserId(string appUserId)
		{
			if (string.IsNullOrWhiteSpace(appUserId))
			{
				return BadRequest("AppUserId zorunludur.");
			}

			var cust = await _customerService.GetByAppUserIdAsync(appUserId);

			if (cust == null)
			{
				return NotFound("Müşteri bulunamadı.");
			}

			return Ok(cust);
		}

		// PUT /api/customer/admin/{id}/status?value=true|false
		// Customer'ı kullanım dışına alma / yeniden aktifleştirme (soft-deactivate).
		[HttpPut("admin/{id:int}/status")]
		[Authorize(Policy = "Admin")]
		public async Task<IActionResult> AdminSetStatus(int id, [FromQuery] bool value)
		{
			if (id <= 0)
			{
				return BadRequest("Geçersiz id.");
			}

			// Varlık kontrolü (anlamlı 404 için)
			var exists = await _customerService.GetByIdAsync(id);
			if (exists == null)
			{
				return NotFound("Müşteri bulunamadı.");
			}

			await _customerService.AdminSetActiveAsync(id, value);
			return Ok(value ? "Müşteri aktifleştirildi." : "Müşteri kullanım dışı bırakıldı.");
		}
	}
}
