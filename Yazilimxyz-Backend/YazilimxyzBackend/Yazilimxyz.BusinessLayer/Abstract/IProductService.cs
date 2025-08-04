using Yazilimxyz.BusinessLayer.DTOs.Product;
using Yazilimxyz.EntityLayer.Enums;

namespace Yazilimxyz.BusinessLayer.Abstract
{
    public interface IProductService
    {
        Task<ResultProductDto?> GetByIdAsync(int id);
        Task<List<ResultProductDto>> GetAllAsync();
        Task<List<ResultProductDto>> GetActiveAsync();
        Task<List<ResultProductDto>> GetByCategoryIdAsync(int categoryId);
        Task<List<ResultProductDto>> GetByMerchantIdAsync(int merchantId);
        Task<List<ResultProductDto>> GetByGenderAsync(GenderType gender);
        Task<ResultProductWithVariantsDto?> GetWithVariantsAsync(int id);
        Task<ResultProductWithImagesDto?> GetWithImagesAsync(int id);
        Task<ResultProductDetailedDto?> GetDetailedAsync(int id);
        Task<List<ResultProductDto>> SearchAsync(string searchTerm);

        Task CreateAsync(CreateProductDto dto);
        Task UpdateAsync(UpdateProductDto dto);
        Task DeleteAsync(int id);
    }
}
