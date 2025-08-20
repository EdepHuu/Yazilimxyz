using AutoMapper;
using Core.Aspects.Autofac.Caching;
using Core.Utilities.Results;
using Yazilimxyz.BusinessLayer.Abstract;
using Yazilimxyz.BusinessLayer.Constans;
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

        public async Task<IDataResult<ResultProductVariantDto>> GetByIdAsync(int id)
        {
            if (id <= 0)
                return new ErrorDataResult<ResultProductVariantDto>(Messages.InvalidProductVariantId);

            var variant = await _productVariantRepository.GetByIdAsync(id);
            if (variant == null)
                return new ErrorDataResult<ResultProductVariantDto>(Messages.ProductVariantNotFound);

            return new SuccessDataResult<ResultProductVariantDto>(_mapper.Map<ResultProductVariantDto>(variant), Messages.ProductVariantsListed);
        }

        [CacheAspect]
        public async Task<IDataResult<List<ResultProductVariantDto>>> GetAllAsync()
        {
            var variants = await _productVariantRepository.GetAllAsync();
            return new SuccessDataResult<List<ResultProductVariantDto>>(_mapper.Map<List<ResultProductVariantDto>>(variants), Messages.ProductVariantsListed);
        }

        [CacheAspect]
        public async Task<IDataResult<List<ResultProductVariantDto>>> GetByProductIdAsync(int productId)
        {
            if (productId <= 0)
                return new ErrorDataResult<List<ResultProductVariantDto>>(Messages.InvalidProductId);

            var variants = await _productVariantRepository.GetByProductIdAsync(productId);
            return new SuccessDataResult<List<ResultProductVariantDto>>(_mapper.Map<List<ResultProductVariantDto>>(variants), Messages.ProductVariantsListed);
        }

        [CacheAspect]
        public async Task<IDataResult<ResultProductVariantDto>> GetByProductAndOptionsAsync(int productId, string size, string color)
        {
            if (productId <= 0)
                return new ErrorDataResult<ResultProductVariantDto>(Messages.InvalidProductId);

            if (string.IsNullOrWhiteSpace(size))
                return new ErrorDataResult<ResultProductVariantDto>(Messages.InvalidProductVariantSize);

            if (string.IsNullOrWhiteSpace(color))
                return new ErrorDataResult<ResultProductVariantDto>(Messages.InvalidProductVariantColor);

            var variant = await _productVariantRepository.GetByProductAndOptionsAsync(productId, size, color);
            if (variant == null)
                return new ErrorDataResult<ResultProductVariantDto>(Messages.ProductVariantNotFound);

            return new SuccessDataResult<ResultProductVariantDto>(_mapper.Map<ResultProductVariantDto>(variant), Messages.ProductVariantsListed);
        }

        [CacheAspect]
        public async Task<IDataResult<List<ResultProductVariantDto>>> GetInStockAsync(int productId)
        {
            if (productId <= 0)
                return new ErrorDataResult<List<ResultProductVariantDto>>(Messages.InvalidProductId);

            var variants = await _productVariantRepository.GetInStockAsync(productId);
            return new SuccessDataResult<List<ResultProductVariantDto>>(_mapper.Map<List<ResultProductVariantDto>>(variants), Messages.ProductVariantsListed);
        }

        public async Task<IDataResult<bool>> IsInStockAsync(int variantId, int quantity)
        {
            if (variantId <= 0)
                return new ErrorDataResult<bool>(Messages.InvalidProductVariantId);

            if (quantity <= 0)
                return new ErrorDataResult<bool>(Messages.ProductVariantOutOfStock);

            var inStock = await _productVariantRepository.IsInStockAsync(variantId, quantity);
            return inStock
                ? new SuccessDataResult<bool>(true, Messages.ProductVariantInStock)
                : new ErrorDataResult<bool>(false, Messages.ProductVariantOutOfStock);
        }

        [CacheRemoveAspect("IProductVariantService.Get")]
        public async Task<IResult> UpdateStockAsync(int variantId, int quantity)
        {
            if (variantId <= 0)
                return new ErrorResult(Messages.InvalidProductVariantId);

            if (quantity < 0)
                return new ErrorResult(Messages.InvalidProductVariantStock);

            if (quantity > 999999)
                return new ErrorResult(Messages.ProductVariantStockTooHigh);

            var variant = await _productVariantRepository.GetByIdAsync(variantId);
            if (variant == null)
                return new ErrorResult(Messages.ProductVariantNotFound);

            await _productVariantRepository.UpdateStockAsync(variantId, quantity);
            return new SuccessResult(Messages.ProductVariantStockUpdated);
        }

        [CacheRemoveAspect("IProductVariantService.Get")]
        public async Task<IResult> CreateAsync(CreateProductVariantDto dto)
        {
            if (dto.ProductId <= 0)
                return new ErrorResult(Messages.InvalidProductId);

            if (string.IsNullOrWhiteSpace(dto.Size))
                return new ErrorResult(Messages.InvalidProductVariantSize);

            if (dto.Size.Length > 50)
                return new ErrorResult(Messages.ProductVariantSizeTooLong);

            if (string.IsNullOrWhiteSpace(dto.Color))
                return new ErrorResult(Messages.InvalidProductVariantColor);

            if (dto.Color.Length > 50)
                return new ErrorResult(Messages.ProductVariantColorTooLong);

            if (dto.Stock < 0)
                return new ErrorResult(Messages.InvalidProductVariantStock);

            if (dto.Stock > 999999)
                return new ErrorResult(Messages.ProductVariantStockTooHigh);

            var product = await _productRepository.GetByIdAsync(dto.ProductId);
            if (product == null)
                return new ErrorResult(Messages.ProductNotFound);

            var existingVariant = await _productVariantRepository.GetByProductAndOptionsAsync(dto.ProductId, dto.Size, dto.Color);
            if (existingVariant != null)
                return new ErrorResult(Messages.DuplicateProductVariant);

            var variant = _mapper.Map<ProductVariant>(dto);
            await _productVariantRepository.AddAsync(variant);

            return new SuccessResult(Messages.ProductVariantAdded);
        }

        [CacheRemoveAspect("IProductVariantService.Get")]
        public async Task<IResult> UpdateAsync(int id, UpdateProductVariantDto dto)
        {
            if (id <= 0)
                return new ErrorResult(Messages.InvalidProductVariantId);

            if (dto.ProductId <= 0)
                return new ErrorResult(Messages.InvalidProductId);

            if (string.IsNullOrWhiteSpace(dto.Size))
                return new ErrorResult(Messages.InvalidProductVariantSize);

            if (dto.Size.Length > 50)
                return new ErrorResult(Messages.ProductVariantSizeTooLong);

            if (string.IsNullOrWhiteSpace(dto.Color))
                return new ErrorResult(Messages.InvalidProductVariantColor);

            if (dto.Color.Length > 50)
                return new ErrorResult(Messages.ProductVariantColorTooLong);

            if (dto.Stock < 0)
                return new ErrorResult(Messages.InvalidProductVariantStock);

            if (dto.Stock > 999999)
                return new ErrorResult(Messages.ProductVariantStockTooHigh);

            var variant = await _productVariantRepository.GetByIdAsync(id);
            if (variant == null)
                return new ErrorResult(Messages.ProductVariantNotFound);

            var product = await _productRepository.GetByIdAsync(dto.ProductId);
            if (product == null)
                return new ErrorResult(Messages.ProductNotFound);

            var existingVariant = await _productVariantRepository.GetByProductAndOptionsAsync(dto.ProductId, dto.Size, dto.Color);
            if (existingVariant != null && existingVariant.Id != id)
                return new ErrorResult(Messages.DuplicateProductVariant);

            _mapper.Map(dto, variant);
            await _productVariantRepository.UpdateAsync(variant);

            return new SuccessResult(Messages.ProductVariantUpdated);
        }


        [CacheRemoveAspect("IProductVariantService.Get")]
        public async Task<IResult> DeleteAsync(int id)
        {
            if (id <= 0)
                return new ErrorResult(Messages.InvalidProductVariantId);

            var variant = await _productVariantRepository.GetByIdAsync(id);
            if (variant == null)
                return new ErrorResult(Messages.ProductVariantNotFound);

            await _productVariantRepository.DeleteAsync(id);
            return new SuccessResult(Messages.ProductVariantDeleted);
        }
    }

}