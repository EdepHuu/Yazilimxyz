using Yazilimxyz.BusinessLayer.DTOs.ProductImage;
using Yazilimxyz.EntityLayer.Enums;

namespace Yazilimxyz.BusinessLayer.DTOs.Product
{
	public class ResultProductWithImagesDto
	{
		public int Id { get; set; }
		public string Name { get; set; }
		public string Description { get; set; }
		public decimal BasePrice { get; set; }
		public string ModelMeasurements { get; set; }
		public string FabricInfo { get; set; }
		public string ProductCode { get; set; }
		public GenderType Gender { get; set; }
		public bool IsActive { get; set; }
		public DateTime CreatedAt { get; set; }
		public DateTime? UpdatedDate { get; set; }

		public string CategoryName { get; set; }
		public string MerchantName { get; set; }

		public List<ResultProductImageDto> Images { get; set; } = new();
	}
}
