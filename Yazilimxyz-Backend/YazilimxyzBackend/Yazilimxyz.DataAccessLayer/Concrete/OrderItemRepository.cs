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
        public OrderItemRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<OrderItem>> GetByOrderIdAsync(int orderId) // belirli bir siparişe ait tüm sipariş öğelerini(özelliklerini) getirir.
        {
            return await _dbSet
                .Include(oi => oi.Product)
                .Include(oi => oi.ProductVariant)
                .Where(oi => oi.OrderId == orderId)
                .ToListAsync();
        }

        public async Task<IEnumerable<OrderItem>> GetByProductIdAsync(int productId) // belirli bir ürüne ait tüm siparişleri getirir.
        {
            return await _dbSet
                .Include(oi => oi.Order)
                .Where(oi => oi.ProductId == productId)
                .ToListAsync();
        }
    }
}
