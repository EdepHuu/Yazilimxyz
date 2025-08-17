namespace Yazilimxyz.BusinessLayer.DTOs.ProductImage
{
    public class ResultProductImageDto
    {
        public int Id { get; set; }
        public string ImageUrl { get; set; }
        public string AltText { get; set; }
        public int SortOrder { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; } // İlişkili ürün adı
        public DateTime CreatedAt { get; set; } // BaseEntity'den gelen
        public DateTime? UpdatedDate { get; set; } // BaseEntity'den gelen
    }
}
