using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Yazilimxyz.BusinessLayer.DTOs.Merchant
{
	public class ColorStockDto
	{
		public string Color { get; set; } = default!;
		public int Stock { get; set; }
	}
}
