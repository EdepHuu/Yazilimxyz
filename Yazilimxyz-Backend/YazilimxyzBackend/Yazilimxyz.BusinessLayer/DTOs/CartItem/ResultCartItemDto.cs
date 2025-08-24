using Yazilimxyz.BusinessLayer.DTOs.AppUser;
using Yazilimxyz.BusinessLayer.DTOs.ProductVariant;

namespace Yazilimxyz.BusinessLayer.DTOs.CartItem
{
	public class ResultCartItemDto
	{
		public int Id { get; set; }
		public int ProductId { get; set; }                 // eklendi
		public int ProductVariantId { get; set; }
		public string ProductName { get; set; }
		public string Size { get; set; }
		public string Color { get; set; }
		public int Quantity { get; set; }
		public decimal UnitPrice { get; set; }
		public decimal TotalPrice { get; set; }
		public string? ProductImageUrl { get; set; }       // opsiyonel
	}
}
