using Yazilimxyz.BusinessLayer.DTOs.OrderItem;
using Yazilimxyz.EntityLayer.Enums;

namespace Yazilimxyz.BusinessLayer.DTOs.Order
{
	public class CreateOrderDto
	{
		public int ShippingAddressId { get; set; }   // CustomerAddress.Id
		public string? Note { get; set; }            // opsiyonel: “kapıya bırakın” gibi
	}
}
