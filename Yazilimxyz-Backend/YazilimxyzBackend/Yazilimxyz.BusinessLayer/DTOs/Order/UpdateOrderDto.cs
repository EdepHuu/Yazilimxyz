using Yazilimxyz.EntityLayer.Enums;

namespace Yazilimxyz.BusinessLayer.DTOs.Order
{
	public class UpdateOrderDto
	{
		public OrderStatus Status { get; set; }          // Pending→Confirmed→Processing→Shipped→Delivered
		public PaymentStatus PaymentStatus { get; set; } // Pending→Paid / Failed / Refunded

		public DateTime? ShippedAt { get; set; }         // kargoya verildiğinde doldur
		public string? Note { get; set; }                // opsiyonel sipariş notu günc.
	}
}
