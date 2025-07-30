using Yazilimxyz.EntityLayer.Enums;

namespace Yazilimxyz.BusinessLayer.DTOs.Order
{
    public class ResultOrderDto
    {
        public int Id { get; set; }
        public string OrderNumber { get; set; }
        public string UserId { get; set; }
        public string UserName { get; set; }
        public string UserEmail { get; set; }
        public decimal ShippingFee { get; set; }
        public decimal SubTotal { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal DiscountAmount { get; set; }
        public OrderStatus Status { get; set; }
        public string StatusText { get; set; }
        public PaymentStatus PaymentStatus { get; set; }
        public string PaymentStatusText { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime? ShippedAt { get; set; }
        public int OrderItemCount { get; set; }

        // Teslimat adresi bilgileri
        public string ShippingAddressLine { get; set; }
        public string ShippingCity { get; set; }
        public string ShippingDistrict { get; set; }
    }
}
