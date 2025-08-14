using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Yazilimxyz.BusinessLayer.DTOs.Merchant
{
	public class MerchantProductDetailDto
	{
		public int Id { get; set; }
		public string Name { get; set; } = default!;
		public string? Description { get; set; }
		public string Gender { get; set; } = default!;
		public string CategoryName { get; set; } = default!;
		public decimal Price { get; set; }
		public bool IsActive { get; set; }
		public int TotalStock { get; set; }
		public string Status => (IsActive && TotalStock > 0) ? "Aktif" : "Pasif";

		public List<string> Images { get; set; } = new();
		public List<ProductVariantRowDto> Variants { get; set; } = new(); // düz liste
		public List<SizeNodeDto> Matrix { get; set; } = new();            // beden -> renk
	}
}
