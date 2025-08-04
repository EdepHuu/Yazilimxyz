using Yazilimxyz.BusinessLayer.DTOs.CartItem;

namespace Yazilimxyz.BusinessLayer.Abstract
{
    public interface ICartItemService
    {
        Task<List<ResultCartItemDto>> GetByUserIdAsync(string userId);
        Task<ResultCartItemDto?> GetByUserAndVariantAsync(string userId, int variantId);
        Task AddAsync(CreateCartItemDto dto);
        Task UpdateAsync(UpdateCartItemDto dto);
        Task DeleteAsync(int id);
        Task ClearUserCartAsync(string userId);
        Task<int> GetCartItemCountAsync(string userId);
    }
}
