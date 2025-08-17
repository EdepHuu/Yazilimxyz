namespace Yazilimxyz.BusinessLayer.DTOs.Category
{
    public class GetByIdCategoryDto
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

        // Alt kategoriler
        public List<ResultCategoryDto> SubCategories { get; set; } = new List<ResultCategoryDto>();

        // Bu kategorideki ürün sayısı
        public int ProductCount { get; set; }
    }
}
