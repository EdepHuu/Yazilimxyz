using Yazilimxyz.BusinessLayer.DTOs.AppUser;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Yazilimxyz.BusinessLayer.Abstract
{
    public interface IAppUserService
    {
        Task<List<ResultAppUserDto>> GetAllAsync();
        Task<ResultAppUserDto?> GetByIdAsync(string id);
        Task<ResultAppUserDto?> GetByEmailAsync(string email);
        //Task<ResultAppUserWithCustomerDto?> GetWithCustomerAsync(string id);
        //Task<ResultAppUserWithMerchantDto?> GetWithMerchantAsync(string id);
        Task<ResultAppUserDto?> CreateAsync(CreateAppUserDto dto);
        Task<ResultAppUserDto?> UpdateAsync(UpdateAppUserDto dto);
        Task DeleteAsync(string id);
        Task<bool> ExistsAsync(string id);
    }
}
