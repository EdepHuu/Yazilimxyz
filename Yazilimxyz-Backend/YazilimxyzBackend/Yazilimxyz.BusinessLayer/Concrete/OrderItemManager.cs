using AutoMapper;
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

        public async Task<ResultOrderItemDto?> GetByIdAsync(int id)
        {
            var item = await _orderItemRepository.GetByIdAsync(id);
            return _mapper.Map<ResultOrderItemDto?>(item);
        }

        public async Task<List<ResultOrderItemDto>> GetAllAsync()
        {
            var items = await _orderItemRepository.GetAllAsync();
            return _mapper.Map<List<ResultOrderItemDto>>(items);
        }

        public async Task<List<ResultOrderItemDto>> GetByOrderIdAsync(int orderId)
        {
            var items = await _orderItemRepository.GetByOrderIdAsync(orderId);
            return _mapper.Map<List<ResultOrderItemDto>>(items);
        }

        public async Task<List<ResultOrderItemDto>> GetByProductIdAsync(int productId)
        {
            var items = await _orderItemRepository.GetByProductIdAsync(productId);
            return _mapper.Map<List<ResultOrderItemDto>>(items);
        }

        public async Task CreateAsync(CreateOrderItemDto dto)
        {
            var item = _mapper.Map<OrderItem>(dto);
            await _orderItemRepository.AddAsync(item);
        }

        public async Task UpdateAsync(UpdateOrderItemDto dto)
        {
            var item = await _orderItemRepository.GetByIdAsync(dto.OrderItemId);
            if (item != null)
            {
                _mapper.Map(dto, item);
                await _orderItemRepository.UpdateAsync(item);
            }
        }

        public async Task DeleteAsync(int id)
        {
            await _orderItemRepository.DeleteAsync(id);
        }
    }
}
