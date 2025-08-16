namespace Yazilimxyz.BusinessLayer.DTOs.Category
{
   public class ResultCategoryHierarchyDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string ImageUrl { get; set; }
        public bool IsActive { get; set; }
        public int SortOrder { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public int ProductCount { get; set; }

        // Alt kategorilerin listesi
        public List<ResultCategoryHierarchyDto> SubCategories { get; set; } = new();
    }
}
