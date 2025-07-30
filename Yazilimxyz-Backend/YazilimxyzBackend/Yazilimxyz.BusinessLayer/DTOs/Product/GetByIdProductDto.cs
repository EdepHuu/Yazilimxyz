using Yazilimxyz.BusinessLayer.DTOs.ProductImage;
using Yazilimxyz.BusinessLayer.DTOs.ProductVariant;
using Yazilimxyz.EntityLayer.Enums;

namespace Yazilimxyz.BusinessLayer.DTOs.Product
{
    public class GetByIdProductDto
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

        // İlişkili veriler
        public int CategoryId { get; set; }
        public string CategoryName { get; set; }
        public int MerchantId { get; set; }
        public string MerchantName { get; set; }

        // Koleksiyon verileri
        public List<ResultProductVariantDto> ProductVariants { get; set; } = new List<ResultProductVariantDto>();
        public List<ResultProductImageDto> ProductImages { get; set; } = new List<ResultProductImageDto>();
    }
}
