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

		public async Task DeleteRangeAsync(IEnumerable<CartItem> items)
		{
			_appDbContext.CartItems.RemoveRange(items);
			await _appDbContext.SaveChangesAsync();
		}

		public async Task<List<CartItem>> GetUserCartWithDetailsAsync(string userId)
		{
			return await _appDbContext.CartItems
				.Where(ci => ci.UserId == userId)
				.Include(ci => ci.Variant)
					.ThenInclude(v => v.Product)
						.ThenInclude(p => p.Merchant)
				.ToListAsync();
		}
	}
}
