using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Yazilimxyz.BusinessLayer.DTOs.ProductVariant;

namespace Yazilimxyz.BusinessLayer.Abstract
{
    public interface IProductVariantService
    {
        Task<List<ResultProductVariantDto>> GetAllAsync();
        Task<ResultProductVariantDto> GetByIdAsync(int id);
        Task CreateAsync(CreateProductVariantDto dto);
        Task UpdateAsync(UpdateProductVariantDto dto);
        Task DeleteAsync(int id);
    }
}
