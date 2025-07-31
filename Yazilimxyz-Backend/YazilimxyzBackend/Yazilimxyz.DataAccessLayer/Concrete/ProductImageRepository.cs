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
    public class ProductImageRepository : Repository<ProductImage>, IProductImageRepository
    {
        public ProductImageRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<ProductImage>> GetByProductIdAsync(int productId)
        {
            return await _dbSet
                .Where(pi => pi.ProductId == productId)
                .OrderBy(pi => pi.SortOrder)
                .ToListAsync();
        }

        public async Task<ProductImage?> GetMainImageAsync(int productId)
        {
            return await _dbSet
                .Where(pi => pi.ProductId == productId)
                .OrderBy(pi => pi.SortOrder)
                .FirstOrDefaultAsync();
        }

        public async Task ReorderImagesAsync(int productId, List<int> imageIds)
        {
            using var transaction = await _appDbContext.Database.BeginTransactionAsync();
            try
            {
                var images = await _dbSet.Where(pi => pi.ProductId == productId).ToListAsync();

                for (int i = 0; i < imageIds.Count; i++)
                {
                    var image = images.FirstOrDefault(img => img.Id == imageIds[i]);
                    if (image != null) image.SortOrder = i + 1;
                }

                await _appDbContext.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
    }
}
