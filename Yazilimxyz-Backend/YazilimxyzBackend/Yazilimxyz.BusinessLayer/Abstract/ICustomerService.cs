using Core.Utilities.Results;
using Yazilimxyz.BusinessLayer.DTOs.Customer;

namespace Yazilimxyz.BusinessLayer.Abstract
{
	public interface ICustomerService
	{
        // SELF
        Task<IDataResult<ResultCustomerDto?>> GetMyProfileAsync();

        // ADMIN
        Task<IDataResult<ResultCustomerDto?>> GetByIdAsync(int id);
        Task<IDataResult<ResultCustomerDto?>> GetByAppUserIdAsync(string appUserId);
        Task<IDataResult<ResultCustomerWithAddressesDto?>> GetWithAddressesAsync(int id);
        Task<IResult> AdminCreateAsync(AdminCreateCustomerDto dto);
        Task<IResult> AdminSetActiveAsync(int id, bool isActive);

        // REGISTER akışı
        Task<IResult> CreateForUserAsync(string appUserId);
    }
}
