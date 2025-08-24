using Core.Utilities.Results;
using Yazilimxyz.BusinessLayer.DTOs.OrderItem;

namespace Yazilimxyz.BusinessLayer.Abstract
{
	public interface IOrderItemService
	{
		Task<IDataResult<List<ResultOrderItemDto>>> GetByOrderIdAsync(int orderId);
	}
}
