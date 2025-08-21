using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Yazilimxyz.BusinessLayer.Abstract;
using Yazilimxyz.BusinessLayer.Constans;
using Yazilimxyz.BusinessLayer.DTOs.CustomerAddress;

namespace Yazilimxyz.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
	public class CustomerAddressesController : ControllerBase
	{
		private readonly ICustomerAddressService _addressService;
		private readonly ICustomerService _customerService;

		public CustomerAddressesController(
			ICustomerAddressService addressService,
			ICustomerService customerService)
		{
			_addressService = addressService;
			_customerService = customerService;
		}

		// -------------------------------------------------
		// HELPERS
		// -------------------------------------------------
		private async Task<(bool ok, int customerId)> GetCurrentCustomerIdAsync()
		{
			var me = await _customerService.GetMyProfileAsync();
			if (!me.Success) return (false, 0);
			if (me.Data is null) return (false, 0);
			if (me.Data.Id <= 0) return (false, 0);
			return (true, me.Data.Id);
		}

		private static IActionResult Bad(string msg) =>
			new BadRequestObjectResult(new ApiResponse(false, msg));

		private static IActionResult OkResp(string msg, object? data = null) =>
			new OkObjectResult(new ApiResponse(true, msg, data));

		private static IActionResult NotF(string msg) =>
			new NotFoundObjectResult(new ApiResponse(false, msg));

		private static IActionResult Forb(string msg) =>
			new ObjectResult(new ApiResponse(false, msg)) { StatusCode = StatusCodes.Status403Forbidden };


		// -------------------------------------------------
		// CUSTOMER — READ
		// -------------------------------------------------

		[HttpGet("my")]
		[Authorize(Roles = "Customer,AppAdmin")]
		public async Task<IActionResult> GetMyAddresses()
		{
			var (ok, myId) = await GetCurrentCustomerIdAsync();
			if (!ok) return Bad(Messages.CustomerNotFound);

			var res = await _addressService.GetByCustomerIdAsync(myId);
			if (!res.Success) return Bad(res.Message);

			return OkResp("Adresler listelendi.", res.Data);
		}

		[HttpGet("my/default")]
		[Authorize(Roles = "Customer,AppAdmin")]
		public async Task<IActionResult> GetMyDefaultAddress()
		{
			var (ok, myId) = await GetCurrentCustomerIdAsync();
			if (!ok) return Bad(Messages.CustomerNotFound);

			var res = await _addressService.GetDefaultAddressAsync(myId);
			if (!res.Success || res.Data is null) return NotF(res.Message);

			return OkResp("Varsayılan adres getirildi.", res.Data);
		}

		[HttpGet("{id:int}")]
		[Authorize(Roles = "Customer,AppAdmin")]
		public async Task<IActionResult> GetAddressById(int id)
		{
			if (id <= 0) return Bad("Id 0'dan büyük olmalıdır.");

			var res = await _addressService.GetByIdAsync(id);
			if (!res.Success || res.Data is null) return NotF(res.Message);

			if (!User.IsInRole("AppAdmin"))
			{
				var (ok, myId) = await GetCurrentCustomerIdAsync();
				if (!ok) return Bad(Messages.CustomerNotFound);
				if (myId != res.Data.CustomerId) return Forb("Bu adrese erişim yetkiniz yok.");
			}

			return OkResp("Adres getirildi.", res.Data);
		}

		// -------------------------------------------------
		// CUSTOMER — WRITE
		// -------------------------------------------------

		[HttpPost("my")]
		[Authorize(Roles = "Customer,AppAdmin")]
		public async Task<IActionResult> CreateMyAddress([FromBody] CreateMyCustomerAddressDto body)
		{
			if (body is null) return Bad("Geçersiz istek.");
			if (!ModelState.IsValid) return Bad("Model doğrulaması başarısız.");

			if (string.IsNullOrWhiteSpace(body.FullName)) return Bad("Ad Soyad zorunludur.");
			if (string.IsNullOrWhiteSpace(body.Phone)) return Bad("Telefon zorunludur.");
			if (string.IsNullOrWhiteSpace(body.Address)) return Bad("Adres zorunludur.");
			if (string.IsNullOrWhiteSpace(body.City)) return Bad("Şehir zorunludur.");
			if (string.IsNullOrWhiteSpace(body.District)) return Bad("İlçe zorunludur.");

			var (ok, myId) = await GetCurrentCustomerIdAsync();
			if (!ok) return Bad(Messages.CustomerNotFound);

			var dto = new CreateCustomerAddressDto
			{
				CustomerId = myId,
				Title = body.Title,
				FullName = body.FullName,
				Phone = body.Phone,
				Address = body.Address,
				AddressLine2 = body.AddressLine2,
				City = body.City,
				District = body.District,
				PostalCode = body.PostalCode,
				Country = body.Country,
				IsDefault = body.IsDefault
			};

			var res = await _addressService.CreateAsync(dto);
			if (!res.Success) return Bad(res.Message);

			return StatusCode(StatusCodes.Status201Created, new ApiResponse(true, Messages.CustomerAddressAdded));
		}

		// body'de Id YOK; sadece path'te
		[HttpPut("my/{id:int}")]
		[Authorize(Roles = "Customer,AppAdmin")]
		public async Task<IActionResult> UpdateMyAddress(int id, [FromBody] UpdateMyCustomerAddressDto body)
		{
			if (id <= 0) return Bad("Id 0'dan büyük olmalıdır.");
			if (body is null) return Bad("Geçersiz istek.");
			if (!ModelState.IsValid) return Bad("Model doğrulaması başarısız.");

			if (string.IsNullOrWhiteSpace(body.FullName)) return Bad("Ad Soyad zorunludur.");
			if (string.IsNullOrWhiteSpace(body.Phone)) return Bad("Telefon zorunludur.");
			if (string.IsNullOrWhiteSpace(body.Address)) return Bad("Adres zorunludur.");
			if (string.IsNullOrWhiteSpace(body.City)) return Bad("Şehir zorunludur.");
			if (string.IsNullOrWhiteSpace(body.District)) return Bad("İlçe zorunludur.");

			var existing = await _addressService.GetByIdAsync(id);
			if (!existing.Success || existing.Data is null) return NotF(existing.Message);

			if (!User.IsInRole("AppAdmin"))
			{
				var (ok, myId) = await GetCurrentCustomerIdAsync();
				if (!ok) return Bad(Messages.CustomerNotFound);
				if (myId != existing.Data.CustomerId) return Forb("Bu adreste işlem yapma yetkiniz yok.");
			}

			var dto = new UpdateCustomerAddressDto
			{
				CustomerId = existing.Data.CustomerId,
				Title = body.Title,
				FullName = body.FullName,
				Phone = body.Phone,
				Address = body.Address,
				AddressLine2 = body.AddressLine2,
				City = body.City,
				District = body.District,
				PostalCode = body.PostalCode,
				Country = body.Country,
				IsDefault = body.IsDefault
			};

			var res = await _addressService.UpdateAsync(id, dto);
			if (!res.Success) return Bad(res.Message);

			if (body.IsDefault)
			{
				var defRes = await _addressService.SetDefaultAddressAsync(existing.Data.CustomerId, id);
				if (!defRes.Success) return Bad(defRes.Message);
			}

			return OkResp(Messages.CustomerAddressUpdated);
		}

		[HttpPatch("{id:int}/set-default")]
		[Authorize(Roles = "Customer,AppAdmin")]
		public async Task<IActionResult> SetDefaultAddress(int id)
		{
			if (id <= 0) return Bad("Id 0'dan büyük olmalıdır.");

			var addr = await _addressService.GetByIdAsync(id);
			if (!addr.Success || addr.Data is null) return NotF(addr.Message);

			if (!User.IsInRole("AppAdmin"))
			{
				var (ok, myId) = await GetCurrentCustomerIdAsync();
				if (!ok) return Bad(Messages.CustomerNotFound);
				if (myId != addr.Data.CustomerId) return Forb("Bu adreste işlem yapma yetkiniz yok.");
			}

			var res = await _addressService.SetDefaultAddressAsync(addr.Data.CustomerId, id);
			if (!res.Success) return Bad(res.Message);

			return OkResp(Messages.DefaultAddressNotFound);
		}

		[HttpDelete("{id:int}")]
		[Authorize(Roles = "Customer,AppAdmin")]
		public async Task<IActionResult> DeleteAddress(int id)
		{
			if (id <= 0)
				return BadRequest("Id 0'dan büyük olmalıdır.");

			var addr = await _addressService.GetByIdAsync(id);
			if (!addr.Success || addr.Data is null)
				return NotFound(addr.Message);

			if (!User.IsInRole("AppAdmin"))
			{
				var (ok, myId) = await GetCurrentCustomerIdAsync();
				if (!ok) return BadRequest(Messages.CustomerNotFound);
				if (myId != addr.Data.CustomerId) return Forbid("Bu adreste işlem yapma yetkiniz yok.");
			}

			var result = await _addressService.DeleteAsync(id);
			if (!result.Success) return BadRequest(result.Message);

			return Ok(new { message = result.Message });
		}

		// -------------------------------------------------
		// ADMIN — yardımcı
		// -------------------------------------------------

		[HttpGet("admin/by-customer/{customerId:int}")]
		[Authorize(Roles = "AppAdmin")]
		public async Task<IActionResult> GetAddressesByCustomerIdForAdmin(int customerId)
		{
			if (customerId <= 0) return Bad("CustomerId 0'dan büyük olmalıdır.");

			var res = await _addressService.GetByCustomerIdAsync(customerId);
			if (!res.Success) return Bad(res.Message);

			return OkResp(Messages.CustomerAddressesListed, res.Data);
		}

		// ADMIN — Create
		[HttpPost("admin")]
		[Authorize(Roles = "AppAdmin")]
		public async Task<IActionResult> AdminCreate([FromBody] CreateCustomerAddressDto dto)
		{
			if (dto is null) return Bad("Geçersiz istek.");
			if (dto.CustomerId <= 0) return Bad("CustomerId zorunludur.");
			if (string.IsNullOrWhiteSpace(dto.FullName)) return Bad("Ad Soyad zorunludur.");
			if (string.IsNullOrWhiteSpace(dto.Phone)) return Bad("Telefon zorunludur.");
			if (string.IsNullOrWhiteSpace(dto.Address)) return Bad("Adres zorunludur.");
			if (string.IsNullOrWhiteSpace(dto.City)) return Bad("Şehir zorunludur.");
			if (string.IsNullOrWhiteSpace(dto.District)) return Bad("İlçe zorunludur.");

			var res = await _addressService.CreateAsync(dto);
			if (!res.Success) return Bad(res.Message);
			return StatusCode(StatusCodes.Status201Created, new ApiResponse(true, Messages.CustomerAddressAdded));
		}

		// ADMIN — Update
		[HttpPut("admin/{id:int}")]
		[Authorize(Roles = "AppAdmin")]
		public async Task<IActionResult> AdminUpdate(int id, [FromBody] UpdateCustomerAddressDto dto)
		{
			if (id <= 0) return Bad("Id 0'dan büyük olmalıdır.");
			if (dto is null) return Bad("Geçersiz istek.");
			if (dto.CustomerId <= 0) return Bad("CustomerId zorunludur.");

			if (string.IsNullOrWhiteSpace(dto.FullName)) return Bad("Ad Soyad zorunludur.");
			if (string.IsNullOrWhiteSpace(dto.Phone)) return Bad("Telefon zorunludur.");
			if (string.IsNullOrWhiteSpace(dto.Address)) return Bad("Adres zorunludur.");
			if (string.IsNullOrWhiteSpace(dto.City)) return Bad("Şehir zorunludur.");
			if (string.IsNullOrWhiteSpace(dto.District)) return Bad("İlçe zorunludur.");

			var res = await _addressService.UpdateAsync(id, dto);
			if (!res.Success) return Bad(res.Message);

			if (dto.IsDefault)
				await _addressService.SetDefaultAddressAsync(dto.CustomerId, id);

			return OkResp(Messages.CustomerAddressUpdated);
		}

		// ADMIN — Delete
		[HttpDelete("admin/{id:int}")]
		[Authorize(Roles = "AppAdmin")]
		public async Task<IActionResult> AdminDelete(int id)
		{
			if (id <= 0) return Bad(Messages.InvalidAddressId);

			var addr = await _addressService.GetByIdAsync(id);
			if (!addr.Success || addr.Data is null)
				return NotF(addr.Message);

			var res = await _addressService.DeleteAsync(id);
			if (!res.Success)
				return Bad(res.Message);

			return OkResp(Messages.CustomerAddressDeleted);
		}
	}

	// Tek tip cevap modeli
	public record ApiResponse(bool Success, string Message, object? Data = null);
}
