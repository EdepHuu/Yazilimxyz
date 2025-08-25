using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Yazilimxyz.EntityLayer.Enums;

namespace Yazilimxyz.EntityLayer.Entities
{
	public class MerchantOrder : BaseEntity
	{
		public int OrderId { get; set; }
		public Order Order { get; set; }
		public string MerchantId { get; set; }
		public AppUser Merchant { get; set; }
		public bool IsConfirmedByMerchant { get; set; }
		public DateTime? ConfirmedAt { get; set; }
		public ICollection<MerchantOrderItem> MerchantOrderItems { get; set; }
		public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
	}
}
