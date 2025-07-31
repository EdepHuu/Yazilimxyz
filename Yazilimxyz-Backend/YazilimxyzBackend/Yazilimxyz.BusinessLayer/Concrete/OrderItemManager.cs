using AutoMapper;
using Yazilimxyz.BusinessLayer.Abstract;
using Yazilimxyz.BusinessLayer.DTOs.OrderItem;
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

        public async Task<List<ResultOrderItemDto>> GetAllAsync()
        {
            var items = await _orderItemRepository.GetAllAsync();
            return _mapper.Map<List<ResultOrderItemDto>>(items);
        }

        public async Task<ResultOrderItemDto> GetByIdAsync(int id)
        {
            var item = await _orderItemRepository.GetByIdAsync(id);
            return _mapper.Map<ResultOrderItemDto>(item);
        }

        public async Task CreateAsync(CreateOrderItemDto dto)
        {
            var item = _mapper.Map<OrderItem>(dto);
            await _orderItemRepository.AddAsync(item);
        }

        public async Task UpdateAsync(UpdateOrderItemDto dto)
        {
            var item = _mapper.Map<OrderItem>(dto);
            await _orderItemRepository.UpdateAsync(item);
        }

        public async Task DeleteAsync(int id)
        {
            var item = await _orderItemRepository.GetByIdAsync(id);
            if (item != null)
            {
                await _orderItemRepository.DeleteAsync(item);
            }
        }
    }
}
