namespace Yazilimxyz.BusinessLayer.DTOs.ProductImage
{
    public class UpdateProductImageDto
    {
        public int Id { get; set; }
        public string ImageUrl { get; set; }
        public string AltText { get; set; }
		public int ProductId { get; set; }
	}
}
