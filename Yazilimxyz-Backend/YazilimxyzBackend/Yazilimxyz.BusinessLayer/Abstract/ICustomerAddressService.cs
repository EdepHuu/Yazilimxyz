using Yazilimxyz.BusinessLayer.DTOs.CustomerAddress;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Yazilimxyz.BusinessLayer.Abstract
{
    public interface ICustomerAddressService
    {
        Task<List<ResultCustomerAddressDto>> GetByCustomerIdAsync(int customerId);
        Task<ResultCustomerAddressDto?> GetDefaultAddressAsync(int customerId);
        Task SetDefaultAddressAsync(int customerId, int addressId);
        Task<ResultCustomerAddressDto?> GetByIdAsync(int id);
        Task CreateAsync(CreateCustomerAddressDto dto);
        Task UpdateAsync(UpdateCustomerAddressDto dto);
        Task DeleteAsync(int id);
    }
}
