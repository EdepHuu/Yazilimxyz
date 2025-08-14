using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Yazilimxyz.BusinessLayer.DTOs.Merchant
{
	public class MerchantProductListQueryDto
	{
		public string? Keyword { get; set; }           // ürün adı veya kategori adı
		public int? CategoryId { get; set; }           // isteğe bağlı
		public string? SortBy { get; set; } = "createdAt";  // price|name|stock|createdAt
		public bool SortDesc { get; set; } = true;
		public int Page { get; set; } = 1;
		public int PageSize { get; set; } = 10;        // UI'daki “sayfa boyutu” ile eşle
	}
}
