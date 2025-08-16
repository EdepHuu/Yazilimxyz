namespace Yazilimxyz.BusinessLayer.DTOs.Category
{
    public class ResultCategoryDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string ImageUrl { get; set; }
        public bool IsActive { get; set; }
        public int SortOrder { get; set; }
        public int? ParentCategoryId { get; set; }
        public string ParentCategoryName { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedDate { get; set; }

        // Alt kategori sayısı
        public int SubCategoryCount { get; set; }

        // Bu kategorideki ürün sayısı
        public int ProductCount { get; set; }
    }
}
