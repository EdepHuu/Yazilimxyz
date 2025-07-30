using System.ComponentModel.DataAnnotations;

namespace Yazilimxyz.BusinessLayer.DTOs.ProductVariant
{
    public class UpdateProductVariantDto
    {
        [Required(ErrorMessage = "Id alanı zorunludur.")]
        public int Id { get; set; }

        [Required(ErrorMessage = "ProductId alanı zorunludur.")]
        public int ProductId { get; set; }

        [Required(ErrorMessage = "Size alanı zorunludur.")]
        [StringLength(50, ErrorMessage = "Size en fazla 50 karakter olabilir.")]
        public string Size { get; set; }

        [Required(ErrorMessage = "Color alanı zorunludur.")]
        [StringLength(50, ErrorMessage = "Color en fazla 50 karakter olabilir.")]
        public string Color { get; set; }

        [Required(ErrorMessage = "Stock alanı zorunludur.")]
        [Range(0, int.MaxValue, ErrorMessage = "Stock 0 veya pozitif bir değer olmalıdır.")]
        public int Stock { get; set; }
    }
}
