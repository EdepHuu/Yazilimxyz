using Yazilimxyz.EntityLayer.Enums;

namespace Yazilimxyz.BusinessLayer.DTOs.Product
{
   public class CreateProductDto
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public decimal BasePrice { get; set; }
        public string ModelInfo { get; set; }
        public string ProductCode { get; set; }
        public GenderType Gender { get; set; }
        public int CategoryId { get; set; }
        public int MerchantId { get; set; }
    }
}
