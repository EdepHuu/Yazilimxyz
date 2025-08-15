using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Yazilimxyz.BusinessLayer.DTOs.Merchant
{
	public class ProductVariantRowDto
	{
		public int Id { get; set; }
		public string Size { get; set; } = default!;
		public string Color { get; set; } = default!;
		public int Stock { get; set; }
	}
}
