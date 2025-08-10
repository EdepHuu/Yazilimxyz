using System.Linq.Expressions;
using Yazilimxyz.EntityLayer.Entities;

namespace Yazilimxyz.DataAccessLayer.Abstract
{
    public interface ICategoryRepository : IGenericRepository<Category>
    {
        Task<IEnumerable<Category>> GetActiveAsync();
        Task<IEnumerable<Category>> GetParentCategoriesAsync();
        Task<IEnumerable<Category>> GetSubCategoriesAsync(int parentId);
        Task<Category?> GetWithSubCategoriesAsync(int id);
        Task<IEnumerable<Category>> GetCategoryHierarchyAsync();
        Task<bool> AnyAsync(Expression<Func<Category, bool>> predicate);
        Task<int> CountAsync();
    }
}
