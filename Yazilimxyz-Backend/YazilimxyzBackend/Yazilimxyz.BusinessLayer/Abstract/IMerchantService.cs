using Core.Utilities.Results;
using Yazilimxyz.BusinessLayer.DTOs.Merchant;
using Yazilimxyz.BusinessLayer.DTOs.Product;

namespace Yazilimxyz.BusinessLayer.Abstract
{
	public interface IMerchantService
	{
        // Self
        Task<IDataResult<ResultMerchantDto?>> GetMyProfileAsync();
        Task<IResult> UpdateMyProfileAsync(UpdateMyMerchantProfileDto dto);

        // Admin
        Task<IDataResult<ResultMerchantDto?>> GetByIdAsync(int id);
        Task<IDataResult<ResultMerchantDto?>> GetByAppUserIdAsync(string appUserId);
        Task<IDataResult<List<ResultMerchantDto>>> GetAllAsync();
        Task<IDataResult<List<ResultMerchantDto>>> GetByCompanyNameAsync(string companyName);
        Task<IDataResult<List<ResultProductDto>>> GetProductsByMerchantAsync(int merchantId);
        Task<IResult> AdminUpdateAsync(int id, UpdateMerchantDto dto);
        Task<IResult> AdminSetActiveAsync(int id, bool isActive);

        // Register/Orkestrasyon içi
        Task<IResult> CreateForUserAsync(CreateMerchantDto dto); // Auth ya da Admin çağırır; AppUserId burada DTO’dan okunur ama controller’dan değil
    }
}
