using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Yazilimxyz.EntityLayer.Entities;

namespace Yazilimxyz.DataAccessLayer.Abstract
{
    public interface IMerchantRepository : IGenericRepository<Merchant>
    {
        Task<Merchant?> GetByAppUserIdAsync(string appUserId);
        Task<IEnumerable<Merchant>> GetByCompanyName(string CompanyName);
        Task<IEnumerable<Product>> GetProductsByMerchantAsync(int merchantId);
    }
}
