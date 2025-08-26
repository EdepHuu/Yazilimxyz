using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Yazilimxyz.EntityLayer.Entities;

namespace Yazilimxyz.DataAccessLayer.Abstract
{
	public interface ICartItemRepository : IGenericRepository<CartItem>
	{
        Task<List<CartItem>> GetUserCartWithDetailsAsync(string userId);
        Task DeleteRangeAsync(IEnumerable<CartItem> items);


    }
}
