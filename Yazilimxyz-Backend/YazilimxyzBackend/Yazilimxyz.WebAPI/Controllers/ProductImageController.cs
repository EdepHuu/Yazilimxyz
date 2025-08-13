using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Yazilimxyz.BusinessLayer.Abstract;
using Yazilimxyz.BusinessLayer.DTOs.ProductImage;

namespace Yazilimxyz.WebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductImageController : ControllerBase
    {
        private readonly IProductImageService _productImageService;

        public ProductImageController(IProductImageService productImageService)
        {
            _productImageService = productImageService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _productImageService.GetAllAsync();
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _productImageService.GetByIdAsync(id);

            if (result == null)
            {
                return NotFound("Fotoğraf bulunamadı.");
            }

            return Ok(result);
        }

        [HttpGet("product/{productId}")]
        public async Task<IActionResult> GetByProductId(int productId)
        {
            var result = await _productImageService.GetByProductIdAsync(productId);
            return Ok(result);
        }

        [HttpGet("product/{productId}/main")]
        public async Task<IActionResult> GetMainImage(int productId)
        {
            var result = await _productImageService.GetMainImageAsync(productId);

            if (result == null)
            {
                return NotFound("Ürüne ait main fotoğraf bulunamadı.");
            }

            return Ok(result);
        }

        [HttpPost("create")]
        [Consumes("multipart/form-data")]
        [Authorize(Roles = "Merchant,AppAdmin")]
        public async Task<IActionResult> Create([FromForm] CreateProductImageDto dto)
        {
            if (dto == null || dto.ProductId <= 0 || dto.Image == null || dto.Image.Length == 0)
                return BadRequest("Geçersiz veri gönderildi.");

            await _productImageService.CreateAsync(dto);
            return Ok("Fotoğraf başarıyla eklendi.");
        }

        [HttpPut]
        public async Task<IActionResult> Update([FromBody] UpdateProductImageDto dto)
        {
            var image = await _productImageService.GetByIdAsync(dto.Id);

            if (image == null)
            {
                return NotFound("Güncellenmek istenen fotoğraf bulunamadı.");
            }

            await _productImageService.UpdateAsync(dto);
            return Ok("Fotoğraf başarıyla güncellendi.");
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var image = await _productImageService.GetByIdAsync(id);

            if (image == null)
            {
                return NotFound("Silinmek istenen fotoğraf bulunamadı.");
            }

            await _productImageService.DeleteAsync(id);
            return Ok("Fotoğraf başarıyla silindi.");
        }

        [HttpPut("set-main/{imageId}")]
        public async Task<IActionResult> SetMain(int imageId)
        {
            var image = await _productImageService.GetByIdAsync(imageId);

            if (image == null)
            {
                return NotFound("Fotoğraf bulunamadı.");
            }

            await _productImageService.SetMainImageAsync(imageId);
            return Ok("Main fotoğraf başarıyla güncellendi.");
        }

        [HttpPut("reorder/{productId}")]
        public async Task<IActionResult> Reorder(int productId, [FromBody] List<int> imageIds)
        {
            if (imageIds == null || !imageIds.Any())
            {
                return BadRequest("Sıralama verisi gönderilmedi.");
            }

            var result = await _productImageService.GetByProductIdAsync(productId);

            if (result == null || result.Data == null || !result.Data.Any())
            {
                return NotFound("Ürüne ait fotoğraf bulunamadı.");
            }

            await _productImageService.ReorderImagesAsync(productId, imageIds);
            return Ok("Fotoğrafların sırası başarıyla güncellendi.");
        }
    }
}
