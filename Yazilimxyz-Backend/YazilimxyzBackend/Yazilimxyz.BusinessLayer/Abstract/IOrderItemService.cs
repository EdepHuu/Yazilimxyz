using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Yazilimxyz.BusinessLayer.DTOs.OrderItem;

namespace Yazilimxyz.BusinessLayer.Abstract
{
    public interface IOrderItemService
    {
        Task<List<ResultOrderItemDto>> GetAllAsync();
        Task<ResultOrderItemDto> GetByIdAsync(int id);
        Task CreateAsync(CreateOrderItemDto dto);
        Task UpdateAsync(UpdateOrderItemDto dto);
        Task DeleteAsync(int id);
    }
}
