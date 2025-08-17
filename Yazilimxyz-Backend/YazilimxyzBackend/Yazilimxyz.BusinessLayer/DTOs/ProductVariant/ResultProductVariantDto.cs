namespace Yazilimxyz.BusinessLayer.DTOs.ProductVariant
{
    public class ResultProductVariantDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; } // Product navigation property'sinden
        public string Size { get; set; }
        public string Color { get; set; }
        public int Stock { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedDate { get; set; }
    }
}
