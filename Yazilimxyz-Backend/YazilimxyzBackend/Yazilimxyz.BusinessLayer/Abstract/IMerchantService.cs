using Yazilimxyz.BusinessLayer.DTOs.Merchant;
using Yazilimxyz.BusinessLayer.DTOs.Product;

namespace Yazilimxyz.BusinessLayer.Abstract
{
	public interface IMerchantService
	{
		// Self
		Task<ResultMerchantDto?> GetMyProfileAsync();
		Task UpdateMyProfileAsync(UpdateMyMerchantProfileDto dto); 
		// Admin
		Task<ResultMerchantDto?> GetByIdAsync(int id);
		Task<ResultMerchantDto?> GetByAppUserIdAsync(string appUserId);
		Task<List<ResultMerchantDto>> GetAllAsync();
		Task<List<ResultMerchantDto>> GetByCompanyNameAsync(string companyName);
		Task<List<ResultProductDto>> GetProductsByMerchantAsync(int merchantId);
		Task AdminUpdateAsync(int id, UpdateMerchantDto dto);
		Task AdminSetActiveAsync(int id, bool isActive);

		// Register/Orkestrasyon içi
		Task CreateForUserAsync(CreateMerchantDto dto); // Auth ya da Admin çağırır; AppUserId burada DTO’dan okunur ama controller’dan değil
	}
}
