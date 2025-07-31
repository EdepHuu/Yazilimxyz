using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Yazilimxyz.BusinessLayer.DTOs.Order;

namespace Yazilimxyz.BusinessLayer.Abstract
{
    public interface IOrderService
    {
        Task<List<ResultOrderDto>> GetAllAsync();
        Task<ResultOrderDto> GetByIdAsync(int id);
        Task CreateAsync(CreateOrderDto dto);
        Task UpdateAsync(UpdateOrderDto dto);
        Task DeleteAsync(int id);
    }

}
