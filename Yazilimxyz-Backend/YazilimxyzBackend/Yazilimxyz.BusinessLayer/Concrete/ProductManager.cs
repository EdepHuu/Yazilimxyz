using AutoMapper;
using Core.Aspects.Autofac.Caching;
using Core.Utilities.Results;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Yazilimxyz.BusinessLayer.Abstract;
using Yazilimxyz.BusinessLayer.Constans;
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

        public ProductManager(
            IProductRepository productRepository,
            IMapper mapper,
            IMerchantRepository merchantRepository,
            IHttpContextAccessor httpContextAccessor,
            ICategoryRepository categoryRepository)
        {
            _productRepository = productRepository;
            _mapper = mapper;
            _merchantRepository = merchantRepository;
            _httpContextAccessor = httpContextAccessor;
            _categoryRepository = categoryRepository;
        }

        public async Task<IDataResult<GetByIdProductDto>> GetByIdAsync(int id)
        {
            var product = await _productRepository.GetByIdAsync(id);
            if (product == null)
                return new ErrorDataResult<GetByIdProductDto>(Messages.ProductNotFound);

            return new SuccessDataResult<GetByIdProductDto>(_mapper.Map<GetByIdProductDto>(product));
        }

        [CacheAspect]
        public async Task<IDataResult<List<ResultProductDto>>> GetAllAsync()
        {
            var products = await _productRepository.GetAllAsync();
            return new SuccessDataResult<List<ResultProductDto>>(
                _mapper.Map<List<ResultProductDto>>(products),
                Messages.ProductsListed);
        }

        public async Task<IDataResult<List<ResultProductDto>>> GetActiveAsync()
        {
            var products = await _productRepository.GetActiveAsync();
            return new SuccessDataResult<List<ResultProductDto>>(
                _mapper.Map<List<ResultProductDto>>(products),
                Messages.ProductsListed);
        }

        public async Task<IDataResult<List<ResultProductDto>>> GetByCategoryIdAsync(int categoryId)
        {
            var products = await _productRepository.GetByCategoryIdAsync(categoryId);
            return new SuccessDataResult<List<ResultProductDto>>(
                _mapper.Map<List<ResultProductDto>>(products),
                Messages.ProductsListed);
        }

        public async Task<IDataResult<List<ResultProductWithMerchantDto>>> GetByMerchantIdAsync(int merchantId)
        {
            var products = await _productRepository.GetByMerchantIdAsync(merchantId);
            return new SuccessDataResult<List<ResultProductWithMerchantDto>>(
                _mapper.Map<List<ResultProductWithMerchantDto>>(products),
                Messages.ProductsListed);
        }

        public async Task<IDataResult<List<ResultProductDto>>> GetByGenderAsync(GenderType gender)
        {
            var products = await _productRepository.GetByGenderAsync(gender);
            return new SuccessDataResult<List<ResultProductDto>>(
                _mapper.Map<List<ResultProductDto>>(products),
                Messages.ProductsListed);
        }

        public async Task<IDataResult<ResultProductWithVariantsDto>> GetWithVariantsAsync(int id)
        {
            var product = await _productRepository.GetWithVariantsAsync(id);
            if (product == null)
                return new ErrorDataResult<ResultProductWithVariantsDto>(Messages.ProductNotFound);

            return new SuccessDataResult<ResultProductWithVariantsDto>(_mapper.Map<ResultProductWithVariantsDto>(product));
        }

        public async Task<IDataResult<ResultProductWithImagesDto>> GetWithImagesAsync(int id)
        {
            var product = await _productRepository.GetWithImagesAsync(id);
            if (product == null)
                return new ErrorDataResult<ResultProductWithImagesDto>(Messages.ProductNotFound);

            return new SuccessDataResult<ResultProductWithImagesDto>(_mapper.Map<ResultProductWithImagesDto>(product));
        }

        public async Task<IDataResult<ResultProductDetailedDto>> GetDetailedAsync(int id)
        {
            var product = await _productRepository.GetDetailedAsync(id);
            if (product == null)
                return new ErrorDataResult<ResultProductDetailedDto>(Messages.ProductNotFound);

            return new SuccessDataResult<ResultProductDetailedDto>(_mapper.Map<ResultProductDetailedDto>(product));
        }

        public async Task<IDataResult<List<ResultProductDto>>> SearchAsync(string searchTerm)
        {
            var products = await _productRepository.SearchAsync(searchTerm);
            return new SuccessDataResult<List<ResultProductDto>>(
                _mapper.Map<List<ResultProductDto>>(products),
                Messages.ProductsListed);
        }

        [CacheRemoveAspect("IProductService.Get")]
        public async Task<IResult> CreateAsync(CreateProductDto dto)
        {
            var userId = _httpContextAccessor.HttpContext?.User
                .FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userId))
                return new ErrorResult(Messages.UserNotFound);

            var merchant = await _merchantRepository.GetByAppUserIdAsync(userId);
            if (merchant == null)
                return new ErrorResult(Messages.MerchantNotFound);

            if (!Enum.IsDefined(typeof(GenderType), dto.Gender))
                return new ErrorResult(Messages.InvalidGenderType);

            var category = await _categoryRepository.GetByIdAsync(dto.CategoryId);
            if (category == null)
                return new ErrorResult(Messages.CategoryNotFound);

            if (dto.BasePrice <= 0)
                return new ErrorResult(Messages.InvalidProductPrice);

            var product = _mapper.Map<Product>(dto);
            product.AppUserId = merchant.AppUserId;
            product.MerchantId = merchant.Id;
            product.CreatedAt = DateTime.UtcNow;

            await _productRepository.AddAsync(product);
            return new SuccessResult(Messages.ProductAdded);
        }

        [CacheRemoveAspect("IProductService.Get")]
        public async Task<IResult> UpdateAsync(UpdateProductDto dto)
        {
            var userId = _httpContextAccessor.HttpContext?.User
                .FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userId))
                return new ErrorResult(Messages.UserNotFound);

            var merchant = await _merchantRepository.GetByAppUserIdAsync(userId);
            if (merchant == null)
                return new ErrorResult(Messages.MerchantNotFound);

            var product = await _productRepository.GetByIdAsync(dto.Id);
            if (product == null)
                return new ErrorResult(Messages.ProductNotFound);

            if (product.AppUserId != merchant.AppUserId)
                return new ErrorResult(Messages.UnauthorizedProductUpdate);

            if (!Enum.IsDefined(typeof(GenderType), dto.Gender))
                return new ErrorResult(Messages.InvalidGenderType);

            if (dto.BasePrice <= 0)
                return new ErrorResult(Messages.InvalidProductPrice);

            var category = await _categoryRepository.GetByIdAsync(dto.CategoryId);
            if (category == null)
                return new ErrorResult(Messages.CategoryNotFound);

            _mapper.Map(dto, product);
            await _productRepository.UpdateAsync(product);
            return new SuccessResult(Messages.ProductUpdated);
        }

        [CacheRemoveAspect("IProductService.Get")]
        public async Task<IResult> DeleteAsync(int id)
        {
            var userId = _httpContextAccessor.HttpContext?.User
                .FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userId))
                return new ErrorResult(Messages.UserNotFound);

            var product = await _productRepository.GetByIdAsync(id);
            if (product == null)
                return new ErrorResult(Messages.ProductNotFound);

            var merchant = await _merchantRepository.GetByAppUserIdAsync(userId);
            if (merchant == null)
                return new ErrorResult(Messages.MerchantNotFound);

            if (product.AppUserId != merchant.AppUserId)
                return new ErrorResult(Messages.UnauthorizedProductDelete);

            await _productRepository.DeleteAsync(id);
            return new SuccessResult(Messages.ProductDeleted);
        }

        public async Task<IDataResult<PagedResult<ProductListItemDto>>> FilterAsync(ProductFilterRequestDto req)
        {
            if (req.Page <= 0) req.Page = 1;
            if (req.PageSize <= 0 || req.PageSize > 100) req.PageSize = 24;

            var q = _productRepository.Query();

            if (req.MerchantIds is { Length: > 0 })
                q = q.Where(p => req.MerchantIds.Contains(p.MerchantId));

            var hasSizes = req.Sizes is { Length: > 0 };
            var hasColors = req.Colors is { Length: > 0 };

            if (hasSizes && hasColors)
            {
                q = q.Where(p => p.ProductVariants
                    .Any(v => req.Sizes.Contains(v.Size) &&
                              req.Colors.Contains(v.Color) &&
                              v.Stock > 0));
            }
            else if (hasSizes)
            {
                q = q.Where(p => p.ProductVariants
                    .Any(v => req.Sizes.Contains(v.Size) && v.Stock > 0));
            }
            else if (hasColors)
            {
                q = q.Where(p => p.ProductVariants
                    .Any(v => req.Colors.Contains(v.Color) && v.Stock > 0));
            }

            if (req.MinPrice.HasValue) q = q.Where(p => p.BasePrice >= req.MinPrice.Value);
            if (req.MaxPrice.HasValue) q = q.Where(p => p.BasePrice <= req.MaxPrice.Value);

            q = (req.SortBy?.ToLowerInvariant(), req.SortDesc) switch
            {
                ("price", true) => q.OrderByDescending(p => p.BasePrice),
                ("price", false) => q.OrderBy(p => p.BasePrice),
                ("name", true) => q.OrderByDescending(p => p.Name),
                ("name", false) => q.OrderBy(p => p.Name),
                _ => q.OrderByDescending(p => p.CreatedAt)
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
                        .Select(i => i.ImageUrl)
                        .FirstOrDefault(),
                    MerchantId = p.MerchantId,
                    MerchantName = p.Merchant.CompanyName
                })
                .ToListAsync();

            var result = new PagedResult<ProductListItemDto>
            {
                Total = total,
                Page = req.Page,
                PageSize = req.PageSize,
                Items = items
            };

            return new SuccessDataResult<PagedResult<ProductListItemDto>>(result, Messages.ProductsListed);
        }
    }

}
