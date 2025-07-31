using System.ComponentModel.DataAnnotations;

namespace Yazilimxyz.BusinessLayer.DTOs.OrderItem
{
    public class CreateOrderItemDto
    {
        [Required(ErrorMessage = "Sipariş ID'si gereklidir")]
        public int OrderId { get; set; }

        [Required(ErrorMessage = "Ürün ID'si gereklidir")]
        public int ProductId { get; set; }

        [Required(ErrorMessage = "Ürün varyant ID'si gereklidir")]
        public int ProductVariantId { get; set; }

        [Required(ErrorMessage = "Miktar gereklidir")]
        [Range(1, int.MaxValue, ErrorMessage = "Miktar en az 1 olmalıdır")]
        public int Quantity { get; set; }

        [Required(ErrorMessage = "Birim fiyat gereklidir")]
        [Range(0.01, double.MaxValue, ErrorMessage = "Birim fiyat 0'dan büyük olmalıdır")]
        public decimal UnitPrice { get; set; }

        [Required(ErrorMessage = "Toplam fiyat gereklidir")]
        [Range(0.01, double.MaxValue, ErrorMessage = "Toplam fiyat 0'dan büyük olmalıdır")]
        public decimal TotalPrice { get; set; }

        // Sipariş anındaki ürün bilgileri
        [Required(ErrorMessage = "Ürün adı gereklidir")]
        [StringLength(200, ErrorMessage = "Ürün adı en fazla 200 karakter olabilir")]
        public string ProductName { get; set; }

        [StringLength(50, ErrorMessage = "Beden en fazla 50 karakter olabilir")]
        public string Size { get; set; }

        [StringLength(50, ErrorMessage = "Renk en fazla 50 karakter olabilir")]
        public string Color { get; set; }
    }
}
