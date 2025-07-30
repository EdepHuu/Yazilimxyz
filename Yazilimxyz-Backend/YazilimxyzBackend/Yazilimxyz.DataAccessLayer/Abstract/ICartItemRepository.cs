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
        Task<IEnumerable<CartItem>> GetByUserIdAsync(string userId);
        Task<CartItem?> GetByUserAndVariantAsync(string userId, int variantId);
        Task ClearUserCartAsync(string userId);
        Task<int> GetCartItemCountAsync(string userId);
    }
}
