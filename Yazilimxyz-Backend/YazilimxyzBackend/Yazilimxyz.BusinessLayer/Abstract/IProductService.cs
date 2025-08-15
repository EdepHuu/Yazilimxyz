using Core.Utilities.Results;
using Yazilimxyz.BusinessLayer.DTOs.Customer;
using Yazilimxyz.BusinessLayer.DTOs.Merchant;
using Yazilimxyz.BusinessLayer.DTOs.Product;
using Yazilimxyz.EntityLayer.Enums;

namespace Yazilimxyz.BusinessLayer.Abstract
{
    public interface IProductService
    {
        Task<IDataResult<GetByIdProductDto>> GetByIdAsync(int id);
        Task<IDataResult<List<ResultProductDto>>> GetAllAsync();
        Task<IDataResult<List<ResultProductDto>>> GetActiveAsync();
        Task<IDataResult<List<ResultProductDto>>> GetByCategoryIdAsync(int categoryId);
        Task<IDataResult<List<ResultProductWithMerchantDto>>> GetByMerchantIdAsync(int merchantId);
        Task<IDataResult<List<ResultProductDto>>> GetByGenderAsync(GenderType gender);
        Task<IDataResult<ResultProductWithVariantsDto>> GetWithVariantsAsync(int id);
        Task<IDataResult<ResultProductWithImagesDto>> GetWithImagesAsync(int id);
        Task<IDataResult<ResultProductDetailedDto>> GetDetailedAsync(int id);
        Task<IDataResult<List<ResultProductDto>>> SearchAsync(string searchTerm);
        Task<IDataResult<PagedResult<ProductListItemDto>>> FilterAsync(ProductFilterRequestDto req);
		Task<IDataResult<PagedResult<MerchantProductListItemDto>>> GetMyProductsAsync(MerchantProductListQueryDto q);
		Task<IDataResult<MerchantProductDetailDto>> GetMyProductDetailAsync(int productId);
		Task<IDataResult<CustomerProductDetailDto>> GetPublicProductDetailAsync(int productId);
		Task<IResult> CreateAsync(CreateProductDto dto);
        Task<IResult> UpdateAsync(UpdateProductDto dto);
        Task<IResult> DeleteAsync(int id);
    }
}
