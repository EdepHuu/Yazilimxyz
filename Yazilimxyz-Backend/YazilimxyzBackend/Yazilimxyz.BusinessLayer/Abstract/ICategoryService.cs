using Core.Utilities.Results;
using Yazilimxyz.BusinessLayer.DTOs.Category;

namespace Yazilimxyz.BusinessLayer.Abstract
{
    public interface ICategoryService
    {
        Task<IDataResult<List<ResultCategoryDto>>> GetAllAsync();
        Task<IDataResult<ResultCategoryDto>> GetByIdAsync(int id);
        Task<IDataResult<List<ResultCategoryDto>>> GetActiveAsync();
        Task<IDataResult<List<ResultCategoryDto>>> GetParentCategoriesAsync();
        Task<IDataResult<List<ResultCategoryDto>>> GetSubCategoriesAsync(int parentId);
        Task<IDataResult<ResultCategoryWithSubDto>> GetWithSubCategoriesAsync(int id);
        Task<IDataResult<List<ResultCategoryHierarchyDto>>> GetCategoryHierarchyAsync();

        Task<IResult> CreateAsync(CreateCategoryDto dto);
        Task<IResult> UpdateAsync(UpdateCategoryDto dto);
        Task<IResult> DeleteAsync(int id);
    }
}
