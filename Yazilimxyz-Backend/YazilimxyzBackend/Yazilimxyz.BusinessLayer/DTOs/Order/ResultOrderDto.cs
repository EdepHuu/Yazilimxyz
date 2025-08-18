using Yazilimxyz.EntityLayer.Enums;

namespace Yazilimxyz.BusinessLayer.DTOs.Order
{
    public class ResultOrderDto
    {
        public int Id { get; set; }
        public string OrderNumber { get; set; }

        // Kullanıcı bilgileri
        public string UserName { get; set; }
        public string UserEmail { get; set; }

        // Fiyat ve durum bilgileri
        public decimal ShippingFee { get; set; }
        public decimal SubTotal { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal DiscountAmount { get; set; }
        public OrderStatus Status { get; set; }
        public PaymentStatus PaymentStatus { get; set; }

        // Tarihler
        public DateTime CreatedDate { get; set; }
        public DateTime? ShippedAt { get; set; }

        // Teslimat adresi bilgileri
        public string ShippingAddressLine { get; set; }
        public string ShippingCity { get; set; }
        public string ShippingDistrict { get; set; }
    }
}
