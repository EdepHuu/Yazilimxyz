using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;
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

        public async Task<bool> AnyAsync(Expression<Func<Category, bool>> predicate)
        {
            return await _dbSet.AnyAsync(predicate);
        }

        public async Task<int> CountAsync()
        {
            return await _dbSet.CountAsync();
        }

		public async Task<IEnumerable<Category>> GetAllWithRelationsAsync()
		{
			return await _dbSet
				.Include(c => c.Products)
				.Include(c => c.SubCategories.Where(sc => sc.IsActive))
				.ToListAsync();
		}

		public async Task<Category?> GetByIdWithRelationsAsync(int id)
		{
			return await _dbSet
				.Include(c => c.Products)
				.Include(c => c.SubCategories.Where(sc => sc.IsActive))
				.FirstOrDefaultAsync(c => c.Id == id);
		}

		public async Task<IEnumerable<Category>> GetActiveAsync()
		{
			return await _dbSet
				.Where(c => c.IsActive)
				.Include(c => c.Products)
				.Include(c => c.SubCategories.Where(sc => sc.IsActive))
				.OrderBy(c => c.SortOrder)
				.ToListAsync();
		}

		public async Task<IEnumerable<Category>> GetParentCategoriesAsync()
		{
			return await _dbSet
				.Where(c => c.ParentCategoryId == null && c.IsActive)
				.Include(c => c.Products)
				.Include(c => c.SubCategories.Where(sc => sc.IsActive))
				.OrderBy(c => c.SortOrder)
				.ToListAsync();
		}

		public async Task<IEnumerable<Category>> GetSubCategoriesAsync(int parentId)
		{
			return await _dbSet
				.Where(c => c.ParentCategoryId == parentId && c.IsActive)
				.Include(c => c.Products)
				.Include(c => c.SubCategories.Where(sc => sc.IsActive))
				.OrderBy(c => c.SortOrder)
				.ToListAsync();
		}

		public async Task<Category?> GetWithSubCategoriesAsync(int id)
		{
			return await _dbSet
				.Include(c => c.Products)
				.Include(c => c.SubCategories.Where(sc => sc.IsActive))
				.FirstOrDefaultAsync(c => c.Id == id);
		}

		public async Task<IEnumerable<Category>> GetCategoryHierarchyAsync()
		{
			return await _dbSet
				.Where(c => c.ParentCategoryId == null && c.IsActive)
				.Include(c => c.Products)
				.Include(c => c.SubCategories.Where(sc => sc.IsActive))
				.OrderBy(c => c.SortOrder)
				.ToListAsync();
		}

        public async Task<List<Category>> GetAllAsync() // <-- İSMİ BURADA BÖYLE OLSUN
        {
            return await _dbSet
                .AsNoTracking()
                .ToListAsync();
        }

    }
}
