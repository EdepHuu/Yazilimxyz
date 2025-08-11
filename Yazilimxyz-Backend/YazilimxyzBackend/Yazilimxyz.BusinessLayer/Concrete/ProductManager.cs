using AutoMapper;
using Core.Aspects.Autofac.Caching;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Yazilimxyz.BusinessLayer.Abstract;
using Yazilimxyz.BusinessLayer.DTOs.Merchant;
using Yazilimxyz.BusinessLayer.DTOs.Product;
using Yazilimxyz.DataAccessLayer.Abstract;
using Yazilimxyz.DataAccessLayer.Concrete;
using Yazilimxyz.EntityLayer.Entities;
using Yazilimxyz.EntityLayer.Enums;

namespace Yazilimxyz.BusinessLayer.Concrete
{
    public class ProductManager : IProductService
    {
        private readonly IProductRepository _productRepository;
        private readonly IMapper _mapper;
		private readonly IMerchantRepository _merchantRepository;
		private readonly IHttpContextAccessor _httpContextAccessor;
		private readonly ICategoryRepository _categoryRepository;

		public ProductManager(IProductRepository productRepository, IMapper mapper, IMerchantRepository merchantRepository, IHttpContextAccessor httpContextAccessor , ICategoryRepository categoryRepository)
        {
            _productRepository = productRepository;
            _mapper = mapper;
			_merchantRepository = merchantRepository;
			_httpContextAccessor = httpContextAccessor;
			_categoryRepository = categoryRepository;
		}

        public async Task<GetByIdProductDto?> GetByIdAsync(int id)
        {
            var product = await _productRepository.GetByIdAsync(id);
            return _mapper.Map<GetByIdProductDto>(product);
        }

        [CacheAspect] // key, value
        public async Task<List<ResultProductDto>> GetAllAsync()
        {
            var products = await _productRepository.GetAllAsync();
            return _mapper.Map<List<ResultProductDto>>(products);
        }

        public async Task<List<ResultProductDto>> GetActiveAsync()
        {
            var products = await _productRepository.GetActiveAsync();
            return _mapper.Map<List<ResultProductDto>>(products);
        }

        public async Task<List<ResultProductDto>> GetByCategoryIdAsync(int categoryId)
        {
            var products = await _productRepository.GetByCategoryIdAsync(categoryId);
            return _mapper.Map<List<ResultProductDto>>(products);
        }

        public async Task<List<ResultProductWithMerchantDto>> GetByMerchantIdAsync(int merchantId)
        {
            var products = await _productRepository.GetByMerchantIdAsync(merchantId);
            return _mapper.Map<List<ResultProductWithMerchantDto>>(products);
        }

        public async Task<List<ResultProductDto>> GetByGenderAsync(GenderType gender)
        {
            var products = await _productRepository.GetByGenderAsync(gender);
            return _mapper.Map<List<ResultProductDto>>(products);
        }

        public async Task<ResultProductWithVariantsDto?> GetWithVariantsAsync(int id)
        {
            var product = await _productRepository.GetWithVariantsAsync(id);
            return _mapper.Map<ResultProductWithVariantsDto>(product);
        }

        public async Task<ResultProductWithImagesDto?> GetWithImagesAsync(int id)
        {
            var product = await _productRepository.GetWithImagesAsync(id);
            return _mapper.Map<ResultProductWithImagesDto>(product);
        }

        public async Task<ResultProductDetailedDto?> GetDetailedAsync(int id)
        {
            var product = await _productRepository.GetDetailedAsync(id);
            return _mapper.Map<ResultProductDetailedDto>(product);
        }

        public async Task<List<ResultProductDto>> SearchAsync(string searchTerm)
        {
            var products = await _productRepository.SearchAsync(searchTerm);
            return _mapper.Map<List<ResultProductDto>>(products);
        }


        [CacheRemoveAspect("IProductService.Get")]
        public async Task CreateAsync(CreateProductDto dto)
		{
			var userId = _httpContextAccessor.HttpContext?.User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;
			if (string.IsNullOrEmpty(userId))
			{
				throw new Exception("Kullanıcı oturumu bulunamadı.");
			}

			var merchant = await _merchantRepository.GetByAppUserIdAsync(userId);
			if (merchant == null)
			{
				throw new Exception("Merchant bulunamadı.");
			}

			if (!Enum.IsDefined(typeof(GenderType), dto.Gender))
			{
				throw new Exception("Geçersiz cinsiyet türü.");
			}

			var category = await _categoryRepository.GetByIdAsync(dto.CategoryId);
			if (category == null)
			{
				throw new Exception("Belirtilen kategori bulunamadı.");
			}

			if (dto.BasePrice <= 0)
			{
				throw new Exception("Ürün fiyatı sıfırdan büyük olmalıdır.");
			}

			var product = _mapper.Map<Product>(dto);
			product.AppUserId = merchant.AppUserId;
			product.MerchantId = merchant.Id;
			product.CreatedAt = DateTime.UtcNow;

			await _productRepository.AddAsync(product);
		}


