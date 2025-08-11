using Core.Utilities.Results;
using Yazilimxyz.BusinessLayer.DTOs.CartItem;

namespace Yazilimxyz.BusinessLayer.Abstract
{
    public interface ICartItemService
    {
        Task<IDataResult<List<ResultCartItemDto>>> GetByUserIdAsync(string userId);
        Task<IDataResult<ResultCartItemDto?>> GetByUserAndVariantAsync(string userId, int variantId);

        Task<IResult> AddAsync(CreateCartItemDto dto);
        Task<IResult> UpdateAsync(UpdateCartItemDto dto);
        Task<IResult> DeleteAsync(int id);
        Task<IResult> ClearUserCartAsync(string userId);

        Task<IDataResult<int>> GetCartItemCountAsync(string userId);
    }
}
