using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Yazilimxyz.BusinessLayer.DTOs.Merchant
{
	public class SizeNodeDto
	{
		public string Size { get; set; } = default!;
		public int SizeTotalStock { get; set; }
		public List<ColorStockDto> Colors { get; set; } = new();
	}
}
