using AutoMapper;
using Core.Aspects.Autofac.Caching;
using Core.Utilities.Results;
using Yazilimxyz.BusinessLayer.Abstract;
using Yazilimxyz.BusinessLayer.Constans;
using Yazilimxyz.BusinessLayer.DTOs.CartItem;
using Yazilimxyz.DataAccessLayer.Abstract;
using Yazilimxyz.EntityLayer.Entities;

namespace Yazilimxyz.BusinessLayer.Concrete
{
    public class CartItemManager : ICartItemService
    {
        private readonly ICartItemRepository _cartItemRepository;
        private readonly IMapper _mapper;

        public CartItemManager(ICartItemRepository cartItemRepository, IMapper mapper)
        {
            _cartItemRepository = cartItemRepository;
            _mapper = mapper;
        }

        [CacheAspect]
        public async Task<IDataResult<List<ResultCartItemDto>>> GetByUserIdAsync(string userId)
        {
            if (string.IsNullOrWhiteSpace(userId))
                return new ErrorDataResult<List<ResultCartItemDto>>(Messages.CartItemNotFound);

            var items = await _cartItemRepository.GetByUserIdAsync(userId);
            var resultDto = _mapper.Map<List<ResultCartItemDto>>(items);

            return new SuccessDataResult<List<ResultCartItemDto>>(resultDto, Messages.CategoriesListed);
        }

        [CacheAspect]
        public async Task<IDataResult<ResultCartItemDto?>> GetByUserAndVariantAsync(string userId, int variantId)
        {
            if (string.IsNullOrWhiteSpace(userId) || variantId <= 0)
                return new ErrorDataResult<ResultCartItemDto?>(null, Messages.CartItemNotFound);

            var item = await _cartItemRepository.GetByUserAndVariantAsync(userId, variantId);
            var mappedItem = _mapper.Map<ResultCartItemDto?>(item);

            if (mappedItem == null)
                return new ErrorDataResult<ResultCartItemDto?>(null, Messages.CartItemNotFound);

            return new SuccessDataResult<ResultCartItemDto?>(mappedItem);
        }

        [CacheRemoveAspect("ICartItemService.Get")]
        public async Task<IResult> AddAsync(CreateCartItemDto dto)
        {
            if (dto == null)
                return new ErrorResult("Geçersiz istek.");

            if (string.IsNullOrWhiteSpace(dto.UserId))
                return new ErrorResult("Kullanıcı Id boş olamaz.");

            if (dto.ProductVariantId <= 0)
                return new ErrorResult("Geçersiz ürün varyantı Id.");

            if (dto.Quantity < 1)
                return new ErrorResult(Messages.CartItemQuantityInvalid);

            // Kontrol: Aynı ürün varyantı zaten sepette var mı?
            var exists = await _cartItemRepository.GetByUserAndVariantAsync(dto.UserId, dto.ProductVariantId);
            if (exists != null)
                return new ErrorResult(Messages.CartItemAlreadyExists);

            var item = _mapper.Map<CartItem>(dto);
            await _cartItemRepository.AddAsync(item);

            return new SuccessResult(Messages.CartItemAdded);
        }

        [CacheRemoveAspect("ICartItemService.Get")]
        public async Task<IResult> UpdateAsync(UpdateCartItemDto dto)
        {
            if (dto == null)
                return new ErrorResult("Geçersiz istek.");

            if (dto.Id <= 0)
                return new ErrorResult("Geçersiz sepet öğesi Id.");

            if (dto.Quantity < 1)
                return new ErrorResult(Messages.CartItemQuantityInvalid);

            var existingItem = await _cartItemRepository.GetByIdAsync(dto.Id);
            if (existingItem == null)
                return new ErrorResult(Messages.CartItemNotFound);

            var item = _mapper.Map<CartItem>(dto);
            await _cartItemRepository.UpdateAsync(item);

            return new SuccessResult(Messages.CartItemUpdated);
        }

        [CacheRemoveAspect("ICartItemService.Get")]
        public async Task<IResult> DeleteAsync(int id)
        {
            if (id <= 0)
                return new ErrorResult("Geçersiz sepet öğesi Id.");

            var existingItem = await _cartItemRepository.GetByIdAsync(id);
            if (existingItem == null)
                return new ErrorResult(Messages.CartItemNotFound);

            await _cartItemRepository.DeleteAsync(id);

            return new SuccessResult(Messages.CartItemDeleted);
        }

        [CacheRemoveAspect("ICartItemService.Get")]
        public async Task<IResult> ClearUserCartAsync(string userId)
        {
            if (string.IsNullOrWhiteSpace(userId))
                return new ErrorResult("Kullanıcı Id boş olamaz.");

            await _cartItemRepository.ClearUserCartAsync(userId);

            return new SuccessResult(Messages.CartCleared);
        }

        [CacheAspect]
        public async Task<IDataResult<int>> GetCartItemCountAsync(string userId)
        {
            if (string.IsNullOrWhiteSpace(userId))
                return new SuccessDataResult<int>(0);

            int count = await _cartItemRepository.GetCartItemCountAsync(userId);

            return new SuccessDataResult<int>(count, Messages.CartItemCountRetrieved);
        }
    }
}
