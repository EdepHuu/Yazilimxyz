namespace Yazilimxyz.BusinessLayer.DTOs.ProductVariant
{
    public class CreateProductVariantDto
    {
       
        public int ProductId { get; set; }
        public string Size { get; set; }
        public string Color { get; set; }
        public int Stock { get; set; }
    }
}
