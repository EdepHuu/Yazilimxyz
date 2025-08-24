using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Yazilimxyz.BusinessLayer.Abstract;

namespace Yazilimxyz.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
	public class OrderItemsController : ControllerBase
	{
		private readonly IOrderItemService _orderItemService;

		public OrderItemsController(IOrderItemService orderItemService)
		{
			_orderItemService = orderItemService;
		}

		/// <summary>Belirli bir siparişin ürünlerini getirir.</summary>
		[HttpGet("{orderId:int}")]
		public async Task<IActionResult> GetByOrder(int orderId)
		{
			var result = await _orderItemService.GetByOrderIdAsync(orderId);
			return result.Success ? Ok(result) : BadRequest(result.Message);
		}
	}
}
