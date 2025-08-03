using Yazilimxyz.BusinessLayer.DTOs.Category;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Yazilimxyz.BusinessLayer.Abstract
{
    public interface ICategoryService
    {
        Task<List<ResultCategoryDto>> GetAllAsync();
        Task<ResultCategoryDto?> GetByIdAsync(int id);
        Task<List<ResultCategoryDto>> GetActiveAsync();
        Task<List<ResultCategoryDto>> GetParentCategoriesAsync();
        Task<List<ResultCategoryDto>> GetSubCategoriesAsync(int parentId);
        //Task<ResultCategoryWithSubDto?> GetWithSubCategoriesAsync(int id);
        //Task<List<ResultCategoryHierarchyDto>> GetCategoryHierarchyAsync();
        Task CreateAsync(CreateCategoryDto dto);
        Task UpdateAsync(UpdateCategoryDto dto);
        Task DeleteAsync(int id);
    }
}
