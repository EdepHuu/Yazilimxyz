namespace Yazilimxyz.BusinessLayer.DTOs.ProductImage
{
    public class GetByIdProductImageDto
    {
        public int Id { get; set; }
        public string ImageUrl { get; set; }
        public string AltText { get; set; }
        public int SortOrder { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; }
        public string ProductCode { get; set; } // Ürün kodu
        public decimal? ProductPrice { get; set; } // Ürün fiyatı
        public DateTime CreatedDate { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public bool IsActive { get; set; }
    }
}
