using AutoMapper;
using Yazilimxyz.BusinessLayer.Abstract;
using Yazilimxyz.BusinessLayer.DTOs.ProductVariant;
using Yazilimxyz.DataAccessLayer.Abstract;
using Yazilimxyz.EntityLayer.Entities;

namespace Yazilimxyz.BusinessLayer.Concrete
{
    public class ProductVariantManager : IProductVariantService
    {
        private readonly IProductVariantRepository _productVariantRepository;
        private readonly IMapper _mapper;

        public ProductVariantManager(IProductVariantRepository productVariantRepository, IMapper mapper)
        {
            _productVariantRepository = productVariantRepository;
            _mapper = mapper;
        }

        public async Task<ResultProductVariantDto?> GetByIdAsync(int id)
        {
            var variant = await _productVariantRepository.GetByIdAsync(id);
            return _mapper.Map<ResultProductVariantDto>(variant);
        }

        public async Task<List<ResultProductVariantDto>> GetAllAsync()
        {
            var variants = await _productVariantRepository.GetAllAsync();
            return _mapper.Map<List<ResultProductVariantDto>>(variants);
        }

        public async Task<List<ResultProductVariantDto>> GetByProductIdAsync(int productId)
        {
            var variants = await _productVariantRepository.GetByProductIdAsync(productId);
            return _mapper.Map<List<ResultProductVariantDto>>(variants);
        }

        public async Task<ResultProductVariantDto?> GetByProductAndOptionsAsync(int productId, string size, string color)
        {
            var variant = await _productVariantRepository.GetByProductAndOptionsAsync(productId, size, color);
            return _mapper.Map<ResultProductVariantDto>(variant);
        }

        public async Task<List<ResultProductVariantDto>> GetInStockAsync(int productId)
        {
            var variants = await _productVariantRepository.GetInStockAsync(productId);
            return _mapper.Map<List<ResultProductVariantDto>>(variants);
        }

        public async Task<bool> IsInStockAsync(int variantId, int quantity)
        {
            return await _productVariantRepository.IsInStockAsync(variantId, quantity);
        }

        public async Task UpdateStockAsync(int variantId, int quantity)
        {
            await _productVariantRepository.UpdateStockAsync(variantId, quantity);
        }

        public async Task CreateAsync(CreateProductVariantDto dto)
        {
            var variant = _mapper.Map<ProductVariant>(dto);
            await _productVariantRepository.AddAsync(variant);
        }

        public async Task UpdateAsync(UpdateProductVariantDto dto)
        {
            var variant = await _productVariantRepository.GetByIdAsync(dto.Id);
            if (variant != null)
            {
                _mapper.Map(dto, variant);
                await _productVariantRepository.UpdateAsync(variant);
            }
        }

        public async Task DeleteAsync(int id)
        {
            await _productVariantRepository.DeleteAsync(id);
        }
    }
}
