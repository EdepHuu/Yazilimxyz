using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Yazilimxyz.BusinessLayer.DTOs.Merchant
{
	public class MerchantProductListItemDto
	{
		public int Id { get; set; }
		public string Name { get; set; } = default!;
		public string CategoryName { get; set; } = "-";
		public decimal Price { get; set; }
		public string? CoverImageUrl { get; set; }
		public int TotalStock { get; set; }            // tüm varyantların toplamı
		public bool IsActive { get; set; }             // p.IsActive && TotalStock > 0
		public DateTime CreatedAt { get; set; }
	}
}
