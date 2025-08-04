using Yazilimxyz.BusinessLayer.DTOs.Customer;

namespace Yazilimxyz.BusinessLayer.Abstract
{
    public interface ICustomerService
    {
        Task<ResultCustomerDto?> GetByIdAsync(int id);
        Task<ResultCustomerDto?> GetByAppUserIdAsync(string appUserId);
        Task<ResultCustomerWithAddressesDto?> GetWithAddressesAsync(int id);
        Task CreateAsync(CreateCustomerDto dto);
        Task UpdateAsync(UpdateCustomerDto dto);
        Task DeleteAsync(int id);
    }
}
