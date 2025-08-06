using Yazilimxyz.BusinessLayer.DTOs.AppUser;
using Yazilimxyz.BusinessLayer.DTOs.ProductImage;
using Yazilimxyz.EntityLayer.Enums;



namespace Yazilimxyz.BusinessLayer.DTOs.Product
{
    public class ResultProductWithMerchantDto
    {
// Ürüne ait bilgiler
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public decimal BasePrice { get; set; }
        public GenderType Gender { get; set; }
        public bool IsActive { get; set; }
        public string ProductCode { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedDate { get; set; }

        // Ürünün ait olduğu kategori bilgisi
        public string CategoryName { get; set; }
        
        // Satıcıya ait bilgiler
        public int MerchantId { get; set; }
        public string MerchantName { get; set; }

        // Eğer ürün resimlerini de getirmek isterseniz bu listeyi ekleyin.
        public List<ResultProductImageDto> Images { get; set; } = new();
    }
}
