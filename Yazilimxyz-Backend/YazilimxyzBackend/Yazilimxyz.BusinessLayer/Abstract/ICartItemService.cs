using Core.Utilities.Results;
using Yazilimxyz.BusinessLayer.DTOs.CartItem;

namespace Yazilimxyz.BusinessLayer.Abstract
{
	public interface ICartItemService
	{
		Task<IDataResult<List<ResultCartItemDto>>> GetByUserIdAsync(string userId);
		Task<IResult> AddOrUpdateAsync(CreateCartItemDto dto, string userId);
		Task<IResult> UpdateQuantityAsync(int cartItemId, int quantity, string userId);
		Task<IResult> RemoveAsync(int cartItemId, string userId);
		Task<IResult> ClearCartAsync(string userId);
	}
}
