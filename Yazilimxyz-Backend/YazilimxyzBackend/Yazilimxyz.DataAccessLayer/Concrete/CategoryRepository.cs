using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Yazilimxyz.DataAccessLayer.Abstract;
using Yazilimxyz.DataAccessLayer.Context;
using Yazilimxyz.EntityLayer.Entities;

namespace Yazilimxyz.DataAccessLayer.Concrete
{
    public class CategoryRepository : Repository<Category>, ICategoryRepository
    {
        public CategoryRepository(AppDbContext context) : base(context)
        {
             
        }

        public async Task<IEnumerable<Category>> GetActiveAsync()
        {
            return await _dbSet.Where(c => c.IsActive).OrderBy(c => c.SortOrder).ToListAsync();
        }

        public async Task<IEnumerable<Category>> GetCategoryHierarchyAsync()
        {
            return await _dbSet
                .Include(c => c.SubCategories.Where(sc => sc.IsActive))
                .Where(c => c.ParentCategoryId == null && c.IsActive)
                .OrderBy(c => c.SortOrder)
                .ToListAsync();
        }

        public async Task<IEnumerable<Category>> GetParentCategoriesAsync()
        {
            return await _dbSet
                 .Where(c => c.ParentCategoryId == null && c.IsActive)
                 .OrderBy(c => c.SortOrder)
                 .ToListAsync();
        }

        public async Task<IEnumerable<Category>> GetSubCategoriesAsync(int parentId)
        {
            return await _dbSet
                .Where(c => c.ParentCategoryId == parentId && c.IsActive)
                .OrderBy(c => c.SortOrder)
                .ToListAsync();
        }

        public async Task<Category?> GetWithSubCategoriesAsync(int id)
        {
            return await _dbSet
                .Include(c => c.SubCategories.Where(sc => sc.IsActive))
                .FirstOrDefaultAsync(c => c.Id == id);
        }
    }
}
