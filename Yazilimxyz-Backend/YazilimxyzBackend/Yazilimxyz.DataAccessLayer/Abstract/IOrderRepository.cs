using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Yazilimxyz.EntityLayer.Entities;
using Yazilimxyz.EntityLayer.Enums;

namespace Yazilimxyz.DataAccessLayer.Abstract
{
    public interface IOrderRepository : IGenericRepository<Order>
    {
		Task<Order?> GetByIdWithItemsAsync(int orderId);
	}
}
