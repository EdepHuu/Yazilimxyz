namespace Yazilimxyz.BusinessLayer.DTOs.Product
{
	public class ProductFilterRequestDto
	{
		public int[]? MerchantIds { get; set; }   // marka
		public string[]? Sizes { get; set; }      // beden
		public string[]? Colors { get; set; }     // renk
		public decimal? MinPrice { get; set; }
		public decimal? MaxPrice { get; set; }
		public string? SortBy { get; set; } = "newest";
		public bool SortDesc { get; set; } = false;
		public int Page { get; set; } = 1;
		public int PageSize { get; set; } = 24;

        public string[]? Genders { get; set; }

        // Tek kategoriyi veya birden fazla kategoriyi kabul etsin:
        public int? CategoryId { get; set; }
        public int[]? CategoryIds { get; set; }

        // Varsayılan: true → verilen kategori(ler)in tüm altlarını da kapsa
        public bool IncludeSubCategories { get; set; } = true;
    }

	public class ProductListItemDto
	{
		public int Id { get; set; }
		public string Name { get; set; } = default!;
		public decimal Price { get; set; }
		public string? CoverImageUrl { get; set; }
		public int MerchantId { get; set; }
		public string MerchantName { get; set; } = default!;
	}
	public class PagedResult<T>
	{
		public int Total { get; set; }
		public int Page { get; set; }
		public int PageSize { get; set; }
		public IList<T> Items { get; set; } = new List<T>();
	}
}
