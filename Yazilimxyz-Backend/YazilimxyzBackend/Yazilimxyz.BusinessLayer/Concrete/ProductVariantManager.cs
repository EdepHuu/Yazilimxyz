using AutoMapper;
using Yazilimxyz.BusinessLayer.Abstract;
using Yazilimxyz.BusinessLayer.DTOs.ProductVariant;
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

        public async Task<List<ResultProductVariantDto>> GetAllAsync()
        {
            var variants = await _productVariantRepository.GetAllAsync();
            return _mapper.Map<List<ResultProductVariantDto>>(variants);
        }

        public async Task<ResultProductVariantDto> GetByIdAsync(int id)
        {
            var variant = await _productVariantRepository.GetByIdAsync(id);
            return _mapper.Map<ResultProductVariantDto>(variant);
        }

        public async Task CreateAsync(CreateProductVariantDto dto)
        {
            var variant = _mapper.Map<ProductVariant>(dto);
            await _productVariantRepository.AddAsync(variant);
        }

        public async Task UpdateAsync(UpdateProductVariantDto dto)
        {
            var variant = _mapper.Map<ProductVariant>(dto);
            await _productVariantRepository.UpdateAsync(variant);
        }

        public async Task DeleteAsync(int id)
        {
            var variant = await _productVariantRepository.GetByIdAsync(id);
            if (variant != null)
            {
                await _productVariantRepository.DeleteAsync(variant);
            }
        }
    }
}
