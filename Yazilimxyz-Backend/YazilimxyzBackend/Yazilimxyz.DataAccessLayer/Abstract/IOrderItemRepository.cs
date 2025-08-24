using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Yazilimxyz.EntityLayer.Entities;

namespace Yazilimxyz.DataAccessLayer.Abstract
{
	public interface IOrderItemRepository : IGenericRepository<OrderItem>
	{
		Task<List<OrderItem>> GetByOrderIdAsync(int orderId);
	}
}
