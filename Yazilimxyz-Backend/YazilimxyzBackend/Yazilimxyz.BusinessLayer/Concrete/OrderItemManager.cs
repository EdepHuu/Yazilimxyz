using AutoMapper;
using Core.Aspects.Autofac.Caching;
using Yazilimxyz.BusinessLayer.Abstract;
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

        [CacheAspect] // Cache getirir
        public async Task<ResultOrderItemDto?> GetByIdAsync(int id)
        {
            var item = await _orderItemRepository.GetByIdAsync(id);
            return _mapper.Map<ResultOrderItemDto?>(item);
        }

        [CacheAspect] // Cache getirir
        public async Task<List<ResultOrderItemDto>> GetAllAsync()
        {
            var items = await _orderItemRepository.GetAllAsync();
            return _mapper.Map<List<ResultOrderItemDto>>(items);
        }

        [CacheAspect] // Cache getirir
        public async Task<List<ResultOrderItemDto>> GetByOrderIdAsync(int orderId)
        {
            var items = await _orderItemRepository.GetByOrderIdAsync(orderId);
            return _mapper.Map<List<ResultOrderItemDto>>(items);
        }

        [CacheAspect] // Cache getirir
        public async Task<List<ResultOrderItemDto>> GetByProductIdAsync(int productId)
        {
            var items = await _orderItemRepository.GetByProductIdAsync(productId);
            return _mapper.Map<List<ResultOrderItemDto>>(items);
        }

        [CacheRemoveAspect("IOrderItemService.Get")] // Cache temizler
        public async Task CreateAsync(CreateOrderItemDto dto)
        {
            if (dto == null)
                throw new ArgumentNullException(nameof(dto), "Veri boş olamaz.");

            if (dto.OrderId <= 0)
                throw new ArgumentException("Geçersiz OrderId.");

            if (dto.ProductId <= 0)
                throw new ArgumentException("Geçersiz ProductId.");

            if (dto.Quantity <= 0)
                throw new ArgumentException("Miktar 1'den büyük olmalıdır.");

            if (dto.UnitPrice < 0)
                throw new ArgumentException("Birim fiyat negatif olamaz.");

            var expectedTotal = dto.Quantity * dto.UnitPrice;
            if (dto.TotalPrice != expectedTotal)
                throw new ArgumentException("Toplam fiyat miktar * birim fiyat ile uyuşmuyor.");

            var item = _mapper.Map<OrderItem>(dto);
            await _orderItemRepository.AddAsync(item);
        }

        [CacheRemoveAspect("IOrderItemService.Get")] // Cache temizler
        public async Task UpdateAsync(UpdateOrderItemDto dto)
        {
            if (dto == null)
                throw new ArgumentNullException(nameof(dto), "Veri boş olamaz.");

            if (dto.OrderItemId <= 0)
                throw new ArgumentException("Geçersiz OrderItemId.");

            if (dto.Quantity <= 0)
                throw new ArgumentException("Miktar 1'den büyük olmalıdır.");

            if (dto.UnitPrice < 0)
                throw new ArgumentException("Birim fiyat negatif olamaz.");

            var item = await _orderItemRepository.GetByIdAsync(dto.OrderItemId);
            if (item == null)
                throw new Exception("Güncellenecek ürün kalemi bulunamadı.");

            _mapper.Map(dto, item);
            await _orderItemRepository.UpdateAsync(item);
        }

        [CacheRemoveAspect("IOrderItemService.Get")] // Cache temizler
        public async Task DeleteAsync(int id)
        {
            await _orderItemRepository.DeleteAsync(id);
        }
    }
}
