using Core.Utilities.Results;
using Yazilimxyz.BusinessLayer.DTOs.Order;
using Yazilimxyz.EntityLayer.Enums;

namespace Yazilimxyz.BusinessLayer.Abstract
{
    public interface IOrderService
    {
        Task<IDataResult<ResultOrderDto>> GetByIdAsync(int id);
        Task<IDataResult<ResultOrderDto>> GetByOrderNumberAsync(string orderNumber);
        Task<IDataResult<ResultOrderWithItemsDto>> GetWithItemAsync(int id);

        Task<IDataResult<List<ResultOrderDto>>> GetAllAsync();
        Task<IDataResult<List<ResultOrderDto>>> GetByUserIdAsync(string userId);
        Task<IDataResult<List<ResultOrderDto>>> GetByStatusAsync(OrderStatus status);
        Task<IDataResult<List<ResultOrderDto>>> GetByPaymentStatusAsync(PaymentStatus status);

        Task<IResult> CreateAsync(CreateOrderDto dto);
        Task<IResult> UpdateAsync(UpdateOrderDto dto);
        Task<IResult> DeleteAsync(int id);
    }
}
