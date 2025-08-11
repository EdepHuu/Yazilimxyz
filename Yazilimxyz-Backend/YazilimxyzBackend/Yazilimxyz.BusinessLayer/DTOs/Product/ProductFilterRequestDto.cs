using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Yazilimxyz.BusinessLayer.DTOs.Product
{
	public class ProductFilterRequestDto
	{
		public string? Keyword { get; set; }
		public int? CategoryId { get; set; }
		public int[]? MerchantIds { get; set; }   // marka
		public string[]? Sizes { get; set; }      // ProductVariant.Size
		public string[]? Colors { get; set; }     // ProductVariant.Color
		public string[]? Genders { get; set; }    // Product.Gender (enum -> string/enum)
		public decimal? MinPrice { get; set; }
		public decimal? MaxPrice { get; set; }
		public string? SortBy { get; set; }       // "price","newest","name"
		public bool SortDesc { get; set; }
		public int Page { get; set; } = 1;
		public int PageSize { get; set; } = 24;
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
