namespace Yazilimxyz.BusinessLayer.DTOs.ProductImage
{
    public class CreateProductImageDto
    {
        public string ImageUrl { get; set; }
        public string AltText { get; set; }
        public int SortOrder { get; set; }
        public int ProductId { get; set; }
    }
}
