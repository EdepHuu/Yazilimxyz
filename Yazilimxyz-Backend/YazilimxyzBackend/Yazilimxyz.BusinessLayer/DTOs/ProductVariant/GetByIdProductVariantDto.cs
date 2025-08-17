namespace Yazilimxyz.BusinessLayer.DTOs.ProductVariant
{
    public class GetByIdProductVariantDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }

        // Product bilgileri
        public string ProductName { get; set; }
        public string ProductDescription { get; set; }
        public decimal ProductPrice { get; set; }
        public string ProductCategoryName { get; set; }

        // Variant bilgileri
        public string Size { get; set; }
        public string Color { get; set; }
        public int Stock { get; set; }

        // Base Entity bilgileri
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public bool IsActive { get; set; }

        // İlişkili veriler (isteğe bağlı)
        public int OrderItemsCount { get; set; } // Bu variant'ın kaç sipariş kalemindekullanıldığı
        public int CartItemsCount { get; set; } // Bu variant'ın kaç sepette olduğu
    }
}
