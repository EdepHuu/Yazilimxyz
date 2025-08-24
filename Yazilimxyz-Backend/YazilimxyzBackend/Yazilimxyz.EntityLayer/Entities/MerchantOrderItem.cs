using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Yazilimxyz.EntityLayer.Entities
{
	public class MerchantOrderItem : BaseEntity
	{
		public int ProductId { get; set; }
		public int ProductVariantId { get; set; }
		public int Quantity { get; set; }
		public decimal UnitPrice { get; set; }
		public decimal TotalPrice { get; set; }
		public string ProductName { get; set; }
		public string Size { get; set; }
		public string Color { get; set; }
		public int MerchantOrderId { get; set; }
		public MerchantOrder MerchantOrder { get; set; }
	}
}
