using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Yazilimxyz.BusinessLayer.DTOs.Merchant;

namespace Yazilimxyz.BusinessLayer.DTOs.Customer
{
	public class CustomerProductDetailDto
	{
		public int Id { get; set; }
		public string Name { get; set; } = default!;
		public string? Description { get; set; }
		public string Gender { get; set; } = default!;
		public string CategoryName { get; set; } = default!;
		public decimal Price { get; set; }
		public bool IsActive { get; set; }

		public List<string> Images { get; set; } = new();

		// UI kolaylığı: renk balonları / beden seçimi
		public List<string> AvailableSizes { get; set; } = new();
		public List<string> AvailableColors { get; set; } = new();
		public List<SizeNodeDto> SizeColorMatrix { get; set; } = new(); // stok>0 kombinasyonlar
	}
}
