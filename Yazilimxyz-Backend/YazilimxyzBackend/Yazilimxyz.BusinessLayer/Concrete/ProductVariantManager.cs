using AutoMapper;
using Core.Aspects.Autofac.Caching;
using Yazilimxyz.BusinessLayer.Abstract;
using Yazilimxyz.BusinessLayer.DTOs.ProductVariant;
using Yazilimxyz.DataAccessLayer.Abstract;
using Yazilimxyz.EntityLayer.Entities;

namespace Yazilimxyz.BusinessLayer.Concrete
{
    public class ProductVariantManager : IProductVariantService
    {
        private readonly IProductVariantRepository _productVariantRepository;
        private readonly IProductRepository _productRepository;
        private readonly IMapper _mapper;

        public ProductVariantManager(IProductVariantRepository productVariantRepository, IMapper mapper, IProductRepository productRepository)
        {
            _productVariantRepository = productVariantRepository;
            _mapper = mapper;
            _productRepository = productRepository;
        }

        public async Task<ResultProductVariantDto?> GetByIdAsync(int id)
        {
            if (id <= 0)
            {
                throw new Exception("Id 0'dan büyük olmalıdır.");
            }

            var variant = await _productVariantRepository.GetByIdAsync(id);
            return _mapper.Map<ResultProductVariantDto>(variant);
        }

        [CacheAspect] // key, value - Tüm varyantlar cache'lenir
        public async Task<List<ResultProductVariantDto>> GetAllAsync()
        {
            var variants = await _productVariantRepository.GetAllAsync();
            return _mapper.Map<List<ResultProductVariantDto>>(variants);
        }

        [CacheAspect] // Ürüne göre varyantlar cache'lenir
        public async Task<List<ResultProductVariantDto>> GetByProductIdAsync(int productId)
        {
            if (productId <= 0)
            {
                throw new Exception("ProductId 0'dan büyük olmalıdır.");
            }

            var variants = await _productVariantRepository.GetByProductIdAsync(productId);
            return _mapper.Map<List<ResultProductVariantDto>>(variants);
        }

        [CacheAspect] // Spesifik varyant cache'lenir
        public async Task<ResultProductVariantDto?> GetByProductAndOptionsAsync(int productId, string size, string color)
        {
            if (productId <= 0)
            {
                throw new Exception("ProductId 0'dan büyük olmalıdır.");
            }

            if (string.IsNullOrWhiteSpace(size))
            {
                throw new Exception("Beden alanı boş olamaz.");
            }

            if (string.IsNullOrWhiteSpace(color))
            {
                throw new Exception("Renk alanı boş olamaz.");
            }

            var variant = await _productVariantRepository.GetByProductAndOptionsAsync(productId, size, color);
            return _mapper.Map<ResultProductVariantDto>(variant);
        }

        [CacheAspect] // Stokta olan varyantlar cache'lenir
        public async Task<List<ResultProductVariantDto>> GetInStockAsync(int productId)
        {
            if (productId <= 0)
            {
                throw new Exception("ProductId 0'dan büyük olmalıdır.");
            }

            var variants = await _productVariantRepository.GetInStockAsync(productId);
            return _mapper.Map<List<ResultProductVariantDto>>(variants);
        }

        public async Task<bool> IsInStockAsync(int variantId, int quantity)
        {
            if (variantId <= 0)
            {
                throw new Exception("VariantId 0'dan büyük olmalıdır.");
            }

            if (quantity <= 0)
            {
                throw new Exception("Miktar 0'dan büyük olmalıdır.");
            }

            return await _productVariantRepository.IsInStockAsync(variantId, quantity);
        }

        [CacheRemoveAspect("IProductVariantService.Get")] // Cache temizlenir - stok güncellemesi
        public async Task UpdateStockAsync(int variantId, int quantity)
        {
            if (variantId <= 0)
            {
                throw new Exception("VariantId 0'dan büyük olmalıdır.");
            }

            if (quantity < 0)
            {
                throw new Exception("Stok miktarı negatif olamaz.");
            }

            if (quantity > 999999)
            {
                throw new Exception("Stok miktarı 999,999'dan fazla olamaz.");
            }

            var variant = await _productVariantRepository.GetByIdAsync(variantId);
            if (variant == null)
            {
                throw new Exception("Varyant bulunamadı.");
            }

            await _productVariantRepository.UpdateStockAsync(variantId, quantity);
        }

