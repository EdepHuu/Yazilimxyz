using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Yazilimxyz.BusinessLayer.Abstract;
using Yazilimxyz.BusinessLayer.DTOs.Order;

namespace Yazilimxyz.WebAPI.Controllers
{
	[ApiController]
	[Route("api/[controller]")]
	[Authorize]
	public class OrdersController : ControllerBase
	{
		private readonly IOrderService _orderService;
		private readonly IHttpContextAccessor _httpContextAccessor;

		public OrdersController(IOrderService orderService, IHttpContextAccessor httpContextAccessor)
		{
			_orderService = orderService;
			_httpContextAccessor = httpContextAccessor;
		}

		// JWT'den UserId alma
		private string GetUserId()
		{
			return _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
		}

		// JWT'den MerchantId alma
		private string GetMerchantId()
		{
			return _httpContextAccessor.HttpContext?.User?.FindFirst("MerchantId")?.Value;
		}

		// 1. Sepetten Sipariş Oluştur
		[HttpPost]
		[Authorize(Roles = "Customer")]
		public async Task<IActionResult> Create([FromBody] CreateOrderDto dto)
		{
			var userId = GetUserId();
			if (string.IsNullOrEmpty(userId))
				return Unauthorized("Kullanıcı doğrulanamadı.");

			var result = await _orderService.CreateFromCartAsync(dto, userId);
			if (!result.Success)
				return BadRequest(result.Message);

			return Ok(result);
		}

		// 2. Kullanıcının Tüm Siparişleri
		[HttpGet("my-orders")]
		[Authorize(Roles = "Customer")]
		public async Task<IActionResult> GetMyOrders()
		{
			var userId = GetUserId();
			if (string.IsNullOrEmpty(userId))
				return Unauthorized("Kullanıcı doğrulanamadı.");

			var result = await _orderService.GetMyOrdersAsync(userId);
			return Ok(result);
		}

		// 3. Sipariş Detayı
		[HttpGet("my-orders/{orderId}")]
		[Authorize(Roles = "Customer")]
		public async Task<IActionResult> GetMyOrderDetail(int orderId)
		{
			var userId = GetUserId();
			if (string.IsNullOrEmpty(userId))
				return Unauthorized("Kullanıcı doğrulanamadı.");

			var result = await _orderService.GetMyOrderDetailAsync(orderId, userId);
			if (!result.Success)
				return NotFound(result.Message);

			return Ok(result);
		}

		// 4. Admin/Operasyon: Sipariş Güncelleme
		[HttpPut("{orderId}")]
		[Authorize(Roles = "Admin,Operator")]
		public async Task<IActionResult> Update(int orderId, [FromBody] UpdateOrderDto dto)
		{
			var result = await _orderService.UpdateAsync(orderId, dto);
			if (!result.Success)
				return NotFound(result.Message);

			return Ok(result);
		}

		// 5. Kullanıcı: Sipariş İptal Etme
		[HttpPut("cancel/{orderId}")]
		[Authorize(Roles = "Customer")]
		public async Task<IActionResult> CancelMyOrder(int orderId)
		{
			var userId = GetUserId();
			if (string.IsNullOrEmpty(userId))
				return Unauthorized("Kullanıcı doğrulanamadı.");

			var result = await _orderService.CancelMyOrderAsync(orderId, userId);
			if (!result.Success)
				return BadRequest(result.Message);

			return Ok(result);
		}

		// 6. Satıcı: Sipariş Onaylama
		[HttpPut("confirm/{orderId}")]
		[Authorize(Roles = "Merchant")]
		public async Task<IActionResult> ConfirmOrder(int orderId)
		{
			var merchantId = GetMerchantId();
			if (string.IsNullOrEmpty(merchantId))
				return Unauthorized("Satıcı doğrulanamadı.");

			var result = await _orderService.ConfirmOrderAsync(orderId, merchantId);
			if (!result.Success)
				return BadRequest(result.Message);

			return Ok(result);
		}

		// 7. Kullanıcı: Sipariş Durumu İlerletme (Kargoya verildi, Teslim edildi vs.)
		[HttpPut("advance/{orderId}")]
		[Authorize(Roles = "Customer")]
		public async Task<IActionResult> AdvanceOrderStatus(int orderId)
		{
			var userId = GetUserId();
			if (string.IsNullOrEmpty(userId))
				return Unauthorized("Kullanıcı doğrulanamadı.");

			var result = await _orderService.AdvanceOrderStatusAsync(orderId, userId);
			if (!result.Success)
				return BadRequest(result.Message);

			return Ok(result);
		}
	}
}