using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Yazilimxyz.BusinessLayer.Abstract;
using Yazilimxyz.BusinessLayer.DTOs.Merchant;

namespace Yazilimxyz.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
	public class MerchantController : ControllerBase
	{
		private readonly IMerchantService _merchantService;

		public MerchantController(IMerchantService merchantService)
		{
			_merchantService = merchantService;
		}

		// ========== SELF (MERCHANT) ==========
		// GET /api/merchant/profile
		[HttpGet("profile")]
		[Authorize]
		public async Task<IActionResult> GetMyProfile()
		{
			var me = await _merchantService.GetMyProfileAsync();
			if (me == null)
			{
				return NotFound("Merchant profili bulunamadı.");
			}
			return Ok(me);
		}

		// PUT /api/merchant/profile
		// ID İSTENMEZ, JWT’den kimlik alınır
		[HttpPut("profile")]
		[Authorize]
		public async Task<IActionResult> UpdateMyProfile([FromBody] UpdateMyMerchantProfileDto dto)
		{
			if (dto == null)
			{
				return BadRequest("Geçersiz istek gövdesi.");
			}
			if (string.IsNullOrWhiteSpace(dto.CompanyName))
			{
				return BadRequest("Şirket adı zorunludur.");
			}
			if (string.IsNullOrWhiteSpace(dto.Iban))
			{
				return BadRequest("IBAN zorunludur.");
			}
			if (string.IsNullOrWhiteSpace(dto.TaxNumber))
			{
				return BadRequest("Vergi numarası zorunludur.");
			}
			if (string.IsNullOrWhiteSpace(dto.CompanyAddress))
			{
				return BadRequest("Şirket adresi zorunludur.");
			}
			if (string.IsNullOrWhiteSpace(dto.Phone))
			{
				return BadRequest("Telefon zorunludur.");
			}

			await _merchantService.UpdateMyProfileAsync(dto);
			return Ok("Profil başarıyla güncellendi.");
		}

        // ========== ADMIN ==========
        // GET /api/merchant/admin?q=&page=&pageSize=
        [HttpGet("admin")]
        [Authorize(Policy = "Admin")]
        public async Task<IActionResult> AdminList([FromQuery] string? q, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            if (page <= 0 || pageSize <= 0)
                return BadRequest("Sayfalama değerleri geçersiz.");

            var res = await _merchantService.GetAllAsync();   // IDataResult<List<ResultMerchantDto>>
            var all = res?.Data ?? new List<ResultMerchantDto>();

            if (!string.IsNullOrWhiteSpace(q))
            {
                var term = q.Trim();
                all = all
                    .Where(x =>
                        (x.CompanyName?.Contains(term, StringComparison.OrdinalIgnoreCase) ?? false) ||
                        (x.TaxNumber?.Contains(term, StringComparison.OrdinalIgnoreCase) ?? false))
                    .ToList();
            }

            var skip = (page - 1) * pageSize;
            var items = all.Skip(skip).Take(pageSize).ToList();

            return Ok(new { total = all.Count, page, pageSize, items });
        }

        // GET /api/merchant/admin/{id}
        [HttpGet("admin/{id:int}")]
		[Authorize(Policy = "Admin")]
		public async Task<IActionResult> AdminGetById(int id)
		{
			if (id <= 0)
			{
				return BadRequest("Geçersiz id.");
			}

			var merchant = await _merchantService.GetByIdAsync(id);
			if (merchant == null)
			{
				return NotFound("Merchant bulunamadı.");
			}

			return Ok(merchant);
		}

        // PUT /api/merchant/admin/{id}
        [HttpPut("admin/{id:int}")]
        [Authorize(Policy = "Admin")]
        public async Task<IActionResult> AdminUpdate(int id, [FromBody] UpdateMerchantDto dto)
        {
            if (id <= 0)
                return BadRequest("Geçersiz id.");
            if (dto == null)
                return BadRequest("Geçersiz istek gövdesi.");
            if (string.IsNullOrWhiteSpace(dto.CompanyName))
                return BadRequest("Şirket adı zorunludur.");
            if (string.IsNullOrWhiteSpace(dto.Iban))
                return BadRequest("IBAN zorunludur.");
            if (string.IsNullOrWhiteSpace(dto.TaxNumber))
                return BadRequest("Vergi numarası zorunludur.");

            var exists = await _merchantService.GetByIdAsync(id);
            if (exists == null)
                return NotFound("Merchant bulunamadı.");

            // dto.Id kontrolü artık yok
            await _merchantService.AdminUpdateAsync(id, dto);
            return Ok("Merchant bilgileri güncellendi.");
        }


        // PUT /api/merchant/admin/{id}/status?value=true|false
        [HttpPut("admin/{id:int}/status")]
		[Authorize(Policy = "Admin")]
		public async Task<IActionResult> AdminSetStatus(int id, [FromQuery] bool value)
		{
			if (id <= 0)
			{
				return BadRequest("Geçersiz id.");
			}

			var exists = await _merchantService.GetByIdAsync(id);
			if (exists == null)
			{
				return NotFound("Merchant bulunamadı.");
			}

			await _merchantService.AdminSetActiveAsync(id, value);
			return Ok(value ? "Merchant aktifleştirildi." : "Merchant pasifleştirildi.");
		}

		// GET /api/merchant/{id}/products
		[HttpGet("{id:int}/products")]
		[AllowAnonymous] // istersen Authorize yap
		public async Task<IActionResult> GetProductsByMerchant(int id)
		{
			if (id <= 0)
			{
				return BadRequest("Geçersiz id.");
			}

			var exists = await _merchantService.GetByIdAsync(id);
			if (exists == null)
			{
				return NotFound("Merchant bulunamadı.");
			}

			var products = await _merchantService.GetProductsByMerchantAsync(id);
			return Ok(products);
		}
	}
}
