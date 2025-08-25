using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Yazilimxyz.EntityLayer.Entities;
using Yazilimxyz.EntityLayer.Enums;

namespace Yazilimxyz.EntityLayer.Entities
{
	public class Order : BaseEntity
	{
		public string OrderNumber { get; set; }
		public string UserId { get; set; }
		public AppUser User { get; set; }

		public decimal ShippingFee { get; set; }
		public decimal DiscountAmount { get; set; }
		public decimal SubTotal { get; set; }
		public decimal TotalAmount { get; set; }

		public OrderStatus Status { get; set; }
		public PaymentStatus PaymentStatus { get; set; }
		public DateTime? DeliveredAt { get; set; }
		public DateTime? ConfirmedAt { get; set; }
		public DateTime? CancelledAt { get; set; }
		public string Note { get; set; }

		public int ShippingAddressId { get; set; }
		public CustomerAddress ShippingAddress { get; set; }
		public ICollection<OrderItem> OrderItems { get; set; }
		public ICollection<MerchantOrder> MerchantOrders { get; set; } = new List<MerchantOrder>();
	}
}
