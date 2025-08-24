namespace Yazilimxyz.BusinessLayer.DTOs.OrderItem
{
	public class ResultOrderItemDto
	{
		public int OrderItemId { get; set; }

		public int ProductId { get; set; }
		public int ProductVariantId { get; set; }

		public int Quantity { get; set; }
		public decimal UnitPrice { get; set; }
		public decimal TotalPrice { get; set; }

		public string ProductName { get; set; }
		public string Size { get; set; }
		public string Color { get; set; }

		public string? ProductImageUrl { get; set; } // opsiyonel olarak eklenebilir
	}
}
