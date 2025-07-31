using AutoMapper;
using Yazilimxyz.BusinessLayer.Abstract;
using Yazilimxyz.BusinessLayer.DTOs.Order;
using Yazilimxyz.EntityLayer.Entities;

namespace Yazilimxyz.BusinessLayer.Concrete
{
    public class OrderManager : IOrderService
    {
        private readonly IOrderRepository _orderRepository;
        private readonly IMapper _mapper;

        public OrderManager(IOrderRepository orderRepository, IMapper mapper)
        {
            _orderRepository = orderRepository;
            _mapper = mapper;
        }

        public async Task<List<ResultOrderDto>> GetAllAsync()
        {
            var orders = await _orderRepository.GetAllAsync();
            return _mapper.Map<List<ResultOrderDto>>(orders);
        }

        public async Task<ResultOrderDto> GetByIdAsync(int id)
        {
            var order = await _orderRepository.GetByIdAsync(id);
            return _mapper.Map<ResultOrderDto>(order);
        }

        public async Task CreateAsync(CreateOrderDto dto)
        {
            var order = _mapper.Map<Order>(dto);
            await _orderRepository.AddAsync(order);
        }

        public async Task UpdateAsync(UpdateOrderDto dto)
        {
            var order = _mapper.Map<Order>(dto);
            await _orderRepository.UpdateAsync(order);
        }

        public async Task DeleteAsync(int id)
        {
            var order = await _orderRepository.GetByIdAsync(id);
            if (order != null)
            {
                await _orderRepository.DeleteAsync(order);
            }
        }
    }
}
