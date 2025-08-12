using AutoMapper;
using Core.Aspects.Autofac.Caching;
using Core.Utilities.Results;
using Yazilimxyz.BusinessLayer.Abstract;
using Yazilimxyz.BusinessLayer.Constans;
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

        [CacheAspect]
        public async Task<IDataResult<ResultOrderDto>> GetByIdAsync(int id)
        {
            var order = await _orderRepository.GetByIdAsync(id);
            if (order == null)
                return new ErrorDataResult<ResultOrderDto>(null, Messages.OrderNotFound);

            return new SuccessDataResult<ResultOrderDto>(_mapper.Map<ResultOrderDto>(order), Messages.OrderRetrieved);
        }

        [CacheAspect]
        public async Task<IDataResult<ResultOrderDto>> GetByOrderNumberAsync(string orderNumber)
        {
            var order = await _orderRepository.GetByOrderNumberAsync(orderNumber);
            if (order == null)
                return new ErrorDataResult<ResultOrderDto>(null, Messages.OrderNotFound);

            return new SuccessDataResult<ResultOrderDto>(_mapper.Map<ResultOrderDto>(order), Messages.OrderRetrieved);
        }

        [CacheAspect]
        public async Task<IDataResult<ResultOrderWithItemsDto>> GetWithItemAsync(int id)
        {
            var order = await _orderRepository.GetWithItemAsync(id);
            if (order == null)
                return new ErrorDataResult<ResultOrderWithItemsDto>(null, Messages.OrderNotFound);

            return new SuccessDataResult<ResultOrderWithItemsDto>(_mapper.Map<ResultOrderWithItemsDto>(order), Messages.OrderRetrieved);
        }

        [CacheAspect]
        public async Task<IDataResult<List<ResultOrderDto>>> GetAllAsync()
        {
            var orders = await _orderRepository.GetAllAsync();
            return new SuccessDataResult<List<ResultOrderDto>>(_mapper.Map<List<ResultOrderDto>>(orders), Messages.OrdersListed);
        }

        [CacheAspect]
        public async Task<IDataResult<List<ResultOrderDto>>> GetByUserIdAsync(string userId)
        {
            var orders = await _orderRepository.GetByUserIdAsync(userId);
            return new SuccessDataResult<List<ResultOrderDto>>(_mapper.Map<List<ResultOrderDto>>(orders), Messages.OrdersListed);
        }

        [CacheAspect]
        public async Task<IDataResult<List<ResultOrderDto>>> GetByStatusAsync(OrderStatus status)
        {
            var orders = await _orderRepository.GetByStatusAsync(status);
            return new SuccessDataResult<List<ResultOrderDto>>(_mapper.Map<List<ResultOrderDto>>(orders), Messages.OrdersListed);
        }

        [CacheAspect]
        public async Task<IDataResult<List<ResultOrderDto>>> GetByPaymentStatusAsync(PaymentStatus status)
        {
            var orders = await _orderRepository.GetByPaymentStatusAsync(status);
            return new SuccessDataResult<List<ResultOrderDto>>(_mapper.Map<List<ResultOrderDto>>(orders), Messages.OrdersListed);
        }

        [CacheRemoveAspect("IOrderService.Get")]
        public async Task<IResult> CreateAsync(CreateOrderDto dto)
        {
            try
            {
                ValidateOrderDto(dto);
                var order = _mapper.Map<Order>(dto);
                await _orderRepository.AddAsync(order);
                return new SuccessResult(Messages.OrderAdded);
            }
            catch (Exception ex)
            {
                return new ErrorResult($"{Messages.OrderNotAdded} - {ex.Message}");
            }
        }

        [CacheRemoveAspect("IOrderService.Get")]
        public async Task<IResult> UpdateAsync(UpdateOrderDto dto)
        {
            try
            {
                ValidateOrderDto(dto);

                var order = await _orderRepository.GetByIdAsync(dto.Id);
                if (order == null)
                    return new ErrorResult(Messages.OrderNotFound);

                _mapper.Map(dto, order);
                await _orderRepository.UpdateAsync(order);
                return new SuccessResult(Messages.OrderUpdated);
            }
            catch (Exception ex)
            {
                return new ErrorResult($"{Messages.OrderNotUpdated} - {ex.Message}");
            }
        }

        [CacheRemoveAspect("IOrderService.Get")]
        public async Task<IResult> DeleteAsync(int id)
        {
            var existing = await _orderRepository.GetByIdAsync(id);
            if (existing == null)
                return new ErrorResult(Messages.OrderNotFound);

            await _orderRepository.DeleteAsync(id);
            return new SuccessResult(Messages.OrderDeleted);
        }

        private void ValidateOrderDto(dynamic dto)
        {
            if (dto == null)
                throw new ArgumentException("Sipariş bilgileri boş olamaz.");

            if (string.IsNullOrWhiteSpace(dto.UserId))
                throw new ArgumentException("Kullanıcı ID zorunludur.");

            if (string.IsNullOrWhiteSpace(dto.OrderNumber))
                throw new ArgumentException("Sipariş numarası zorunludur.");

            if (dto.TotalAmount <= 0)
                throw new ArgumentException("Toplam tutar sıfırdan büyük olmalıdır.");

            if (dto.Status < OrderStatus.Pending || dto.Status > OrderStatus.Cancelled)
                throw new ArgumentException("Geçersiz sipariş durumu.");

            if (dto.PaymentStatus < PaymentStatus.Pending || dto.PaymentStatus > PaymentStatus.Refunded)
                throw new ArgumentException("Geçersiz ödeme durumu.");

            if (string.IsNullOrWhiteSpace(dto.ShippingAddressLine))
                throw new ArgumentException("Teslimat adresi zorunludur.");

            if (string.IsNullOrWhiteSpace(dto.ShippingCity))
                throw new ArgumentException("Teslimat şehri zorunludur.");

            if (string.IsNullOrWhiteSpace(dto.ShippingDistrict))
                throw new ArgumentException("Teslimat ilçesi zorunludur.");
        }
    }

}