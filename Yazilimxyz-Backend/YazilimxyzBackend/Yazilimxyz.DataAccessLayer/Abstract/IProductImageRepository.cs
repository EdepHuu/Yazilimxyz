using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Yazilimxyz.EntityLayer.Entities;

namespace Yazilimxyz.DataAccessLayer.Abstract
{
    public interface IProductImageRepository : IGenericRepository<ProductImage>
    {
        Task<IEnumerable<ProductImage>> GetByProductIdAsync(int productId);
        Task<ProductImage?> GetMainImageAsync(int productId);
        Task ReorderImagesAsync(int productId, List<int> imageId);
		Task<Product?> GetProductWithMerchantAsync(int productId);
		Task ResetMainImageAsync(int productId);
		Task SwapImageOrderAsync(int imageId1, int imageId2);
	}
}
