using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Yazilimxyz.BusinessLayer.Abstract;
using Yazilimxyz.BusinessLayer.DTOs.ProductVariant;
using Yazilimxyz.DataAccessLayer.Abstract;

namespace Yazilimxyz.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
	public class ProductVariantsController : ControllerBase
	{
		private readonly IProductVariantService _variantService;
		private readonly IProductRepository _productRepository;

		public ProductVariantsController(IProductVariantService variantService,
										 IProductRepository productRepository)
		{
			_variantService = variantService;
			_productRepository = productRepository;
		}

		// ===========================
		// READ (Anonim erişim)
		// ===========================

		[HttpGet("{id:int}")]
		[AllowAnonymous]
		[ProducesResponseType(typeof(ResultProductVariantDto), StatusCodes.Status200OK)]
		[ProducesResponseType(StatusCodes.Status400BadRequest)]
		[ProducesResponseType(StatusCodes.Status404NotFound)]
		public async Task<IActionResult> GetVariantById(int id)
		{
			if (id <= 0)
			{
				return BadRequest("Id 0'dan büyük olmalıdır.");
			}

			var variant = await _variantService.GetByIdAsync(id);
			if (variant == null)
			{
				return NotFound("Varyant bulunamadı.");
			}

			return Ok(variant);
		}

		[HttpGet("by-product/{productId:int}")]
		[AllowAnonymous]
		[ProducesResponseType(typeof(List<ResultProductVariantDto>), StatusCodes.Status200OK)]
		[ProducesResponseType(StatusCodes.Status400BadRequest)]
		public async Task<IActionResult> GetVariantsByProductId(int productId)
		{
			if (productId <= 0)
			{
				return BadRequest("ProductId 0'dan büyük olmalıdır.");
			}

			var list = await _variantService.GetByProductIdAsync(productId);
			return Ok(list);
		}

		[HttpGet("by-product/{productId:int}/in-stock")]
		[AllowAnonymous]
		[ProducesResponseType(typeof(List<ResultProductVariantDto>), StatusCodes.Status200OK)]
		[ProducesResponseType(StatusCodes.Status400BadRequest)]
		public async Task<IActionResult> GetInStockVariants(int productId)
		{
			if (productId <= 0)
			{
				return BadRequest("ProductId 0'dan büyük olmalıdır.");
			}

			var list = await _variantService.GetInStockAsync(productId);
			return Ok(list);
		}

		[HttpGet("by-product/{productId:int}/options")]
		[AllowAnonymous]
		[ProducesResponseType(typeof(ResultProductVariantDto), StatusCodes.Status200OK)]
		[ProducesResponseType(StatusCodes.Status400BadRequest)]
		[ProducesResponseType(StatusCodes.Status404NotFound)]
		public async Task<IActionResult> GetVariantByProductAndOptions(
			int productId,
			[FromQuery] string size,
			[FromQuery] string color)
		{
			if (productId <= 0)
			{
				return BadRequest("ProductId 0'dan büyük olmalıdır.");
			}
			if (string.IsNullOrWhiteSpace(size))
			{
				return BadRequest("Beden alanı boş olamaz.");
			}
			if (string.IsNullOrWhiteSpace(color))
			{
				return BadRequest("Renk alanı boş olamaz.");
			}

			var variant = await _variantService.GetByProductAndOptionsAsync(productId, size.Trim(), color.Trim());
			if (variant == null)
			{
				return NotFound("Varyant bulunamadı.");
			}

			return Ok(variant);
		}

		// ===========================
		// WRITE (Merchant + Admin)
		// ===========================

		[HttpPost]
		[Authorize(Roles = "Merchant,AppAdmin")]
		[ProducesResponseType(StatusCodes.Status201Created)]
		[ProducesResponseType(StatusCodes.Status400BadRequest)]
		[ProducesResponseType(StatusCodes.Status403Forbidden)]
		[ProducesResponseType(StatusCodes.Status404NotFound)]
		[ProducesResponseType(StatusCodes.Status409Conflict)]
		public async Task<IActionResult> CreateVariant([FromBody] CreateProductVariantDto dto)
		{
			if (dto == null)
			{
				return BadRequest("Veri gönderilmedi.");
			}

			if (dto.ProductId <= 0)
			{
				return BadRequest("ProductId 0'dan büyük olmalıdır.");
			}

			if (string.IsNullOrWhiteSpace(dto.Size) || dto.Size.Length > 50)
			{
				return BadRequest("Geçersiz beden bilgisi.");
			}

			if (string.IsNullOrWhiteSpace(dto.Color) || dto.Color.Length > 50)
			{
				return BadRequest("Geçersiz renk bilgisi.");
			}

			if (dto.Stock < 0 || dto.Stock > 999_999)
			{
				return BadRequest("Stok 0 ile 999,999 arasında olmalıdır.");
			}

			var product = await _productRepository.GetByIdAsync(dto.ProductId);
			if (product == null)
			{
				return NotFound("Belirtilen ürün bulunamadı.");
			}

			var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
			var isAdmin = User.IsInRole("AppAdmin");
			if (!isAdmin && product.AppUserId != userId)
			{
				return StatusCode(StatusCodes.Status403Forbidden, "Bu üründe işlem yapma yetkiniz yok.");
			}

			var existing = await _variantService.GetByProductAndOptionsAsync(dto.ProductId, dto.Size.Trim(), dto.Color.Trim());
			if (existing != null)
			{
				return Conflict("Bu ürün için aynı beden ve renk kombinasyonu zaten mevcut.");
			}

			await _variantService.CreateAsync(dto);
			return StatusCode(StatusCodes.Status201Created);
		}

		[HttpPut("{id:int}")]
		[Authorize(Roles = "Merchant,AppAdmin")]
		[ProducesResponseType(StatusCodes.Status200OK)]
		[ProducesResponseType(StatusCodes.Status400BadRequest)]
		[ProducesResponseType(StatusCodes.Status403Forbidden)]
		[ProducesResponseType(StatusCodes.Status404NotFound)]
		[ProducesResponseType(StatusCodes.Status409Conflict)]
		public async Task<IActionResult> UpdateVariant(int id, [FromBody] UpdateProductVariantDto dto)
		{
			if (id <= 0)
			{
				return BadRequest("Id 0'dan büyük olmalıdır.");
			}

			if (dto == null)
			{
				return BadRequest("Veri gönderilmedi.");
			}

			if (dto.Id != id)
			{
				return BadRequest("URL'deki Id ile gövdedeki Id eşleşmiyor.");
			}

			if (dto.ProductId <= 0)
			{
				return BadRequest("ProductId 0'dan büyük olmalıdır.");
			}

			if (string.IsNullOrWhiteSpace(dto.Size) || dto.Size.Length > 50)
			{
				return BadRequest("Geçersiz beden bilgisi.");
			}

			if (string.IsNullOrWhiteSpace(dto.Color) || dto.Color.Length > 50)
			{
				return BadRequest("Geçersiz renk bilgisi.");
			}

			if (dto.Stock < 0 || dto.Stock > 999_999)
			{
				return BadRequest("Stok 0 ile 999,999 arasında olmalıdır.");
			}

			var current = await _variantService.GetByIdAsync(id);
			if (current == null)
			{
				return NotFound("Varyant bulunamadı.");
			}

			var product = await _productRepository.GetByIdAsync(dto.ProductId);
			if (product == null)
			{
				return NotFound("Belirtilen ürün bulunamadı.");
			}

			var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
			var isAdmin = User.IsInRole("AppAdmin");
			if (!isAdmin && product.AppUserId != userId)
			{
				return StatusCode(StatusCodes.Status403Forbidden, "Bu üründe işlem yapma yetkiniz yok.");
			}

			var clash = await _variantService.GetByProductAndOptionsAsync(dto.ProductId, dto.Size.Trim(), dto.Color.Trim());
			if (clash != null && clash.Id != id)
			{
				return Conflict("Bu ürün için aynı beden ve renk kombinasyonu zaten mevcut.");
			}

			await _variantService.UpdateAsync(dto);
			return Ok("Varyant güncellendi.");
		}

		[HttpPatch("{id:int}/stock")]
		[Authorize(Roles = "Merchant,AppAdmin")]
		[ProducesResponseType(StatusCodes.Status200OK)]
		[ProducesResponseType(StatusCodes.Status400BadRequest)]
		[ProducesResponseType(StatusCodes.Status403Forbidden)]
		[ProducesResponseType(StatusCodes.Status404NotFound)]
		public async Task<IActionResult> UpdateVariantStock(int id, [FromBody] UpdateVariantStockRequest req)
		{
			if (id <= 0)
			{
				return BadRequest("Id 0'dan büyük olmalıdır.");
			}

			if (req == null)
			{
				return BadRequest("Veri gönderilmedi.");
			}

			if (req.Quantity < 0 || req.Quantity > 999_999)
			{
				return BadRequest("Stok 0 ile 999,999 arasında olmalıdır.");
			}

			var variant = await _variantService.GetByIdAsync(id);
			if (variant == null)
			{
				return NotFound("Varyant bulunamadı.");
			}

			var product = await _productRepository.GetByIdAsync(variant.ProductId);
			if (product == null)
			{
				return NotFound("Varyantın bağlı olduğu ürün bulunamadı.");
			}

			var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
			var isAdmin = User.IsInRole("AppAdmin");
			if (!isAdmin && product.AppUserId != userId)
			{
				return StatusCode(StatusCodes.Status403Forbidden, "Bu üründe işlem yapma yetkiniz yok.");
			}

			await _variantService.UpdateStockAsync(id, req.Quantity);
			return Ok("Stok güncellendi.");
		}

		[HttpDelete("{id:int}")]
		[Authorize(Roles = "Merchant,AppAdmin")]
		[ProducesResponseType(StatusCodes.Status204NoContent)]
		[ProducesResponseType(StatusCodes.Status400BadRequest)]
		[ProducesResponseType(StatusCodes.Status403Forbidden)]
		[ProducesResponseType(StatusCodes.Status404NotFound)]
		public async Task<IActionResult> DeleteVariant(int id)
		{
			if (id <= 0)
			{
				return BadRequest("Id 0'dan büyük olmalıdır.");
			}

			var variant = await _variantService.GetByIdAsync(id);
			if (variant == null)
			{
				return NotFound("Varyant bulunamadı.");
			}

			var product = await _productRepository.GetByIdAsync(variant.ProductId);
			if (product == null)
			{
				return NotFound("Varyantın bağlı olduğu ürün bulunamadı.");
			}

			var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
			var isAdmin = User.IsInRole("AppAdmin");
			if (!isAdmin && product.AppUserId != userId)
			{
				return StatusCode(StatusCodes.Status403Forbidden, "Bu üründe işlem yapma yetkiniz yok.");
			}

			await _variantService.DeleteAsync(id);
			return NoContent();
		}
	}

	// Basit stok güncelleme modeli
	public class UpdateVariantStockRequest
	{
		public int Quantity { get; set; }
	}
}
