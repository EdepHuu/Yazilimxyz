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

			// Stok kontrolü
			foreach (var ci in cartItems)
			{
				if (ci.Variant.Stock < ci.Quantity)
					return new ErrorDataResult<ResultOrderWithItemsDto>($"{ci.Variant.Product.Name} için stok yetersiz.");
			}

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

			// 🟩 Merchant bazlı gruplama (int → string dönüşümü ile)
			var groupedByMerchant = cartItems.GroupBy(ci => ci.Variant.Product.Merchant.AppUserId);

			foreach (var group in groupedByMerchant)
			{
				string merchantAppUserId = group.Key;

				var merchantOrder = new MerchantOrder
				{
					MerchantId = merchantAppUserId, // FK to AppUser.Id
					IsConfirmedByMerchant = false,
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

			// Kaydet
			var added = await _orderRepository.AddAsync(order);

			// 🟩 Stok güncelleme
			foreach (var ci in cartItems)
			{
				ci.Variant.Stock -= ci.Quantity;
				await _productVariantRepository.UpdateAsync(ci.Variant);
			}

			// 🟩 Sepeti temizle
			await _cartItemRepository.DeleteRangeAsync(cartItems);

			// 🟩 DTO dön
			var detailed = await _orderRepository.GetByIdWithItemsAsync(added.Id);
			var mapped = _mapper.Map<ResultOrderWithItemsDto>(detailed);
			return new SuccessDataResult<ResultOrderWithItemsDto>(mapped, "Sipariş başarıyla oluşturuldu.");
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

		// 4. Admin/Operasyon Güncelleme
		public async Task<IResult> UpdateAsync(int orderId, UpdateOrderDto dto)
		{
			var order = await _orderRepository.GetByIdAsync(orderId);
			if (order == null)
				return new ErrorResult("Sipariş bulunamadı.");

			order.Status = dto.Status;
			order.PaymentStatus = dto.PaymentStatus;
			order.ShippedAt = dto.ShippedAt;

			if (!string.IsNullOrWhiteSpace(dto.Note))
				order.Note = dto.Note;

			await _orderRepository.UpdateAsync(order);
			return new SuccessResult("Sipariş güncellendi.");
		}

		// 5. Kullanıcı Sipariş İptali
		public async Task<IResult> CancelMyOrderAsync(int orderId, string userId)
		{
			var order = await _orderRepository.GetByIdAsync(orderId);
			if (order == null || order.UserId != userId)
				return new ErrorResult("Sipariş bulunamadı.");

			if (order.Status >= OrderStatus.Shipped)
				return new ErrorResult("Kargoya verilen sipariş iptal edilemez.");

			order.Status = OrderStatus.Cancelled;
			await _orderRepository.UpdateAsync(order);
			return new SuccessResult("Sipariş iptal edildi.");
		}

		// 6. Siparişi Merchant Onaylar
		public async Task<IResult> ConfirmOrderAsync(int orderId, string merchantId)
		{
			var order = await _orderRepository.GetByIdWithItemsAsync(orderId);
			if (order == null)
				return new ErrorResult("Sipariş bulunamadı.");

			if (order.Status != OrderStatus.Pending)
				return new ErrorResult("Sadece bekleyen sipariş onaylanabilir.");

			foreach (var item in order.OrderItems)
			{
				if (item.ProductVariant?.Product?.MerchantId.ToString() != merchantId)
					return new ErrorResult("Bu siparişi onaylama yetkiniz yok.");
			}

			order.Status = OrderStatus.Confirmed;
			await _orderRepository.UpdateAsync(order);
			return new SuccessResult("Sipariş onaylandı.");
		}

		// 7. Kullanıcı: Siparişi bir ileri duruma taşır
		public async Task<IResult> AdvanceOrderStatusAsync(int orderId, string userId)
		{
			var order = await _orderRepository.GetByIdAsync(orderId);
			if (order == null || order.UserId != userId)
				return new ErrorResult("Sipariş bulunamadı.");

			if (order.Status == OrderStatus.Cancelled || order.Status == OrderStatus.Returned)
				return new ErrorResult("İptal edilen sipariş ilerletilemez.");

			OrderStatus next = order.Status switch
			{
				OrderStatus.Pending => OrderStatus.Confirmed,
				OrderStatus.Confirmed => OrderStatus.Processing,
				OrderStatus.Processing => OrderStatus.Shipped,
				OrderStatus.Shipped => OrderStatus.Delivered,
				_ => order.Status
			};

			if (next == order.Status)
				return new ErrorResult("Sipariş daha fazla ilerletilemez.");

			if (next == OrderStatus.Shipped)
				order.ShippedAt = DateTime.UtcNow;

			order.Status = next;
			await _orderRepository.UpdateAsync(order);

			return new SuccessResult($"Sipariş durumu '{next}' olarak güncellendi.");
		}

		// Yardımcı metot
		private static string GenerateOrderNumber()
		{
			return $"ORD-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..4].ToUpper()}";
		}
	}
}