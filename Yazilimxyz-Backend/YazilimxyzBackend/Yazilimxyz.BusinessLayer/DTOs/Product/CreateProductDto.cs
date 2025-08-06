using Yazilimxyz.EntityLayer.Enums;

namespace Yazilimxyz.BusinessLayer.DTOs.Product
{
	public class CreateProductDto
	{
		public string Name { get; set; } = null!;
		public string Description { get; set; } = null!;
		public decimal BasePrice { get; set; }
		public string ModelMeasurements { get; set; } = null!;
		public string FabricInfo { get; set; } = null!;
		public string ProductCode { get; set; } = null!;
		public int Gender { get; set; }
		public bool IsActive { get; set; } = true;
		public int CategoryId { get; set; }
	}
}
