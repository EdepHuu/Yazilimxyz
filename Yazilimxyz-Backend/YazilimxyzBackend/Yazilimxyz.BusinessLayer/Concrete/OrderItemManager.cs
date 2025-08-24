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

		public async Task<IDataResult<List<ResultOrderItemDto>>> GetByOrderIdAsync(int orderId)
		{
			var items = await _orderItemRepository.GetByOrderIdAsync(orderId);
			var result = _mapper.Map<List<ResultOrderItemDto>>(items);
			return new SuccessDataResult<List<ResultOrderItemDto>>(result);
		}
	}
}
