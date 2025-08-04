using Yazilimxyz.BusinessLayer.DTOs.Merchant;
using Yazilimxyz.BusinessLayer.DTOs.Product;

namespace Yazilimxyz.BusinessLayer.Abstract
{
    public interface IMerchantService
    {
        Task<ResultMerchantDto?> GetByIdAsync(int id);
        Task<ResultMerchantDto?> GetByAppUserIdAsync(string appUserId);
        Task<List<ResultMerchantDto>> GetAllAsync();
        Task<List<ResultMerchantDto>> GetByCompanyNameAsync(string companyName);
        Task<List<ResultProductDto>> GetProductsByMerchantAsync(int merchantId);

        Task CreateAsync(CreateMerchantDto dto);
        Task UpdateAsync(UpdateMerchantDto dto);
        Task DeleteAsync(int id);
    }
}
