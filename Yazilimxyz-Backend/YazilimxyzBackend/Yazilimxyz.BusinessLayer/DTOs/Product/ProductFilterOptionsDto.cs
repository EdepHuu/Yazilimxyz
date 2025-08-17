using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Yazilimxyz.BusinessLayer.DTOs.Product
{
	public class ProductFilterOptionsDto
	{
		public List<string> Sizes { get; set; }
		public List<string> Colors { get; set; }
		public List<string> Genders { get; set; }
		public List<BrandOptionDto> Brands { get; set; }
		public PriceRangeDto PriceRange { get; set; }
	}

	public class PriceRangeDto
	{
		public double Min { get; set; }
		public double Max { get; set; }
	}

	public class BrandOptionDto
	{
		public int Id { get; set; }
		public string Name { get; set; }
	}
}