        [CacheRemoveAspect("IProductService.Get")]
        public async Task UpdateAsync(UpdateProductDto dto)
		{
			var userId = _httpContextAccessor.HttpContext?.User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;
			if (string.IsNullOrEmpty(userId))
			{
				throw new Exception("Kullanıcı oturumu bulunamadı.");
			}

			var merchant = await _merchantRepository.GetByAppUserIdAsync(userId);
			if (merchant == null)
			{
				throw new Exception("Merchant bulunamadı.");
			}

			var product = await _productRepository.GetByIdAsync(dto.Id);
			if (product == null)
			{
				throw new Exception("Ürün bulunamadı.");
			}

			if (product.AppUserId != merchant.AppUserId)
			{
				throw new UnauthorizedAccessException("Bu ürünü güncelleme yetkiniz yok.");
			}

			if (!Enum.IsDefined(typeof(GenderType), dto.Gender))
			{
				throw new Exception("Geçersiz cinsiyet türü.");
			}

			if (dto.BasePrice <= 0)
			{
				throw new Exception("Ürün fiyatı sıfırdan büyük olmalıdır.");
			}

			var category = await _categoryRepository.GetByIdAsync(dto.CategoryId);
			if (category == null)
			{
				throw new Exception("Belirtilen kategori bulunamadı.");
			}

			_mapper.Map(dto, product); // DTO'dan mevcut entity'e map
			await _productRepository.UpdateAsync(product);
		}

        [CacheRemoveAspect("IProductService.Get")]
        public async Task DeleteAsync(int id)
		{
			var userId = _httpContextAccessor.HttpContext?.User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;
			if (string.IsNullOrEmpty(userId))
			{
				throw new Exception("Kullanıcı oturumu bulunamadı.");
			}

			var product = await _productRepository.GetByIdAsync(id);
			if (product == null)
			{
				throw new Exception("Ürün bulunamadı.");
			}

			var merchant = await _merchantRepository.GetByAppUserIdAsync(userId);
			if (merchant == null)
			{
				throw new Exception("Merchant bulunamadı.");
			}

			if (product.AppUserId != merchant.AppUserId)
			{
				throw new UnauthorizedAccessException("Bu ürünü silme yetkiniz yok.");
			}

			await _productRepository.DeleteAsync(id);
		}


        public async Task<PagedResult<ProductListItemDto>> FilterAsync(ProductFilterRequest req)
        {
            if (req.Page <= 0) req.Page = 1;
            if (req.PageSize <= 0 || req.PageSize > 100) req.PageSize = 24;

            var q = _productRepository.Query(); // IQueryable<Product>

            // Keyword
            if (!string.IsNullOrWhiteSpace(req.Keyword))
            {
                var term = req.Keyword.Trim();
                q = q.Where(p => p.Name.Contains(term));
            }

            // Kategori
            if (req.CategoryId.HasValue)
                q = q.Where(p => p.CategoryId == req.CategoryId.Value);

            // ✅ Merchant (marka) — DTO: MerchantIds
            if (req.MerchantIds != null && req.MerchantIds.Length > 0)
                q = q.Where(p => req.MerchantIds.Contains(p.MerchantId));

            // Variant - Size
            if (req.Sizes != null && req.Sizes.Length > 0)
                q = q.Where(p => p.ProductVariants.Any(v => req.Sizes.Contains(v.Size)));

            // Variant - Color
            if (req.Colors != null && req.Colors.Length > 0)
                q = q.Where(p => p.ProductVariants.Any(v => req.Colors.Contains(v.Color)));

            // Gender (enum ise string -> enum map)
            if (req.Genders != null && req.Genders.Length > 0)
            {
                var genderEnums = req.Genders
                    .Where(g => !string.IsNullOrWhiteSpace(g))
                    .Select(g => Enum.TryParse<GenderType>(g, true, out var en) ? (GenderType?)en : null)
                    .Where(e => e.HasValue)
                    .Select(e => e!.Value)
                    .ToArray();

                if (genderEnums.Length > 0)
                    q = q.Where(p => genderEnums.Contains(p.Gender));
            }

            // Fiyat
            if (req.MinPrice.HasValue) q = q.Where(p => p.BasePrice >= req.MinPrice.Value);
            if (req.MaxPrice.HasValue) q = q.Where(p => p.BasePrice <= req.MaxPrice.Value);

            // Sıralama
            q = (req.SortBy, req.SortDesc) switch
            {
                ("price", true) => q.OrderByDescending(p => p.BasePrice),
                ("price", false) => q.OrderBy(p => p.BasePrice),
                ("newest", _) => q.OrderByDescending(p => p.CreatedAt),
                ("name", true) => q.OrderByDescending(p => p.Name),
                _ => q.OrderBy(p => p.Name)
            };

            var total = await q.CountAsync();

            var items = await q
                .Skip((req.Page - 1) * req.PageSize)
                .Take(req.PageSize)
                .Select(p => new ProductListItemDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Price = p.BasePrice,
                    CoverImageUrl = p.ProductImages
                        .OrderBy(i => i.SortOrder)
                        .Select(i => i.ImageUrl) // kendi alan adına göre
                        .FirstOrDefault(),
                    MerchantId = p.MerchantId,
                    MerchantName = p.Merchant.CompanyName
                })
                .ToListAsync();

            return new PagedResult<ProductListItemDto>
            {
                Total = total,
                Page = req.Page,
                PageSize = req.PageSize,
                Items = items
            };
        }

    }
}
