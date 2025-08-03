using Yazilimxyz.BusinessLayer.DTOs.AppUser;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Yazilimxyz.BusinessLayer.Abstract
{
    public interface IAppUserService
    {
        Task<ResultAppUserDto?> GetByIdAsync(string id);
        Task<ResultAppUserDto?> GetByEmailAsync(string email);
        //Task<ResultAppUserWithCustomerDto?> GetWithCustomerAsync(string id);
        //Task<ResultAppUserWithMerchantDto?> GetWithMerchantAsync(string id);
        Task<List<ResultAppUserDto>> GetAllAsync();
        Task<bool> ExistsAsync(string id);

        Task CreateAsync(CreateAppUserDto dto);
        Task UpdateAsync(UpdateAppUserDto dto);
        Task DeleteAsync(string id);
    }
}
