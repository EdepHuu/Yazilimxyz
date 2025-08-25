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
		private readonly IOrderItemRepository _orderItemRepository;
		private readonly ICartItemRepository _cartItemRepository;
		private readonly IProductVariantRepository _productVariantRepository;
		private readonly ICustomerAddressRepository _customerAddressRepository;
		private readonly IMapper _mapper;

		public OrderManager(
			IOrderRepository orderRepository,
			IOrderItemRepository orderItemRepository,
			ICartItemRepository cartItemRepository,
			IProductVariantRepository productVariantRepository,
			ICustomerAddressRepository customerAddressRepository,
			IMapper mapper)
		{
			_orderRepository = orderRepository;
			_orderItemRepository = orderItemRepository;
			_cartItemRepository = cartItemRepository;
			_productVariantRepository = productVariantRepository;
			_customerAddressRepository = customerAddressRepository;
			_mapper = mapper;
		}

		// 1. Sepetten Sipariş Oluştur
		public async Task<IDataResult<ResultOrderWithItemsDto>> CreateFromCartAsync(CreateOrderDto dto, string userId)
		{
			var cartItems = await _cartItemRepository.GetUserCartWithDetailsAsync(userId);
			if (!cartItems.Any())
				return new ErrorDataResult<ResultOrderWithItemsDto>("Sepetiniz boş.");

			var address = await _customerAddressRepository.GetByIdAsync(dto.ShippingAddressId);
			if (address == null)
				return new ErrorDataResult<ResultOrderWithItemsDto>("Adres bulunamadı.");

			decimal subTotal = cartItems.Sum(ci => ci.Variant.Product.BasePrice * ci.Quantity);
			decimal shippingFee = 50;
			decimal discount = 0;
			decimal total = subTotal + shippingFee - discount;

			var order = new Order
			{
				OrderNumber = GenerateOrderNumber(),
				UserId = userId,
				ShippingFee = shippingFee,
				DiscountAmount = discount,
				SubTotal = subTotal,
				TotalAmount = total,
				Status = OrderStatus.Pending,
				PaymentStatus = PaymentStatus.Pending,
				ShippingAddressId = dto.ShippingAddressId,
				ShippingAddress = address,
				Note = dto.Note,
				OrderItems = new List<OrderItem>(),
				MerchantOrders = new List<MerchantOrder>()
			};

			// AppUserId ile grupla
			var groupedByMerchant = cartItems.GroupBy(ci => ci.Variant.Product.Merchant.AppUserId);

			foreach (var group in groupedByMerchant)
			{
				string merchantAppUserId = group.Key;

				var merchantOrder = new MerchantOrder
				{
					MerchantId = merchantAppUserId, // burası artık string olacak
					IsConfirmedByMerchant = false,
					ConfirmedAt = null,
					MerchantOrderItems = new List<MerchantOrderItem>(),
					Items = new List<OrderItem>()
				};

				foreach (var ci in group)
				{
					var unitPrice = ci.Variant.Product.BasePrice;
					var orderItem = new OrderItem
					{
						ProductId = ci.Variant.ProductId,
						ProductVariantId = ci.ProductVariantId,
						Quantity = ci.Quantity,
						UnitPrice = unitPrice,
						TotalPrice = unitPrice * ci.Quantity,
						ProductName = ci.Variant.Product.Name,
						Size = ci.Variant.Size,
						Color = ci.Variant.Color
					};
					order.OrderItems.Add(orderItem);
					merchantOrder.Items.Add(orderItem);
				}

				order.MerchantOrders.Add(merchantOrder);
			}

			await _orderRepository.AddAsync(order);

			foreach (var ci in cartItems)
			{
				ci.Variant.Stock -= ci.Quantity;
				await _productVariantRepository.UpdateAsync(ci.Variant);
			}

			await _cartItemRepository.DeleteRangeAsync(cartItems);

			var resultDto = _mapper.Map<ResultOrderWithItemsDto>(order);
			return new SuccessDataResult<ResultOrderWithItemsDto>(resultDto, "Sipariş başarıyla oluşturuldu.");
		}

		// Helper
		private static string GenerateOrderNumber()
		{
			return $"ORD-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..4].ToUpper()}";
		}

		// 2. Sipariş Listesi
		public async Task<IDataResult<List<ResultOrderDto>>> GetMyOrdersAsync(string userId)
		{
			var orders = await _orderRepository.FindAsync(o => o.UserId == userId);
			var mapped = _mapper.Map<List<ResultOrderDto>>(orders);
			return new SuccessDataResult<List<ResultOrderDto>>(mapped);
		}

		// 3. Sipariş Detayı
		public async Task<IDataResult<ResultOrderWithItemsDto>> GetMyOrderDetailAsync(int orderId, string userId)
		{
			var order = await _orderRepository.GetByIdWithItemsAsync(orderId);
			if (order == null || order.UserId != userId)
				return new ErrorDataResult<ResultOrderWithItemsDto>("Sipariş bulunamadı.");

			var mapped = _mapper.Map<ResultOrderWithItemsDto>(order);
			return new SuccessDataResult<ResultOrderWithItemsDto>(mapped);
		}

		public async Task<IDataResult<List<ResultOrderWithItemsDto>>> GetMyMerchantOrdersAsync(string merchantAppUserId)
		{
			var orders = await _orderRepository.GetOrdersByMerchantAppUserIdAsync(merchantAppUserId);
			var mapped = _mapper.Map<List<ResultOrderWithItemsDto>>(orders);
			return new SuccessDataResult<List<ResultOrderWithItemsDto>>(mapped);
		}

		// 4. Siparişi Merchant Onaylar
		public async Task<IResult> ConfirmOrderAsync(int orderId, string merchantId)
		{
			var order = await _orderRepository.GetByIdWithItemsAsync(orderId);
			if (order == null)
				return new ErrorResult("Sipariş bulunamadı.");

			if (order.Status != OrderStatus.Pending)
				return new ErrorResult("Sadece bekleyen sipariş onaylanabilir.");

			// Siparişte bu merchant’a ait ürün var mı? (Yani işlem yapma yetkisi var mı?)
			bool hasAuthorizedItem = order.OrderItems.Any(item =>
				item.ProductVariant?.Product?.AppUserId == merchantId);

			if (!hasAuthorizedItem)
				return new ErrorResult("Bu siparişte size ait ürün bulunmamaktadır.");

			// İlgili MerchantOrder'ı bul
			var merchantOrder = order.MerchantOrders.FirstOrDefault(mo => mo.MerchantId == merchantId);
			if (merchantOrder == null)
				return new ErrorResult("Bu sipariş size ait değil.");

			if (merchantOrder.IsConfirmedByMerchant)
				return new ErrorResult("Bu sipariş zaten onaylanmış.");

			// MerchantOrder'ı onayla
			merchantOrder.IsConfirmedByMerchant = true;
			merchantOrder.ConfirmedAt = DateTime.UtcNow;

			await _orderRepository.UpdateAsync(order);

			// Tüm merchantlar onayladıysa
			bool allConfirmed = order.MerchantOrders.All(mo => mo.IsConfirmedByMerchant);

			// Kaç farklı merchant var (AppUserId olarak)
			int distinctMerchantCount = order.MerchantOrders
				.Select(mo => mo.MerchantId)
				.Distinct()
				.Count();

			bool isSingleMerchant = distinctMerchantCount == 1;

			if (allConfirmed)
			{
				order.ConfirmedAt = DateTime.UtcNow;

				if (isSingleMerchant)
				{
					order.Status = OrderStatus.Delivered;
					order.DeliveredAt = DateTime.UtcNow;
				}
				else
				{
					order.Status = OrderStatus.Delivered;
					order.DeliveredAt = DateTime.UtcNow;
				}

				await _orderRepository.UpdateAsync(order);
			}

			return new SuccessResult("Sipariş onaylandı.");
		}

		public async Task<IResult> UpdateAsync(int orderId, UpdateOrderDto dto)
		{
			var order = await _orderRepository.GetByIdAsync(orderId);
			if (order == null)
				return new ErrorResult("Sipariş bulunamadı.");


			order.Status = dto.Status;
			order.PaymentStatus = dto.PaymentStatus;
			order.Note = dto.Note;


			await _orderRepository.UpdateAsync(order);
			return new SuccessResult("Sipariş güncellendi.");
		}

		public async Task<IResult> CancelMyOrderAsync(int orderId, string userId)
		{
			var order = await _orderRepository.GetByIdAsync(orderId);
			if (order == null || order.UserId != userId)
				return new ErrorResult("Sipariş bulunamadı.");

			if (order.Status != OrderStatus.Pending)
				return new ErrorResult("Yalnızca bekleyen siparişler iptal edilebilir.");

			order.Status = OrderStatus.Cancelled;
			order.CancelledAt = DateTime.UtcNow;
			await _orderRepository.UpdateAsync(order);

			return new SuccessResult("Sipariş iptal edildi.");
		}

		public async Task<IResult> CancelOrderByMerchantAsync(int orderId, string merchantId)
		{
			var order = await _orderRepository.GetByIdWithItemsAsync(orderId);
			if (order == null)
				return new ErrorResult("Sipariş bulunamadı.");

			if (order.Status == OrderStatus.Cancelled)
				return new ErrorResult("Bu sipariş zaten iptal edilmiş.");

			var merchantOrder = order.MerchantOrders.FirstOrDefault(mo => mo.MerchantId == merchantId);
			if (merchantOrder == null)
				return new ErrorResult("Bu sipariş size ait değil.");

			order.Status = OrderStatus.Cancelled;
			order.CancelledAt = DateTime.UtcNow;
			await _orderRepository.UpdateAsync(order);

			return new SuccessResult("Sipariş iptal edildi.");
		}
	}
}