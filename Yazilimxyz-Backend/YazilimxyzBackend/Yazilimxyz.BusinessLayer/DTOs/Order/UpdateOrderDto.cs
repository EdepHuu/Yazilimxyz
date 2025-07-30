using System.ComponentModel.DataAnnotations;
using Yazilimxyz.EntityLayer.Enums;

namespace Yazilimxyz.BusinessLayer.DTOs.Order
{
    public class UpdateOrderDto
    {
        [Required(ErrorMessage = "Sipariş ID'si gereklidir")]
        public int Id { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Kargo ücreti negatif olamaz")]
        public decimal ShippingFee { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "İndirim tutarı negatif olamaz")]
        public decimal DiscountAmount { get; set; }

        public OrderStatus Status { get; set; }
        public PaymentStatus PaymentStatus { get; set; }

        public int? ShippingAddressId { get; set; }
        public DateTime? ShippedAt { get; set; }
    }
}
