using Yazilimxyz.EntityLayer.Enums;

namespace Yazilimxyz.BusinessLayer.DTOs.Product
{
	public class UpdateProductDto
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
		public int CategoryId { get; set; }
	}
}
