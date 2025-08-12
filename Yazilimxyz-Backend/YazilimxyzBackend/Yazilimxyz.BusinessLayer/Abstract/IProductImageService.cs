using Core.Utilities.Results;
using Yazilimxyz.BusinessLayer.DTOs.ProductImage;
using Yazilimxyz.EntityLayer.Entities;

namespace Yazilimxyz.BusinessLayer.Abstract
{
	public interface IProductImageService
	{
        Task<IDataResult<GetByIdProductImageDto>> GetByIdAsync(int id);
        Task<IDataResult<List<ResultProductImageDto>>> GetAllAsync();
        Task<IDataResult<List<ResultProductImageDto>>> GetByProductIdAsync(int productId);
        Task<IDataResult<ResultProductImageDto>> GetMainImageAsync(int productId);

        Task<IResult> CreateAsync(CreateProductImageDto dto);
        Task<IResult> UpdateAsync(UpdateProductImageDto dto);
        Task<IResult> DeleteAsync(int id);
        Task<IResult> ReorderImagesAsync(int productId, List<int> imageIds);
        Task<IResult> SetMainImageAsync(int imageId);
    }
}
