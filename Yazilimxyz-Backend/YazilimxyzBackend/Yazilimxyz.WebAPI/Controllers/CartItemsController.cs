using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Yazilimxyz.BusinessLayer.Abstract;
using Yazilimxyz.BusinessLayer.DTOs.CartItem;

namespace Yazilimxyz.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
	public class CartItemsController : ControllerBase
	{
		private readonly ICartItemService _cartItemService;

		public CartItemsController(ICartItemService cartItemService)
		{
			_cartItemService = cartItemService;
		}

		// Kullanıcı ID'sini token'dan al
		private string? GetUserId()
			=> User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

		/// <summary> Sepeti listele (aktif kullanıcının) </summary>
		[HttpGet]
		public async Task<IActionResult> GetMyCart()
		{
			var userId = GetUserId();
			if (string.IsNullOrEmpty(userId)) return Unauthorized();

			var result = await _cartItemService.GetByUserIdAsync(userId);
			return result.Success ? Ok(result) : BadRequest(result);
		}

		/// <summary> Sepete ürün ekle (aynı varyant varsa miktarı artırır) </summary>
		[HttpPost]
		public async Task<IActionResult> Add([FromBody] CreateCartItemDto dto)
		{
			var userId = GetUserId();
			if (string.IsNullOrEmpty(userId)) return Unauthorized();

			var result = await _cartItemService.AddOrUpdateAsync(dto, userId);
			return result.Success ? Ok(result) : BadRequest(result);
		}

		/// <summary> Sepet öğesinin miktarını güncelle </summary>
		[HttpPut("{cartItemId:int}/quantity")]
		public async Task<IActionResult> UpdateQuantity(int cartItemId, [FromBody] UpdateCartItemDto dto)
		{
			var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
			if (string.IsNullOrEmpty(userId)) return Unauthorized();

			var result = await _cartItemService.UpdateQuantityAsync(cartItemId, dto.Quantity, userId);
			return result.Success ? Ok(result) : BadRequest(result);
		}

		/// <summary> Sepetten tek bir ürünü kaldır </summary>
		[HttpDelete("{cartItemId:int}")]
		public async Task<IActionResult> Remove(int cartItemId)
		{
			var userId = GetUserId();
			if (string.IsNullOrEmpty(userId)) return Unauthorized();

			var result = await _cartItemService.RemoveAsync(cartItemId, userId);
			return result.Success ? Ok(result) : BadRequest(result);
		}

		/// <summary> Sepeti tamamen temizle </summary>
		[HttpDelete]
		public async Task<IActionResult> Clear()
		{
			var userId = GetUserId();
			if (string.IsNullOrEmpty(userId)) return Unauthorized();

			var result = await _cartItemService.ClearCartAsync(userId);
			return result.Success ? Ok(result) : BadRequest(result);
		}
	}
}
