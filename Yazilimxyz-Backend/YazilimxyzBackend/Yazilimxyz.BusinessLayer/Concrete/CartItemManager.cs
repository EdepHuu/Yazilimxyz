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

		public async Task<IDataResult<List<ResultCartItemDto>>> GetByUserIdAsync(string userId)
		{
			var items = await _cartItemRepository.GetUserCartWithDetailsAsync(userId);

			var result = _mapper.Map<List<ResultCartItemDto>>(items);
			return new SuccessDataResult<List<ResultCartItemDto>>(result);
		}

		public async Task<IResult> AddOrUpdateAsync(CreateCartItemDto dto, string userId)
		{
			var existing = await _cartItemRepository.FirstOrDefaultAsync(x =>
				x.UserId == userId && x.ProductVariantId == dto.ProductVariantId);

			if (existing != null)
			{
				existing.Quantity += dto.Quantity;
				await _cartItemRepository.UpdateAsync(existing);
			}
			else
			{
				var entity = _mapper.Map<CartItem>(dto);
				entity.UserId = userId;
				await _cartItemRepository.AddAsync(entity);
			}

			return new SuccessResult("Ürün sepete eklendi.");
		}

		public async Task<IResult> UpdateQuantityAsync(int cartItemId, int quantity, string userId)
		{
			var item = await _cartItemRepository.FirstOrDefaultAsync(
				x => x.Id == cartItemId && x.UserId == userId);

			if (item == null)
				return new ErrorResult("Ürün sepette bulunamadı.");

			item.Quantity = quantity;
			await _cartItemRepository.UpdateAsync(item);
			return new SuccessResult("Sepet güncellendi.");
		}

		public async Task<IResult> RemoveAsync(int cartItemId, string userId)
		{
			var item = await _cartItemRepository.FirstOrDefaultAsync(x =>
				x.Id == cartItemId && x.UserId == userId);

			if (item == null)
				return new ErrorResult("Ürün sepette bulunamadı.");

			await _cartItemRepository.DeleteAsync(item);
			return new SuccessResult("Ürün sepetten silindi.");
		}

		public async Task<IResult> ClearCartAsync(string userId)
		{
			var items = await _cartItemRepository.FindAsync(x => x.UserId == userId);
			await _cartItemRepository.DeleteRangeAsync(items);
			return new SuccessResult("Sepet temizlendi.");
		}
	}
}
