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

		public OrdersController(IOrderService orderService)
		{
			_orderService = orderService;
		}

		private string? GetUserId() => User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

		/// <summary>Sepeti siparişe dönüştür.</summary>
		[HttpPost]
		public async Task<IActionResult> Create([FromBody] CreateOrderDto dto)
		{
			var userId = GetUserId();
			if (string.IsNullOrEmpty(userId)) return Unauthorized();

			var result = await _orderService.CreateFromCartAsync(dto, userId);
			return result.Success ? Ok(result) : BadRequest(result);
		}

		/// <summary>Kullanıcının sipariş listesi.</summary>
		[HttpGet]
		public async Task<IActionResult> GetMyOrders()
		{
			var userId = GetUserId();
			if (string.IsNullOrEmpty(userId)) return Unauthorized();

			var result = await _orderService.GetMyOrdersAsync(userId);
			return result.Success ? Ok(result) : BadRequest(result);
		}

		/// <summary>Kullanıcının tek sipariş detayı.</summary>
		[HttpGet("{orderId:int}")]
		public async Task<IActionResult> GetMyOrder(int orderId)
		{
			var userId = GetUserId();
			if (string.IsNullOrEmpty(userId)) return Unauthorized();

			var result = await _orderService.GetMyOrderDetailAsync(orderId, userId);
			return result.Success ? Ok(result) : BadRequest(result);
		}

		/// <summary>Kullanıcı iptal (kargoya verilmeden).</summary>
		[HttpPost("{orderId:int}/cancel")]
		public async Task<IActionResult> Cancel(int orderId)
		{
			var userId = GetUserId();
			if (string.IsNullOrEmpty(userId)) return Unauthorized();

			var result = await _orderService.CancelMyOrderAsync(orderId, userId);
			return result.Success ? Ok(result) : BadRequest(result);
		}

		/// <summary>Admin/operasyon güncellemesi.</summary>
		// İleride yetki kontrolü: [Authorize(Roles = "Admin")]
		[HttpPut("{orderId:int}")]
		public async Task<IActionResult> Update(int orderId, [FromBody] UpdateOrderDto dto)
		{
			// Route/body tutarlılığı
			dto.OrderId = orderId;

			var result = await _orderService.UpdateAsync(dto);
			return result.Success ? Ok(result) : BadRequest(result);
		}

		[HttpPut("{orderId}/confirm")]
		[Authorize(Roles = "Merchant")]
		public async Task<IActionResult> ConfirmOrder(int orderId)
		{
			var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
			var result = await _orderService.ConfirmOrderAsync(orderId, userId);
			if (!result.Success)
				return BadRequest(result.Message);

			return Ok(result.Message);
		}
	}
}