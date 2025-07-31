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

        public async Task<Order?> GetByOrderNumberAsync(string orderNumber)
        {
            return await _dbSet
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                .FirstOrDefaultAsync(o => o.OrderNumber == orderNumber);
        }

        public async Task<IEnumerable<Order>> GetByPaymentStatusAsync(PaymentStatus status)
        {
            return await _dbSet
                .Where(o => o.PaymentStatus == status)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Order>> GetByStatusAsync(OrderStatus status)
        {
            return await _dbSet
                 .Where(o => o.Status == status)
                 .ToListAsync();
        }

        public async Task<IEnumerable<Order>> GetByUserIdAsync(string userId)
        {
            return await _dbSet
               .Include(o => o.OrderItems)
                   .ThenInclude(oi => oi.Product)
               .Where(o => o.UserId == userId)
               .OrderByDescending(o => o.CreatedAt)
               .ToListAsync();
        }


        public async Task<Order?> GetWithItemAsync(int id)
        {
            return await _dbSet
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                .Include(o => o.ShippingAddress)
                .FirstOrDefaultAsync(o => o.Id == id);
        }
    }
}
