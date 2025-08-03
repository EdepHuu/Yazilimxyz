using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Yazilimxyz.BusinessLayer.Abstract;
using Yazilimxyz.BusinessLayer.DTOs.Product;

namespace Yazilimxyz.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly IProductService _productService;

        public ProductsController(IProductService productService)
        {
            _productService = productService;
        }

        // Tüm ürünleri listele (Herkes görebilir)
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var products = await _productService.GetAllAsync();
            return Ok(products);
        }

        // Ürün detayını getir (Herkes görebilir)
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var product = await _productService.GetByIdAsync(id);
            return product == null ? NotFound() : Ok(product);
        }

        // Yeni ürün ekle (Sadece Merchant)
        [HttpPost]
        [Authorize(Roles = "Merchant")]
        public async Task<IActionResult> Create([FromBody] CreateProductDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            await _productService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = dto.MerchantId }, dto);
        }

        // Ürün güncelle (Sadece Merchant veya Admin)
        [HttpPut("{id}")]
        [Authorize(Roles = "Merchant,Admin")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateProductDto dto)
        {
            if (id != dto.Id)
                return BadRequest("ID mismatch");

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            await _productService.UpdateAsync(dto);
            return NoContent();
        }

        // Ürün sil (Sadece Merchant veya Admin)
        [HttpDelete("{id}")]
        [Authorize(Roles = "Merchant,Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            await _productService.DeleteAsync(id);
            return NoContent();
        }
    }
}
