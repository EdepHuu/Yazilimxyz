using Core.Utilities.Results;
using Yazilimxyz.BusinessLayer.DTOs.Order;
using Yazilimxyz.EntityLayer.Enums;

namespace Yazilimxyz.BusinessLayer.Abstract
{
	public interface IOrderService
	{
		Task<IDataResult<ResultOrderWithItemsDto>> CreateFromCartAsync(CreateOrderDto dto, string userId);
		Task<IDataResult<List<ResultOrderDto>>> GetMyOrdersAsync(string userId);
		Task<IDataResult<ResultOrderWithItemsDto>> GetMyOrderDetailAsync(int orderId, string userId);
		Task<IResult> UpdateAsync(int orderId, UpdateOrderDto dto);
		Task<IResult> CancelMyOrderAsync(int orderId, string userId);
		Task<IResult> ConfirmOrderAsync(int orderId, string userId);
		Task<IResult> AdvanceOrderStatusAsync(int orderId, string userId);
	}
}
