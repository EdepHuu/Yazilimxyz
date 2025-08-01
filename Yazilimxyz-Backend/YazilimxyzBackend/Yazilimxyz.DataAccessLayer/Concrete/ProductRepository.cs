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
    public class ProductRepository : Repository<Product>, IProductRepository
    {
        public ProductRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Product>> GetActiveAsync()
        {
            return await _dbSet
                .Include(p => p.ProductImages)
                .Include(p => p.Category)
                .Where(p => p.IsActive)
                .ToListAsync();
        }

        public async Task<IEnumerable<Product>> GetByCategoryIdAsync(int categoryId)
        {
            return await _dbSet
                .Include(p => p.ProductImages)
                .Where(p => p.CategoryId == categoryId && p.IsActive)
                .ToListAsync();
        }

        public async Task<IEnumerable<Product>> GetByGenderAsync(GenderType gender)
        {
            return await _dbSet
                .Include(p => p.ProductImages)
                .Where(p => p.Gender == gender && p.IsActive)
                .ToListAsync();
        }

        public async Task<IEnumerable<Product>> GetByMerchantIdAsync(int merchantId)
        {
            return await _dbSet
                .Include(p => p.ProductImages)
                .Include(p => p.Category)
                .Where(p => p.MerchantId == merchantId)
                .ToListAsync();
        }

        public async Task<Product?> GetDetailedAsync(int id)
        {
            return await _dbSet
                .Include(p => p.ProductVariants)
                .Include(p => p.ProductImages.OrderBy(pi => pi.SortOrder))
                .Include(p => p.Category)
                .Include(p => p.Merchant)
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<Product?> GetWithImagesAsync(int id)
        {
            return await _dbSet
                .Include(p => p.ProductImages.OrderBy(pi => pi.SortOrder))
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<Product?> GetWithVariantsAsync(int id)
        {
            return await _dbSet
                .Include(p => p.ProductVariants)
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<IEnumerable<Product>> SearchAsync(string searchTerm)
        {
            return await _dbSet
                .Include(p => p.ProductImages)
                .Include(p => p.Category)
                .Where(p => p.IsActive &&
                           (p.Name.Contains(searchTerm) ||
                            p.Description.Contains(searchTerm) ||
                            p.ProductCode.Contains(searchTerm)))
                .ToListAsync();
        }
    }
}
