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
    public class ProductVariantRepository : Repository<ProductVariant>, IProductVariantRepository
    {
        public ProductVariantRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<ProductVariant?> GetByProductAndOptionsAsync(int productId, string size, string color)
        {
            return await _appDbContext.Set<ProductVariant>()
                .Include(pv => pv.Product)
                .FirstOrDefaultAsync(pv =>
                    pv.ProductId == productId &&
                    pv.Size == size &&
                    pv.Color == color);
        }

        public async Task<IEnumerable<ProductVariant>> GetByProductIdAsync(int productId)
        {
            return await _appDbContext.Set<ProductVariant>()
                .Where(pv => pv.ProductId == productId)
                .Include(pv => pv.Product) // Product bilgileri de dahil
                .OrderBy(pv => pv.Size)
                .ThenBy(pv => pv.Color)
                .ToListAsync();
        }

        public async Task<IEnumerable<ProductVariant>> GetInStockAsync(int productId)
        {
            return await _appDbContext.Set<ProductVariant>()
                .Where(pv => pv.ProductId == productId && pv.Stock > 0)
                .Include(pv => pv.Product)
                .OrderBy(pv => pv.Size)
                .ThenBy(pv => pv.Color)
                .ToListAsync();
        }

        public async Task<bool> IsInStockAsync(int variantId, int quantity)
        {
            var variant = await _appDbContext.Set<ProductVariant>()
                 .FirstOrDefaultAsync(pv => pv.Id == variantId);

            if (variant == null)
                return false;

            return variant.Stock >= quantity;
        }

        public async Task UpdateStockAsync(int variantId, int quantity)
        {
            var variant = await _appDbContext.Set<ProductVariant>()
                .FirstOrDefaultAsync(pv => pv.Id == variantId);

            if (variant == null)
                throw new InvalidOperationException($"Product variant with ID {variantId} not found.");

            // Stok güncelleme - quantity pozitif ise stok artırır, negatif ise azaltır
            variant.Stock += quantity;

            // Stok negatif olamaz kontrolü
            if (variant.Stock < 0)
            {
                throw new InvalidOperationException(
                    $"Insufficient stock. Available: {variant.Stock - quantity}, Requested: {Math.Abs(quantity)}");
            }

            _appDbContext.Set<ProductVariant>().Update(variant);
            await _appDbContext.SaveChangesAsync();
        }
    }
}
