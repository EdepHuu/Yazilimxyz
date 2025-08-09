using Yazilimxyz.BusinessLayer.DTOs.Customer;

namespace Yazilimxyz.BusinessLayer.Abstract
{
	public interface ICustomerService
	{
		// SELF
		Task<ResultCustomerDto?> GetMyProfileAsync();

		// ADMIN
		Task<ResultCustomerDto?> GetByIdAsync(int id);
		Task<ResultCustomerDto?> GetByAppUserIdAsync(string appUserId);
		Task<ResultCustomerWithAddressesDto?> GetWithAddressesAsync(int id);
		Task AdminCreateAsync(AdminCreateCustomerDto dto);
		Task AdminSetActiveAsync(int id, bool isActive);

		// REGISTER akışı
		Task CreateForUserAsync(string appUserId);
	}
}
