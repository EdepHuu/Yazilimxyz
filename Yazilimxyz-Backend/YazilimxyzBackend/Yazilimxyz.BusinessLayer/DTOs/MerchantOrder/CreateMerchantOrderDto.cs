using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Yazilimxyz.BusinessLayer.DTOs.MerchantOrder
{
	public class CreateMerchantOrderDto
	{
		public string MerchantId { get; set; }
		public List<Yazilimxyz.EntityLayer.Entities.CartItem> CartItems { get; set; }
	}
}
