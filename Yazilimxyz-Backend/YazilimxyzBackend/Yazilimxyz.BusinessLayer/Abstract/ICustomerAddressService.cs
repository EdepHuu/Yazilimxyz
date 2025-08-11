using Core.Utilities.Results;
using Yazilimxyz.BusinessLayer.DTOs.CustomerAddress;

namespace Yazilimxyz.BusinessLayer.Abstract
{
    public interface ICustomerAddressService
    {
        Task<IDataResult<List<ResultCustomerAddressDto>>> GetByCustomerIdAsync(int customerId);
        Task<IDataResult<ResultCustomerAddressDto?>> GetDefaultAddressAsync(int customerId);
        Task<IResult> SetDefaultAddressAsync(int customerId, int addressId);
        Task<IDataResult<ResultCustomerAddressDto?>> GetByIdAsync(int id);
        Task<IResult> CreateAsync(CreateCustomerAddressDto dto);
        Task<IResult> UpdateAsync(UpdateCustomerAddressDto dto);
        Task<IResult> DeleteAsync(int id);
    }
}
