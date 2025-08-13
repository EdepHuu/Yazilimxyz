using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Yazilimxyz.EntityLayer.Entities;
using Yazilimxyz.EntityLayer.Enums;

namespace Yazilimxyz.DataAccessLayer.Abstract
{
    public interface IProductRepository : IGenericRepository<Product>
    {
        Task<IEnumerable<Product>> GetActiveAsync();
        Task<IEnumerable<Product>> GetByCategoryIdAsync(int categoryId);
        Task<IEnumerable<Product>> GetByMerchantIdAsync(int merchantId);
        Task<IEnumerable<Product>> GetByGenderAsync(GenderType gender);
        Task<Product?> GetWithVariantsAsync(int id);
        Task<Product?> GetWithImagesAsync(int id);
        Task<Product?> GetDetailedAsync(int id);
        Task<IEnumerable<Product>> SearchAsync(string searchTerm);
		IQueryable<Product> Query(); // AsNoTracking temel sorgu (istersen)
	}
}
