namespace Yazilimxyz.BusinessLayer.DTOs.OrderItem
{
	public class CreateOrderItemDto
	{
		public int ProductId { get; set; }
		public int ProductVariantId { get; set; }
		public int Quantity { get; set; }

		public decimal UnitPrice { get; set; }
		public decimal TotalPrice { get; set; }

		// Sipariş anı snapshot bilgileri
		public string ProductName { get; set; }
		public string Size { get; set; }
		public string Color { get; set; }
	}
}
