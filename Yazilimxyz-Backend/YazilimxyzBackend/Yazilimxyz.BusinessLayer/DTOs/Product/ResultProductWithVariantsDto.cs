using Yazilimxyz.BusinessLayer.DTOs.ProductVariant;
using Yazilimxyz.EntityLayer.Enums;

namespace Yazilimxyz.BusinessLayer.DTOs.Product
{
	public class ResultProductWithVariantsDto
	{
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public decimal BasePrice { get; set; }
        public GenderType Gender { get; set; }
        public string CategoryName { get; set; }
        public string MerchantName { get; set; }

        public List<ResultProductVariantDto> Variants { get; set; } = new();
	}
}
