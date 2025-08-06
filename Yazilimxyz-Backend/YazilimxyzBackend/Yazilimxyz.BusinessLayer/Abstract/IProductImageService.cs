using Yazilimxyz.BusinessLayer.DTOs.ProductImage;

namespace Yazilimxyz.BusinessLayer.Abstract
{
    public interface IProductImageService
    {
		Task<GetByIdProductImageDto?> GetByIdAsync(int id);
		Task<List<ResultProductImageDto>> GetAllAsync();
        Task<List<ResultProductImageDto>> GetByProductIdAsync(int productId);
        Task<ResultProductImageDto?> GetMainImageAsync(int productId);
        Task ReorderImagesAsync(int productId, List<int> imageIds);
		Task SetMainImageAsync(int imageId);
		Task CreateAsync(CreateProductImageDto dto);
        Task UpdateAsync(UpdateProductImageDto dto);
        Task DeleteAsync(int id);
    }
}
