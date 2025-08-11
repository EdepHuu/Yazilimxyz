using Microsoft.AspNetCore.Http;

namespace Yazilimxyz.BusinessLayer.DTOs.ProductImage
{
    public class CreateProductImageDto
    {
		public IFormFile Image { get; set; } = null!;
		public string? AltText { get; set; }
		public int ProductId { get; set; }
	}
}
