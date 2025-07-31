using System.ComponentModel.DataAnnotations;

namespace Yazilimxyz.BusinessLayer.DTOs.OrderItem
{
    public class UpdateOrderItemDto
    {
        [Required(ErrorMessage = "Sipariş kalemi ID'si gereklidir")]
        public int OrderItemId { get; set; }

        [Required(ErrorMessage = "Miktar gereklidir")]
        [Range(1, int.MaxValue, ErrorMessage = "Miktar en az 1 olmalıdır")]
        public int Quantity { get; set; }

        [Required(ErrorMessage = "Birim fiyat gereklidir")]
        [Range(0.01, double.MaxValue, ErrorMessage = "Birim fiyat 0'dan büyük olmalıdır")]
        public decimal UnitPrice { get; set; }

        [Required(ErrorMessage = "Toplam fiyat gereklidir")]
        [Range(0.01, double.MaxValue, ErrorMessage = "Toplam fiyat 0'dan büyük olmalıdır")]
        public decimal TotalPrice { get; set; }
    }
}
