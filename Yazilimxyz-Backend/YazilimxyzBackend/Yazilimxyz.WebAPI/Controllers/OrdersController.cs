using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Yazilimxyz.BusinessLayer.Abstract;
using Yazilimxyz.BusinessLayer.DTOs.Order;

namespace Yazilimxyz.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrderController : ControllerBase
    {
        private readonly IOrderService _orderService;

        public OrderController(IOrderService orderService)
        {
            _orderService = orderService;
        }

        // TÜM SİPARİŞLER – sadece admin
        [HttpGet("get-all")]
        [Authorize(Roles = "AppAdmin")]
        public async Task<IActionResult> GetAllOrdersAsync()
        {
            var result = await _orderService.GetAllAsync();
            if (!result.Success) return BadRequest(result.Message);
            return Ok(result.Data);
        }

        // ID ile getir
        [HttpGet("{id:int}")]
        [Authorize(Roles = "Customer,AppAdmin")]
        public async Task<IActionResult> GetOrderById(int id)
        {
            if (id <= 0) return BadRequest("Geçersiz sipariş id.");

            var result = await _orderService.GetByIdAsync(id);
            if (!result.Success || result.Data == null)
                return NotFound(result.Message);

            return Ok(result.Data);
        }

        // DETAY + itemler
        [HttpGet("{id:int}/detailed")]
        [Authorize(Roles = "Customer,AppAdmin")]
        public async Task<IActionResult> GetOrderDetailed(int id)
        {
            if (id <= 0) return BadRequest("Geçersiz sipariş id.");

            var result = await _orderService.GetWithItemAsync(id);
            if (!result.Success || result.Data == null)
                return NotFound(result.Message);

            return Ok(result.Data);
        }

        // SİPARİŞ OLUŞTUR
        [HttpPost("create")]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderDto dto)
        {
            if (dto.TotalAmount <= 0)
                return BadRequest("Sipariş toplamı 0’dan büyük olmalıdır.");

            // UserId otomatik setle
            dto.UserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            var result = await _orderService.CreateAsync(dto);
            if (!result.Success)
                return BadRequest(result.Message);

            return Ok(new { message = "Sipariş başarıyla oluşturuldu." });
        }

        // GÜNCELLE
        [HttpPut("update")]
        [Authorize(Roles = "Customer,AppAdmin")]
        public async Task<IActionResult> UpdateOrder([FromBody] UpdateOrderDto dto)
        {
            if (dto.Id <= 0) return BadRequest("Geçersiz sipariş id.");

            var existing = await _orderService.GetByIdAsync(dto.Id);
            if (!existing.Success || existing.Data == null)
                return NotFound("Güncellenecek sipariş bulunamadı.");

            // Eğer müşteri ise sadece kendi siparişini güncelleyebilir
            if (User.IsInRole("Customer"))
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (existing.Data.AppUserId != userId)
                    return StatusCode(StatusCodes.Status403Forbidden,
                        "Sadece kendi siparişinizi güncelleyebilirsiniz.");
            }

            var result = await _orderService.UpdateAsync(dto);
            if (!result.Success)
                return BadRequest(result.Message);

            return Ok(new { message = result.Message });
        }

        // SİL
        [HttpDelete("delete/{id:int}")]
        [Authorize(Roles = "Customer,AppAdmin")]
        public async Task<IActionResult> DeleteOrder(int id)
        {
            var existing = await _orderService.GetByIdAsync(id);
            if (!existing.Success || existing.Data == null)
                return NotFound("Silinecek sipariş bulunamadı.");

            if (User.IsInRole("Customer"))
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (existing.Data.AppUserId != userId)
                    return StatusCode(StatusCodes.Status403Forbidden,
                        "Sadece kendi siparişinizi silebilirsiniz.");
            }

            var result = await _orderService.DeleteAsync(id);
            if (!result.Success)
                return BadRequest(result.Message);

            return Ok(new { message = "Sipariş başarıyla silindi." });
        }

        // Müşterinin kendi siparişleri
        [HttpGet("my")]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> MyOrders()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var result = await _orderService.GetByUserIdAsync(userId);
            if (!result.Success) return BadRequest(result.Message);

            return Ok(result.Data);
        }
    }
}