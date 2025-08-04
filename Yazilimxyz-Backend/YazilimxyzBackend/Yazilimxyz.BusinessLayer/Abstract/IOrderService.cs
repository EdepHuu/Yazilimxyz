using Yazilimxyz.BusinessLayer.DTOs.Order;
using Yazilimxyz.EntityLayer.Enums;

namespace Yazilimxyz.BusinessLayer.Abstract
{
    public interface IOrderService
    {
        Task<ResultOrderDto?> GetByIdAsync(int id);
        Task<ResultOrderDto?> GetByOrderNumberAsync(string orderNumber);
        Task<ResultOrderWithItemsDto?> GetWithItemAsync(int id);

        Task<List<ResultOrderDto>> GetAllAsync();
        Task<List<ResultOrderDto>> GetByUserIdAsync(string userId);
        Task<List<ResultOrderDto>> GetByStatusAsync(OrderStatus status);
        Task<List<ResultOrderDto>> GetByPaymentStatusAsync(PaymentStatus status);

        Task CreateAsync(CreateOrderDto dto);
        Task UpdateAsync(UpdateOrderDto dto);
        Task DeleteAsync(int id);
    }
}
