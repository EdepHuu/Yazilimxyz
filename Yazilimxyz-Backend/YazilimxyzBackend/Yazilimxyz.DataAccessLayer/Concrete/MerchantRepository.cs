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
    public class MerchantRepository : Repository<Merchant>, IMerchantRepository
    {
        public MerchantRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<Merchant?> GetByAppUserIdAsync(string appUserId)
        {
            return await _dbSet.FirstOrDefaultAsync(m => m.AppUserId == appUserId);
        }

        public async Task<IEnumerable<Merchant>> GetByCompanyName(string companyName)
        {
            return await _dbSet
                .Where(m => m.CompanyName.Contains(companyName))
                .ToListAsync();
        }
        public async Task<IEnumerable<Product>> GetProductsByMerchantAsync(int merchantId)
        {
            return await _appDbContext.Products
                .Where(p => p.MerchantId == merchantId && p.IsActive)
                .Include(p => p.ProductImages)
                .Include(p => p.Category)
                .OrderBy(p => p.Name)
                .ToListAsync();
        }
    }
}
