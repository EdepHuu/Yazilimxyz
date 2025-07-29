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
        public decimal SubTotal { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal DiscountAmount { get; set; } = 0;
        public OrderStatus Status { get; set; } = OrderStatus.Pending;
        public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Pending;

        // Shipping Address
        public int? ShippingAddressId { get; set; }
        public required CustomerAddress ShippingAddress { get; set; }

        public DateTime? ShippedAt { get; set; }

        // Navigation Properties
        public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    }
}
