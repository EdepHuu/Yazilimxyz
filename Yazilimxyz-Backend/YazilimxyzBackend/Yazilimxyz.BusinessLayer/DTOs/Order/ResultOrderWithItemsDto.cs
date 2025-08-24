using Yazilimxyz.BusinessLayer.DTOs.OrderItem;
using Yazilimxyz.EntityLayer.Enums;

namespace Yazilimxyz.BusinessLayer.DTOs.Order
{
	public class ResultOrderWithItemsDto
	{
		public int Id { get; set; }
		public string OrderNumber { get; set; }

		public decimal SubTotal { get; set; }
		public decimal ShippingFee { get; set; }
		public decimal DiscountAmount { get; set; }
		public decimal TotalAmount { get; set; }

		public OrderStatus Status { get; set; }
		public PaymentStatus PaymentStatus { get; set; }

		public DateTime CreatedAt { get; set; }
		public DateTime? ShippedAt { get; set; }

		// Adres tek satır string (CustomerAddress’tan derlenecek)
		public string ShippingAddressLine { get; set; } // "Ev - Selamiçeşme Cd. No:10, Kadıköy/İstanbul"
		public string? Note { get; set; }

		public List<ResultOrderItemDto> Items { get; set; } = new();
	}

}
