using Yazilimxyz.BusinessLayer.DTOs.OrderItem;

namespace Yazilimxyz.BusinessLayer.Abstract
{
    public interface IOrderItemService
    {
        Task<ResultOrderItemDto?> GetByIdAsync(int id);
        Task<List<ResultOrderItemDto>> GetAllAsync();
        Task<List<ResultOrderItemDto>> GetByOrderIdAsync(int orderId);
        Task<List<ResultOrderItemDto>> GetByProductIdAsync(int productId);

        Task CreateAsync(CreateOrderItemDto dto);
        Task UpdateAsync(UpdateOrderItemDto dto);
        Task DeleteAsync(int id);
    }
}
