using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Yazilimxyz.BusinessLayer.Abstract;
using Yazilimxyz.BusinessLayer.DTOs.Product;
using Yazilimxyz.DataAccessLayer.Abstract;
using Yazilimxyz.EntityLayer.Enums;

namespace Yazilimxyz.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
	public class ProductController : ControllerBase
	{
		private readonly IProductService _productService;
		private readonly ICategoryService _categoryService;
		private readonly IMerchantRepository _merchantRepository;

		public ProductController(IProductService productService, ICategoryService categoryService, IMerchantRepository merchantRepository)
		{
			_productService = productService;
			_categoryService = categoryService;
			_merchantRepository = merchantRepository;
		}

		[HttpGet("get-all")]
		[AllowAnonymous]
		public async Task<IActionResult> GetAllProductsAsync()
		{
			var result = await _productService.GetAllAsync();
			return Ok(result);
		}

		[HttpGet("get-active")]
		[AllowAnonymous]
		public async Task<IActionResult> GetActiveProductsAsync()
		{
			var result = await _productService.GetActiveAsync();
			return Ok(result);
		}

		[HttpGet("get-by-id/{productId}")]
		[AllowAnonymous]
		public async Task<IActionResult> GetProductByIdAsync(int productId)
		{
			var product = await _productService.GetByIdAsync(productId);
			if (product == null)
			{
				return NotFound("Ürün bulunamadı.");
			}

			return Ok(product);
		}

		[HttpGet("get-by-category/{categoryId}")]
		[AllowAnonymous]
		public async Task<IActionResult> GetByCategoryAsync(int categoryId)
		{
			var result = await _productService.GetByCategoryIdAsync(categoryId);
			return Ok(result);
		}

		[HttpGet("get-by-merchant/{merchantId}")]
		[AllowAnonymous]
		public async Task<IActionResult> GetByMerchantAsync(int merchantId)
		{
			var result = await _productService.GetByMerchantIdAsync(merchantId);
			return Ok(result);
		}

		[HttpGet("get-by-gender/{gender}")]
		[AllowAnonymous]
		public async Task<IActionResult> GetByGenderAsync(GenderType gender)
		{
			var result = await _productService.GetByGenderAsync(gender);
			return Ok(result);
		}

		[HttpGet("search")]
		[AllowAnonymous]
		public async Task<IActionResult> SearchAsync([FromQuery] string term)
		{
			var result = await _productService.SearchAsync(term);
			return Ok(result);
		}

		[HttpGet("{productId}/images")]
		[AllowAnonymous]
		public async Task<IActionResult> GetProductWithImagesAsync(int productId)
		{
			var product = await _productService.GetWithImagesAsync(productId);
			if (product == null)
			{
				return NotFound();
			}

			return Ok(product);
		}

		[HttpGet("{productId}/variants")]
		[AllowAnonymous]
		public async Task<IActionResult> GetProductWithVariantsAsync(int productId)
		{
			var product = await _productService.GetWithVariantsAsync(productId);
			if (product == null)
			{
				return NotFound();
			}

			return Ok(product);
		}

		[HttpGet("{productId}/detailed")]
		[AllowAnonymous]
		public async Task<IActionResult> GetProductDetailedAsync(int productId)
		{
			var product = await _productService.GetDetailedAsync(productId);
			if (product == null)
			{
				return NotFound();
			}

			return Ok(product);
		}

		[HttpPost("create")]
		[Authorize(Roles = "Merchant,AppAdmin")]
		public async Task<IActionResult> CreateProductAsync([FromBody] CreateProductDto dto)
		{
			if (!Enum.IsDefined(typeof(GenderType), dto.Gender))
			{
				return BadRequest("Geçersiz cinsiyet değeri. Lütfen 1 (Male), 2 (Female) veya 3 (Unisex) gönderin.");
			}

			if (dto.BasePrice <= 0)
			{
				return BadRequest("Ürün fiyatı 0'dan büyük olmalıdır.");
			}

			var category = await _categoryService.GetByIdAsync(dto.CategoryId);
			if (category == null)
			{
				return BadRequest("Kategori bulunamadı.");
			}

			await _productService.CreateAsync(dto);
			return Ok(new { message = "Ürün başarıyla eklendi." });
		}

		[HttpPut("update")]
		[Authorize(Roles = "Merchant,AppAdmin")]
		public async Task<IActionResult> UpdateProductAsync([FromBody] UpdateProductDto dto)
		{
			if (!Enum.IsDefined(typeof(GenderType), dto.Gender))
			{
				return BadRequest("Geçersiz cinsiyet değeri. Lütfen 1 (Male), 2 (Female) veya 3 (Unisex) gönderin.");
			}

			if (dto.BasePrice <= 0)
			{
				return BadRequest("Ürün fiyatı 0'dan büyük olmalıdır.");
			}

			var category = await _categoryService.GetByIdAsync(dto.CategoryId);
			if (category == null)
			{
				return BadRequest("Kategori bulunamadı.");
			}

			var existing = await _productService.GetDetailedAsync(dto.Id);
			if (existing == null)
			{
				return NotFound("Güncellenecek ürün bulunamadı.");
			}

			var userAppUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
			var merchant = await _merchantRepository.GetByAppUserIdAsync(userAppUserId);

			if (User.IsInRole("Merchant") && existing.MerchantId != merchant.Id)
			{
				return StatusCode(StatusCodes.Status403Forbidden, "Sadece kendi ürününüzü güncelleyebilirsiniz.");
			}

			await _productService.UpdateAsync(dto);
			return Ok(new { message = "Ürün başarıyla güncellendi." });
		}

		[HttpDelete("delete/{productId}")]
		[Authorize(Roles = "Merchant,AppAdmin")]
		public async Task<IActionResult> DeleteProductAsync(int productId)
		{
			var existing = await _productService.GetDetailedAsync(productId);
			if (existing == null)
			{
				return NotFound("Silinecek ürün bulunamadı.");
			}

			var userAppUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
			var merchant = await _merchantRepository.GetByAppUserIdAsync(userAppUserId);

			if (User.IsInRole("Merchant") && existing.MerchantId != merchant.Id)
			{
				return StatusCode(StatusCodes.Status403Forbidden, "Sadece kendi ürününüzü güncelleyebilirsiniz.");
			}

			await _productService.DeleteAsync(productId);
			return Ok(new { message = "Ürün başarıyla silindi." });
		}
	}
}
