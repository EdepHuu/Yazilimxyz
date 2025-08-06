using Yazilimxyz.BusinessLayer.DTOs.ProductImage;
using Yazilimxyz.EntityLayer.Enums;

namespace Yazilimxyz.BusinessLayer.DTOs.Product
{
	public class ResultProductWithImagesDto
	{
        public int Id { get; set; }
        public string Name { get; set; }
        public List<ResultProductImageDto> Images { get; set; } = new();
    }
}
