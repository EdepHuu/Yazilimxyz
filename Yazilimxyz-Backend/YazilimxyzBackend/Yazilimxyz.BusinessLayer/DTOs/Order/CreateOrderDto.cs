using Yazilimxyz.EntityLayer.Enums;

namespace Yazilimxyz.BusinessLayer.DTOs.Order
{
    public class CreateOrderDto
    {
        public string UserId { get; set; }
        public decimal ShippingFee { get; set; }
        public decimal SubTotal { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal DiscountAmount { get; set; } = 0;
        public OrderStatus Status { get; set; } = OrderStatus.Pending;
        public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Pending;
        public int ShippingAddressId { get; set; }

    }
}
