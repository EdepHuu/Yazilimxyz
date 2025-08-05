using Yazilimxyz.EntityLayer.Enums;

namespace Yazilimxyz.BusinessLayer.DTOs.Product
{
	public class ResultProductDto
	{
		public int Id { get; set; }
		public string Name { get; set; }
		public string Description { get; set; }
		public decimal BasePrice { get; set; }
		public GenderType Gender { get; set; }
    public bool IsActive { get; set; }

		
	}
}
