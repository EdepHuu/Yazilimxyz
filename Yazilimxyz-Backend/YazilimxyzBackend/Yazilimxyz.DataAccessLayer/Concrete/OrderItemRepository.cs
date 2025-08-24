using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Yazilimxyz.DataAccessLayer.Abstract;
using Yazilimxyz.DataAccessLayer.Context;
using Yazilimxyz.EntityLayer.Entities;

namespace Yazilimxyz.DataAccessLayer.Concrete
{
    public class OrderItemRepository : Repository<OrderItem>, IOrderItemRepository
    {
		public OrderItemRepository(AppDbContext context) : base(context) { }

		public async Task<List<OrderItem>> GetByOrderIdAsync(int orderId)
		{
			return await _appDbContext.OrderItems
				.Where(x => x.OrderId == orderId)
				.Include(x => x.Product)
					.ThenInclude(p => p.ProductImages)
				.Include(x => x.ProductVariant)
				.ToListAsync();
		}
	}
}
