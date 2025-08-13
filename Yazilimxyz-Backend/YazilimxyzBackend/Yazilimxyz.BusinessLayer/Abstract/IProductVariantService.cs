using Core.Utilities.Results;
using Yazilimxyz.BusinessLayer.DTOs.ProductVariant;

namespace Yazilimxyz.BusinessLayer.Abstract
{
    public interface IProductVariantService
    {
        Task<IDataResult<ResultProductVariantDto>> GetByIdAsync(int id);
        Task<IDataResult<List<ResultProductVariantDto>>> GetAllAsync();
        Task<IDataResult<List<ResultProductVariantDto>>> GetByProductIdAsync(int productId);
        Task<IDataResult<ResultProductVariantDto>> GetByProductAndOptionsAsync(int productId, string size, string color);
        Task<IDataResult<List<ResultProductVariantDto>>> GetInStockAsync(int productId);

        Task<IDataResult<bool>> IsInStockAsync(int variantId, int quantity);
        Task<IResult> UpdateStockAsync(int variantId, int quantity);

        Task<IResult> CreateAsync(CreateProductVariantDto dto);
        Task<IResult> UpdateAsync(UpdateProductVariantDto dto);
        Task<IResult> DeleteAsync(int id);
    }
}
