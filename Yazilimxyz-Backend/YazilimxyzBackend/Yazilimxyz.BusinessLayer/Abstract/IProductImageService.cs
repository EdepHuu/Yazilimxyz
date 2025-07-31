using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Yazilimxyz.BusinessLayer.DTOs.ProductImage;

namespace Yazilimxyz.BusinessLayer.Abstract
{
    public interface IProductImageService
    {
        Task<List<ResultProductImageDto>> GetAllAsync();
        Task<ResultProductImageDto> GetByIdAsync(int id);
        Task CreateAsync(CreateProductImageDto dto);
        Task DeleteAsync(int id);
    }
}
