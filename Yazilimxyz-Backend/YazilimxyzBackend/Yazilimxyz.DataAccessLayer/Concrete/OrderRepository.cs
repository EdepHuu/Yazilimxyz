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

		public async Task<Order?> GetByIdWithItemsAsync(int id)
		{
			return await _appDbContext.Orders
				.Include(o => o.OrderItems)
					.ThenInclude(oi => oi.ProductVariant)
						.ThenInclude(pv => pv.Product)
							.ThenInclude(p => p.Merchant)
				.Include(o => o.MerchantOrders)
				.FirstOrDefaultAsync(o => o.Id == id);
		}

		public async Task<List<Order>> GetOrdersByMerchantAppUserIdAsync(string merchantAppUserId)
		{
			return await _appDbContext.Orders
				.Include(o => o.OrderItems)
					.ThenInclude(oi => oi.ProductVariant)
						.ThenInclude(pv => pv.Product)
				.Include(o => o.MerchantOrders)
				.Where(o => o.MerchantOrders.Any(mo => mo.MerchantId == merchantAppUserId))
				.ToListAsync();
		}
	}
}
