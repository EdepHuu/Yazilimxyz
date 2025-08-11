using Microsoft.AspNetCore.Http;

namespace Yazilimxyz.BusinessLayer.DTOs.ProductImage
{
    public class UpdateProductImageDto
    {
        public int Id { get; set; }
		public IFormFile Image { get; set; }
		public string AltText { get; set; }
		public int ProductId { get; set; }
	}
}
