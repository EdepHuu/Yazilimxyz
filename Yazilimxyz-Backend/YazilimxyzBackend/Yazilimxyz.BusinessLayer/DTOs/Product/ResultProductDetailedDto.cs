using Yazilimxyz.BusinessLayer.DTOs.ProductImage;
using Yazilimxyz.BusinessLayer.DTOs.ProductVariant;
using Yazilimxyz.EntityLayer.Enums;

namespace Yazilimxyz.BusinessLayer.DTOs.Product
{
   public class ResultProductDetailedDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public decimal BasePrice { get; set; }
        public string ModelInfo { get; set; }
        public string ProductCode { get; set; }
        public GenderType Gender { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime? UpdatedDate { get; set; }

        public string CategoryName { get; set; }
        public string MerchantName { get; set; }

        // Ek olarak ürün görselleri ve varyantları eklenebilir
        public List<ResultProductImageDto> Images { get; set; } = new();
        public List<ResultProductVariantDto> Variants { get; set; } = new();
    }
}