        [CacheRemoveAspect("IProductVariantService.Get")] // Cache temizlenir
        public async Task CreateAsync(CreateProductVariantDto dto)
        {
            // Validation
            if (dto.ProductId <= 0)
            {
                throw new Exception("ProductId 0'dan büyük olmalıdır.");
            }

            if (string.IsNullOrWhiteSpace(dto.Size))
            {
                throw new Exception("Beden alanı boş olamaz.");
            }

            if (dto.Size.Length > 50)
            {
                throw new Exception("Beden alanı maksimum 50 karakter olabilir.");
            }

            if (string.IsNullOrWhiteSpace(dto.Color))
            {
                throw new Exception("Renk alanı boş olamaz.");
            }

            if (dto.Color.Length > 50)
            {
                throw new Exception("Renk alanı maksimum 50 karakter olabilir.");
            }

            if (dto.Stock < 0)
            {
                throw new Exception("Stok miktarı negatif olamaz.");
            }

            if (dto.Stock > 999999)
            {
                throw new Exception("Stok miktarı 999,999'dan fazla olamaz.");
            }

            // Product var mı kontrol et
            var product = await _productRepository.GetByIdAsync(dto.ProductId);
            if (product == null)
            {
                throw new Exception("Belirtilen ürün bulunamadı.");
            }

            // Aynı ürün için aynı beden ve renk kombinasyonu var mı kontrol et
            var existingVariant = await _productVariantRepository.GetByProductAndOptionsAsync(dto.ProductId, dto.Size, dto.Color);
            if (existingVariant != null)
            {
                throw new Exception("Bu ürün için aynı beden ve renk kombinasyonu zaten mevcut.");
            }

            var variant = _mapper.Map<ProductVariant>(dto);
            await _productVariantRepository.AddAsync(variant);
        }

        [CacheRemoveAspect("IProductVariantService.Get")] // Cache temizlenir
        public async Task UpdateAsync(UpdateProductVariantDto dto)
        {
            // Validation
            if (dto.Id <= 0)
            {
                throw new Exception("Id 0'dan büyük olmalıdır.");
            }

            if (dto.ProductId <= 0)
            {
                throw new Exception("ProductId 0'dan büyük olmalıdır.");
            }

            if (string.IsNullOrWhiteSpace(dto.Size))
            {
                throw new Exception("Beden alanı boş olamaz.");
            }

            if (dto.Size.Length > 50)
            {
                throw new Exception("Beden alanı maksimum 50 karakter olabilir.");
            }

            if (string.IsNullOrWhiteSpace(dto.Color))
            {
                throw new Exception("Renk alanı boş olamaz.");
            }

            if (dto.Color.Length > 50)
            {
                throw new Exception("Renk alanı maksimum 50 karakter olabilir.");
            }

            if (dto.Stock < 0)
            {
                throw new Exception("Stok miktarı negatif olamaz.");
            }

            if (dto.Stock > 999999)
            {
                throw new Exception("Stok miktarı 999,999'dan fazla olamaz.");
            }

            var variant = await _productVariantRepository.GetByIdAsync(dto.Id);
            if (variant == null)
            {
                throw new Exception("Varyant bulunamadı.");
            }

            // Product var mı kontrol et
            var product = await _productRepository.GetByIdAsync(dto.ProductId);
            if (product == null)
            {
                throw new Exception("Belirtilen ürün bulunamadı.");
            }

            // Aynı ürün için aynı beden ve renk kombinasyonu var mı kontrol et (kendisi hariç)
            var existingVariant = await _productVariantRepository.GetByProductAndOptionsAsync(dto.ProductId, dto.Size, dto.Color);
            if (existingVariant != null && existingVariant.Id != dto.Id)
            {
                throw new Exception("Bu ürün için aynı beden ve renk kombinasyonu zaten mevcut.");
            }

            _mapper.Map(dto, variant);
            await _productVariantRepository.UpdateAsync(variant);
        }

        [CacheRemoveAspect("IProductVariantService.Get")] // Cache temizlenir
        public async Task DeleteAsync(int id)
        {
            if (id <= 0)
            {
                throw new Exception("Id 0'dan büyük olmalıdır.");
            }

            var variant = await _productVariantRepository.GetByIdAsync(id);
            if (variant == null)
            {
                throw new Exception("Varyant bulunamadı.");
            }

            await _productVariantRepository.DeleteAsync(id);
        }
    }
}