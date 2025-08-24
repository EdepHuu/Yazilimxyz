using Yazilimxyz.BusinessLayer.DTOs.OrderItem;
using Yazilimxyz.EntityLayer.Enums;

namespace Yazilimxyz.BusinessLayer.DTOs.Order
{
	public class CreateOrderDto
	{
		public int ShippingAddressId { get; set; }   // CustomerAddress.Id
		public decimal ShippingFee { get; set; }     // kargo ücreti
		public decimal DiscountAmount { get; set; } = 0; // kupon/indirim (varsa)
		public string? Note { get; set; }            // opsiyonel: “kapıya bırakın” gibi
	}
}
