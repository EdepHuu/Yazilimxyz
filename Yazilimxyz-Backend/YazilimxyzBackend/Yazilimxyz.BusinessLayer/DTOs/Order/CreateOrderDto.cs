using System.ComponentModel.DataAnnotations;
using Yazilimxyz.EntityLayer.Enums;

namespace Yazilimxyz.BusinessLayer.DTOs.Order
{
    public class CreateOrderDto
    {
        [Required(ErrorMessage = "Kullanıcı ID'si gereklidir")]
        public string UserId { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Kargo ücreti negatif olamaz")]
        public decimal ShippingFee { get; set; }

        [Required(ErrorMessage = "Alt toplam gereklidir")]
        [Range(0.01, double.MaxValue, ErrorMessage = "Alt toplam 0'dan büyük olmalıdır")]
        public decimal SubTotal { get; set; }

        [Required(ErrorMessage = "Toplam tutar gereklidir")]
        [Range(0.01, double.MaxValue, ErrorMessage = "Toplam tutar 0'dan büyük olmalıdır")]
        public decimal TotalAmount { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "İndirim tutarı negatif olamaz")]
        public decimal DiscountAmount { get; set; } = 0;

        public OrderStatus Status { get; set; } = OrderStatus.Pending;
        public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Pending;

        [Required(ErrorMessage = "Teslimat adresi ID'si gereklidir")]
        public int ShippingAddressId { get; set; }

        public DateTime? ShippedAt { get; set; }
    }
}
