using AutoMapper;
using Yazilimxyz.BusinessLayer.Abstract;
using Yazilimxyz.BusinessLayer.DTOs.Order;
using Yazilimxyz.DataAccessLayer.Abstract;
using Yazilimxyz.EntityLayer.Entities;
using Yazilimxyz.EntityLayer.Enums;

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

        public async Task<ResultOrderDto?> GetByIdAsync(int id)
        {
            var order = await _orderRepository.GetByIdAsync(id);
            return _mapper.Map<ResultOrderDto>(order);
        }

        public async Task<ResultOrderDto?> GetByOrderNumberAsync(string orderNumber)
        {
            var order = await _orderRepository.GetByOrderNumberAsync(orderNumber);
            return _mapper.Map<ResultOrderDto>(order);
        }

        public async Task<ResultOrderWithItemsDto?> GetWithItemAsync(int id)
        {
            var order = await _orderRepository.GetWithItemAsync(id);
            return _mapper.Map<ResultOrderWithItemsDto>(order);
        }

        public async Task<List<ResultOrderDto>> GetAllAsync()
        {
            var orders = await _orderRepository.GetAllAsync();
            return _mapper.Map<List<ResultOrderDto>>(orders);
        }

        public async Task<List<ResultOrderDto>> GetByUserIdAsync(string userId)
        {
            var orders = await _orderRepository.GetByUserIdAsync(userId);
            return _mapper.Map<List<ResultOrderDto>>(orders);
        }

        public async Task<List<ResultOrderDto>> GetByStatusAsync(OrderStatus status)
        {
            var orders = await _orderRepository.GetByStatusAsync(status);
            return _mapper.Map<List<ResultOrderDto>>(orders);
        }

        public async Task<List<ResultOrderDto>> GetByPaymentStatusAsync(PaymentStatus status)
        {
            var orders = await _orderRepository.GetByPaymentStatusAsync(status);
            return _mapper.Map<List<ResultOrderDto>>(orders);
        }

        public async Task CreateAsync(CreateOrderDto dto)
        {
            var order = _mapper.Map<Order>(dto);
            await _orderRepository.AddAsync(order);
        }

        public async Task UpdateAsync(UpdateOrderDto dto)
        {
            var order = await _orderRepository.GetByIdAsync(dto.Id);
            if (order != null)
            {
                _mapper.Map(dto, order);
                await _orderRepository.UpdateAsync(order);
            }
        }

        public async Task DeleteAsync(int id)
        {
            await _orderRepository.DeleteAsync(id);
        }
    }
}
