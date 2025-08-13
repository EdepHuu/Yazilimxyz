using AutoMapper;
using Core.Aspects.Autofac.Caching;
using Core.Utilities.Results;
using Yazilimxyz.BusinessLayer.Abstract;
using Yazilimxyz.BusinessLayer.Constans;
using Yazilimxyz.BusinessLayer.DTOs.OrderItem;
using Yazilimxyz.DataAccessLayer.Abstract;
using Yazilimxyz.EntityLayer.Entities;

namespace Yazilimxyz.BusinessLayer.Concrete
{
    public class OrderItemManager : IOrderItemService
    {
        private readonly IOrderItemRepository _orderItemRepository;
        private readonly IMapper _mapper;

        public OrderItemManager(IOrderItemRepository orderItemRepository, IMapper mapper)
        {
            _orderItemRepository = orderItemRepository;
            _mapper = mapper;
        }

        [CacheAspect]
        public async Task<IDataResult<ResultOrderItemDto>> GetByIdAsync(int id)
        {
            var item = await _orderItemRepository.GetByIdAsync(id);
            if (item == null)
                return new ErrorDataResult<ResultOrderItemDto>(null, Messages.OrderItemNotFound);

            return new SuccessDataResult<ResultOrderItemDto>(_mapper.Map<ResultOrderItemDto>(item), Messages.OrderItemsListed);
        }

        [CacheAspect]
        public async Task<IDataResult<List<ResultOrderItemDto>>> GetAllAsync()
        {
            var items = await _orderItemRepository.GetAllAsync();
            return new SuccessDataResult<List<ResultOrderItemDto>>(_mapper.Map<List<ResultOrderItemDto>>(items), Messages.OrderItemsListed);
        }

        [CacheAspect]
        public async Task<IDataResult<List<ResultOrderItemDto>>> GetByOrderIdAsync(int orderId)
        {
            var items = await _orderItemRepository.GetByOrderIdAsync(orderId);
            return new SuccessDataResult<List<ResultOrderItemDto>>(_mapper.Map<List<ResultOrderItemDto>>(items), Messages.OrderItemsListed);
        }

        [CacheAspect]
        public async Task<IDataResult<List<ResultOrderItemDto>>> GetByProductIdAsync(int productId)
        {
            var items = await _orderItemRepository.GetByProductIdAsync(productId);
            return new SuccessDataResult<List<ResultOrderItemDto>>(_mapper.Map<List<ResultOrderItemDto>>(items), Messages.OrderItemsListed);
        }

        [CacheRemoveAspect("IOrderItemService.Get")]
        public async Task<IResult> CreateAsync(CreateOrderItemDto dto)
        {
            if (dto == null)
                return new ErrorResult("Veri boş olamaz.");

            if (dto.OrderId <= 0)
                return new ErrorResult("Geçersiz OrderId.");

            if (dto.ProductId <= 0)
                return new ErrorResult("Geçersiz ProductId.");

            if (dto.Quantity <= 0)
                return new ErrorResult("Miktar 1'den büyük olmalıdır.");

            if (dto.UnitPrice < 0)
                return new ErrorResult("Birim fiyat negatif olamaz.");

            var expectedTotal = dto.Quantity * dto.UnitPrice;
            if (dto.TotalPrice != expectedTotal)
                return new ErrorResult("Toplam fiyat miktar * birim fiyat ile uyuşmuyor.");

            var item = _mapper.Map<OrderItem>(dto);
            await _orderItemRepository.AddAsync(item);

            return new SuccessResult(Messages.OrderItemAdded);
        }

        [CacheRemoveAspect("IOrderItemService.Get")]
        public async Task<IResult> UpdateAsync(UpdateOrderItemDto dto)
        {
            if (dto == null)
                return new ErrorResult("Veri boş olamaz.");

            if (dto.OrderItemId <= 0)
                return new ErrorResult("Geçersiz OrderItemId.");

            if (dto.Quantity <= 0)
                return new ErrorResult("Miktar 1'den büyük olmalıdır.");

            if (dto.UnitPrice < 0)
                return new ErrorResult("Birim fiyat negatif olamaz.");

            var item = await _orderItemRepository.GetByIdAsync(dto.OrderItemId);
            if (item == null)
                return new ErrorResult(Messages.OrderItemNotFound);

            _mapper.Map(dto, item);
            await _orderItemRepository.UpdateAsync(item);

            return new SuccessResult(Messages.OrderItemUpdated);
        }

        [CacheRemoveAspect("IOrderItemService.Get")]
        public async Task<IResult> DeleteAsync(int id)
        {
            var existing = await _orderItemRepository.GetByIdAsync(id);
            if (existing == null)
                return new ErrorResult(Messages.OrderItemNotFound);

            await _orderItemRepository.DeleteAsync(id);
            return new SuccessResult(Messages.OrderItemDeleted);
        }
    }
}
