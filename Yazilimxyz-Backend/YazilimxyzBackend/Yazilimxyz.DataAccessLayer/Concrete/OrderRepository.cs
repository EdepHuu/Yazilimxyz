using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Yazilimxyz.DataAccessLayer.Abstract;
using Yazilimxyz.DataAccessLayer.Context;
using Yazilimxyz.EntityLayer.Entities;
using Yazilimxyz.EntityLayer.Enums;

namespace Yazilimxyz.DataAccessLayer.Concrete
{
    public class OrderRepository : Repository<Order>, IOrderRepository
    {
        public OrderRepository(AppDbContext context) : base(context)
        {
        }

		public async Task<Order?> GetByIdWithItemsAsync(int orderId)
		{
			return await _appDbContext.Orders
				.Include(o => o.OrderItems)
					.ThenInclude(oi => oi.Product)
						.ThenInclude(p => p.ProductImages)
				.Include(o => o.OrderItems)
					.ThenInclude(oi => oi.ProductVariant)
				.Include(o => o.ShippingAddress)
				.FirstOrDefaultAsync(o => o.Id == orderId);
		}
	}
}
