using Yazilimxyz.BusinessLayer.DTOs.ProductVariant;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Yazilimxyz.BusinessLayer.Abstract
{
    public interface IProductVariantService
    {
        Task<ResultProductVariantDto?> GetByIdAsync(int id);
        Task<List<ResultProductVariantDto>> GetAllAsync();
        Task<List<ResultProductVariantDto>> GetByProductIdAsync(int productId);
        Task<ResultProductVariantDto?> GetByProductAndOptionsAsync(int productId, string size, string color);
        Task<List<ResultProductVariantDto>> GetInStockAsync(int productId);
        Task<bool> IsInStockAsync(int variantId, int quantity);
        Task UpdateStockAsync(int variantId, int quantity);

        Task CreateAsync(CreateProductVariantDto dto);
        Task UpdateAsync(UpdateProductVariantDto dto);
        Task DeleteAsync(int id);
    }
}
