using AutoMapper;
using Core.Aspects.Autofac.Caching;
using Yazilimxyz.BusinessLayer.Abstract;
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

        [CacheAspect] // key, value
        public async Task<List<ResultCartItemDto>> GetByUserIdAsync(string userId)
        {
            var items = await _cartItemRepository.GetByUserIdAsync(userId);
            return _mapper.Map<List<ResultCartItemDto>>(items);
        }

        [CacheAspect] // key, value
        public async Task<ResultCartItemDto?> GetByUserAndVariantAsync(string userId, int variantId)
        {
            var item = await _cartItemRepository.GetByUserAndVariantAsync(userId, variantId);
            return _mapper.Map<ResultCartItemDto?>(item);
        }

        [CacheRemoveAspect("ICartItemService.Get")]
        public async Task AddAsync(CreateCartItemDto dto)
        {
            var item = _mapper.Map<CartItem>(dto);
            await _cartItemRepository.AddAsync(item);
        }

        [CacheRemoveAspect("ICartItemService.Get")]
        public async Task UpdateAsync(UpdateCartItemDto dto)
        {
            var item = _mapper.Map<CartItem>(dto);
            await _cartItemRepository.UpdateAsync(item);
        }

        [CacheRemoveAspect("ICartItemService.Get")]
        public async Task DeleteAsync(int id)
        {
            await _cartItemRepository.DeleteAsync(id);
        }

        [CacheRemoveAspect("ICartItemService.Get")]
        public async Task ClearUserCartAsync(string userId)
        {
            await _cartItemRepository.ClearUserCartAsync(userId);
        }

        [CacheAspect] // key, value
        public async Task<int> GetCartItemCountAsync(string userId)
        {
            return await _cartItemRepository.GetCartItemCountAsync(userId);
        }
    }
}