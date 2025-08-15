using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Yazilimxyz.BusinessLayer.Abstract;
using Yazilimxyz.BusinessLayer.DTOs.Customer;
using Yazilimxyz.BusinessLayer.DTOs.Merchant;
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

        public ProductController(
            IProductService productService,
            ICategoryService categoryService,
            IMerchantRepository merchantRepository)
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
            var result = await _productService.GetByIdAsync(productId);
            if (!result.Success || result.Data == null)
                return NotFound("Ürün bulunamadı.");

            return Ok(result.Data);
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
            var result = await _productService.GetWithImagesAsync(productId);
            if (!result.Success || result.Data == null)
                return NotFound();

            return Ok(result.Data);
        }

        [HttpGet("{productId}/variants")]
        [AllowAnonymous]
        public async Task<IActionResult> GetProductWithVariantsAsync(int productId)
        {
            var result = await _productService.GetWithVariantsAsync(productId);
            if (!result.Success || result.Data == null)
                return NotFound();

            return Ok(result.Data);
        }

        [HttpGet("{productId}/detailed")]
        [AllowAnonymous]
        public async Task<IActionResult> GetProductDetailedAsync(int productId)
        {
            var result = await _productService.GetDetailedAsync(productId);
            if (!result.Success || result.Data == null)
                return NotFound();

            return Ok(result.Data);
        }

        [HttpPost("create")]
        [Authorize(Roles = "Merchant,AppAdmin")]
        public async Task<IActionResult> CreateProductAsync([FromBody] CreateProductDto dto)
        {
            if (!Enum.IsDefined(typeof(GenderType), dto.Gender))
                return BadRequest("Geçersiz cinsiyet değeri. Lütfen 1 (Male), 2 (Female) veya 3 (Unisex) gönderin.");

            if (dto.BasePrice <= 0)
                return BadRequest("Ürün fiyatı 0'dan büyük olmalıdır.");

            var category = await _categoryService.GetByIdAsync(dto.CategoryId);
            if (category == null)
                return BadRequest("Kategori bulunamadı.");

            await _productService.CreateAsync(dto);
            return Ok(new { message = "Ürün başarıyla eklendi." });
        }

        [HttpPut("update")]
        [Authorize(Roles = "Merchant,AppAdmin")]
        public async Task<IActionResult> UpdateProductAsync([FromBody] UpdateProductDto dto)
        {
            // (mevcut validasyonlar)
            var category = await _categoryService.GetByIdAsync(dto.CategoryId);
            if (category == null)
                return BadRequest("Kategori bulunamadı.");

            var existingResult = await _productService.GetDetailedAsync(dto.Id);
            if (!existingResult.Success || existingResult.Data == null)
                return NotFound("Güncellenecek ürün bulunamadı.");

            var existing = existingResult.Data; // DTO

            // develop tarafında kontrol satırları varsa derleme hatasına düşmemesi için merchant'ı al
            if (User.IsInRole("Merchant"))
            {
                var userAppUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var merchant = await _merchantRepository.GetByAppUserIdAsync(userAppUserId);
                if (merchant != null && existing.MerchantId != merchant.Id)
                    return StatusCode(StatusCodes.Status403Forbidden, "Sadece kendi ürününüzü güncelleyebilirsiniz.");
            }

            await _productService.UpdateAsync(dto);
            return Ok(new { message = "Ürün başarıyla güncellendi." });
        }

        [HttpDelete("delete/{productId}")]
        [Authorize(Roles = "Merchant,AppAdmin")]
        public async Task<IActionResult> DeleteProductAsync(int productId)
        {
            var existingResult = await _productService.GetDetailedAsync(productId);
            if (!existingResult.Success || existingResult.Data == null)
                return NotFound("Silinecek ürün bulunamadı.");

            var existing = existingResult.Data; // DTO

            if (User.IsInRole("Merchant"))
            {
                var userAppUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var merchant = await _merchantRepository.GetByAppUserIdAsync(userAppUserId);
                if (merchant != null && existing.MerchantId != merchant.Id)
                    return StatusCode(StatusCodes.Status403Forbidden, "Sadece kendi ürününüzü güncelleyebilirsiniz.");
            }

            await _productService.DeleteAsync(productId);
            return Ok(new { message = "Ürün başarıyla silindi." });
        }

        [HttpPost("Filter")]
        [AllowAnonymous]
        [ProducesResponseType(typeof(PagedResult<ProductListItemDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> SearchAsync([FromQuery] ProductFilterRequestDto req)
        {
            if (req.Page <= 0) req.Page = 1;
            if (req.PageSize <= 0 || req.PageSize > 100) req.PageSize = 24;
            if (req.MinPrice.HasValue && req.MaxPrice.HasValue && req.MinPrice > req.MaxPrice)
                return BadRequest("MinPrice, MaxPrice'tan büyük olamaz.");

            // normalize
            req.MerchantIds = req.MerchantIds?.Distinct().ToArray();
            req.Sizes = req.Sizes?
                .Where(s => !string.IsNullOrWhiteSpace(s))
                .Select(s => s.Trim())
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToArray();
            req.Colors = req.Colors?
                .Where(c => !string.IsNullOrWhiteSpace(c))
                .Select(c => c.Trim())
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToArray();

            var result = await _productService.FilterAsync(req);
            return Ok(result);
        }

        // CUSTOMER – public ürün detay
        [HttpGet("{id:int}")]
        [AllowAnonymous]
        [ProducesResponseType(typeof(CustomerProductDetailDto), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetPublicDetail(int id)
        {
            if (id <= 0) return BadRequest("Geçersiz ürün id.");
            var res = await _productService.GetPublicProductDetailAsync(id);
            if (!res.Success) return NotFound(res.Message);
            return Ok(res.Data);
        }

        // MERCHANT – kendi ürün listesi
        [HttpGet("my")]
        [Authorize(Roles = "Merchant")]
        [ProducesResponseType(typeof(PagedResult<MerchantProductListItemDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> MyProducts([FromQuery] MerchantProductListQueryDto q)
        {
            q ??= new MerchantProductListQueryDto();
            var res = await _productService.GetMyProductsAsync(q);
            if (!res.Success) return BadRequest(res.Message);
            return Ok(res.Data);
        }

        // MERCHANT – kendi ürün detay
        [HttpGet("my/{id:int}")]
        [Authorize(Roles = "Merchant")]
        [ProducesResponseType(typeof(MerchantProductDetailDto), StatusCodes.Status200OK)]
        public async Task<IActionResult> MyProductDetail(int id)
        {
            if (id <= 0) return BadRequest("Geçersiz ürün id.");
            var res = await _productService.GetMyProductDetailAsync(id);
            if (!res.Success) return NotFound(res.Message);
            return Ok(res.Data);
        }
    }
}
