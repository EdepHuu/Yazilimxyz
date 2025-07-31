using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Yazilimxyz.EntityLayer.Entities;

namespace Yazilimxyz.DataAccessLayer.Abstract
{
    public interface IAppUserRepository
    {
        Task<AppUser?> GetByIdAsync(string id);
        Task<AppUser?> GetByEmailAsync(string email);
        Task<AppUser?> GetWithCustomerAsync(string id);
        Task<AppUser?> GetWithMerchantAsync(string id);
        Task<IEnumerable<AppUser>> GetAllAsync();
        Task<AppUser?> CreateAsync(AppUser user);
        Task<AppUser?> UpdateAsync(AppUser user);
        Task DeleteAsync(string id);
        Task<bool> ExistsAsync(string id);
    }
}
