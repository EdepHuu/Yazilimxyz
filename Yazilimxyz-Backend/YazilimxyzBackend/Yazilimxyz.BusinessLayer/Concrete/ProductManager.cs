using AutoMapper;
using Core.Aspects.Autofac.Caching;
using Microsoft.AspNetCore.Http;
using Yazilimxyz.BusinessLayer.Abstract;
using Yazilimxyz.BusinessLayer.DTOs.Product;
using Yazilimxyz.DataAccessLayer.Abstract;
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
	}
}
