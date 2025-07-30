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
    public class CartItemRepository : Repository<CartItem>, ICartItemRepository
    {
        public CartItemRepository(AppDbContext context) : base(context)
        {

        }

        public async Task ClearUserCartAsync(string userId)
        {
            var cartItems = await _dbSet.Where(c => c.UserId == userId).ToListAsync();
            _dbSet.RemoveRange(cartItems);
            await _appDbContext.SaveChangesAsync();
        }

        public async Task<CartItem?> GetByUserAndVariantAsync(string userId, int variantId)
        {
            return await _dbSet
                .FirstOrDefaultAsync(c => c.UserId == userId && c.ProductVariantId == variantId);
        }

        public async Task<IEnumerable<CartItem>> GetByUserIdAsync(string userId)
        {
            return await _dbSet
                .Include(c => c.Variant)
                    .ThenInclude(v => v.Product)
                        .ThenInclude(p => p.ProductImages)
                .Where(c => c.UserId == userId)
                .ToListAsync();

        }

        public Task<int> GetCartItemCountAsync(string userId)
        {
            throw new NotImplementedException();
        }
    }
}
