using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Yazilimxyz.EntityLayer.Entities;

namespace Yazilimxyz.DataAccessLayer.Abstract
{
    public interface IProductVariantRepository : IGenericRepository<ProductVariant>
    {
        Task<IEnumerable<ProductVariant>> GetByProductIdAsync(int productId);
        Task<ProductVariant?> GetByProductAndOptionsAsync(int productId, string size, string color);
        Task<IEnumerable<ProductVariant>> GetInStockAsync(int productId);
        Task<bool> IsInStockAsync(int variantId, int quantity);
        Task UpdateStockAsync(int variantId, int quantity);
    }
}
