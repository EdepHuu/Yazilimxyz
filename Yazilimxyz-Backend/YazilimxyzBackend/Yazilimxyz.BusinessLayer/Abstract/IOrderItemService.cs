using Core.Utilities.Results;
using Yazilimxyz.BusinessLayer.DTOs.OrderItem;

namespace Yazilimxyz.BusinessLayer.Abstract
{
    public interface IOrderItemService
    {
        Task<IDataResult<ResultOrderItemDto>> GetByIdAsync(int id);
        Task<IDataResult<List<ResultOrderItemDto>>> GetAllAsync();
        Task<IDataResult<List<ResultOrderItemDto>>> GetByOrderIdAsync(int orderId);
        Task<IDataResult<List<ResultOrderItemDto>>> GetByProductIdAsync(int productId);

        Task<IResult> CreateAsync(CreateOrderItemDto dto);
        Task<IResult> UpdateAsync(UpdateOrderItemDto dto);
        Task<IResult> DeleteAsync(int id);
    }
}
