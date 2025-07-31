using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Yazilimxyz.BusinessLayer.DTOs.Merchant;

namespace Yazilimxyz.BusinessLayer.Abstract
{
    public interface IMerchantService
    {
        Task<List<ResultMerchantDto>> GetAllAsync();
        Task<ResultMerchantDto> GetByIdAsync(int id);
        Task CreateAsync(CreateMerchantDto dto);
        Task UpdateAsync(UpdateMerchantDto dto);
        Task DeleteAsync(int id);
    }

}
