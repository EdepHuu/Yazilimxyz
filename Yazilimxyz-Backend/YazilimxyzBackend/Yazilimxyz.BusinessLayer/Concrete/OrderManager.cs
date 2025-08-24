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
		private readonly IOrderItemRepository _orderItemRepository;   // çoğunlukla gerekmez; cascade ile eklenir
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

		// -----------------------------
		// 1) Sepetten Sipariş Oluşturma
		// -----------------------------
		public async Task<IDataResult<ResultOrderWithItemsDto>> CreateFromCartAsync(CreateOrderDto dto, string userId)
		{
			// 1. Sepeti (tüm include’larıyla) çek
			var cartItems = await _cartItemRepository.GetUserCartWithDetailsAsync(userId);
			if (!cartItems.Any())
				return new ErrorDataResult<ResultOrderWithItemsDto>("Sepetiniz boş.");

			// 2. Adresi doğrula (kullanıcıya ait mi kontrol edilebilir)
			var address = await _customerAddressRepository.GetByIdAsync(dto.ShippingAddressId);
			if (address == null)
				return new ErrorDataResult<ResultOrderWithItemsDto>("Adres bulunamadı.");
			// TODO: adresin gerçekten bu kullanıcıya ait olduğunu doğrula (modeline göre)

			// 3. Stok kontrolü
			foreach (var ci in cartItems)
			{
				if (ci.Variant.Stock < ci.Quantity)
					return new ErrorDataResult<ResultOrderWithItemsDto>($"{ci.Variant.Product.Name} - {ci.Variant.Size}/{ci.Variant.Color} için yeterli stok yok.");
			}

			// 4. Tutarları hesapla
			decimal subTotal = cartItems.Sum(ci => ci.Variant.Product.BasePrice * ci.Quantity);
			decimal total = subTotal + dto.ShippingFee - dto.DiscountAmount;

			// 5. Order oluştur
			var order = new Order
			{
				OrderNumber = GenerateOrderNumber(),
				UserId = userId,
				ShippingFee = dto.ShippingFee,
				DiscountAmount = dto.DiscountAmount,
				SubTotal = subTotal,
				TotalAmount = total,
				Status = OrderStatus.Pending,
				PaymentStatus = PaymentStatus.Pending,
				ShippingAddressId = dto.ShippingAddressId,
				ShippingAddress = address,
				Note = dto.Note                     // eklendi
			};

			// 6. OrderItem’ları sepetten üret
			foreach (var ci in cartItems)
			{
				var unit = ci.Variant.Product.BasePrice;
				var oi = new OrderItem
				{
					ProductId = ci.Variant.ProductId,
					ProductVariantId = ci.ProductVariantId,
					Quantity = ci.Quantity,
					UnitPrice = unit,
					TotalPrice = unit * ci.Quantity,

					// snapshot
					ProductName = ci.Variant.Product.Name,
					Size = ci.Variant.Size,
					Color = ci.Variant.Color
				};
				order.OrderItems.Add(oi);
			}

			// 7. Kaydet (Order + Items)
			var added = await _orderRepository.AddAsync(order);

			// 8. Stok düş ve sepeti temizle
			foreach (var ci in cartItems)
			{
				ci.Variant.Stock -= ci.Quantity;
				await _productVariantRepository.UpdateAsync(ci.Variant);
			}
			await _cartItemRepository.DeleteRangeAsync(cartItems);

			// 9. Sonuç DTO
			// (güncel halini include’lu çekmek istersen _orderRepository.GetByIdWithItemsAsync kullan)
			var detailed = await _orderRepository.GetByIdWithItemsAsync(added.Id);
			var dtoResult = _mapper.Map<ResultOrderWithItemsDto>(detailed);
			return new SuccessDataResult<ResultOrderWithItemsDto>(dtoResult, "Sipariş oluşturuldu.");
		}

		// -----------------------------
		// 2) Kullanıcının Sipariş Listesi
		// -----------------------------
		public async Task<IDataResult<List<ResultOrderDto>>> GetMyOrdersAsync(string userId)
		{
			var orders = await _orderRepository.FindAsync(x => x.UserId == userId);
			// İstersen tarihe göre sırala: orders = orders.OrderByDescending(o => o.CreatedDate);
			var mapped = _mapper.Map<List<ResultOrderDto>>(orders);
			return new SuccessDataResult<List<ResultOrderDto>>(mapped);
		}

		// -----------------------------
		// 3) Kullanıcının Sipariş Detayı
		// -----------------------------
		public async Task<IDataResult<ResultOrderWithItemsDto>> GetMyOrderDetailAsync(int orderId, string userId)
		{
			var order = await _orderRepository.GetByIdWithItemsAsync(orderId);
			if (order == null || order.UserId != userId)
				return new ErrorDataResult<ResultOrderWithItemsDto>("Sipariş bulunamadı.");

			var mapped = _mapper.Map<ResultOrderWithItemsDto>(order);
			return new SuccessDataResult<ResultOrderWithItemsDto>(mapped);
		}

		// -----------------------------
		// 4) Admin/Operasyon Güncelleme
		// -----------------------------
		public async Task<IResult> UpdateAsync(UpdateOrderDto dto)
		{
			var order = await _orderRepository.GetByIdAsync(dto.OrderId);
			if (order == null) return new ErrorResult("Sipariş bulunamadı.");

			order.Status = dto.Status;
			order.PaymentStatus = dto.PaymentStatus;
			order.ShippedAt = dto.ShippedAt;
			if (!string.IsNullOrWhiteSpace(dto.Note))
				order.Note = dto.Note;

			await _orderRepository.UpdateAsync(order);
			return new SuccessResult("Sipariş güncellendi.");
		}

		// -----------------------------
		// 5) Kullanıcı İptali
		// -----------------------------
		public async Task<IResult> CancelMyOrderAsync(int orderId, string userId)
		{
			var order = await _orderRepository.GetByIdAsync(orderId);
			if (order == null || order.UserId != userId)
				return new ErrorResult("Sipariş bulunamadı.");

			if (order.Status >= OrderStatus.Shipped)
				return new ErrorResult("Kargoya verilen sipariş iptal edilemez.");

			order.Status = OrderStatus.Cancelled;
			await _orderRepository.UpdateAsync(order);

			// (İsteğe bağlı) stok iadesi ve ödeme iadesi akışı burada ele alınabilir.
			return new SuccessResult("Sipariş iptal edildi.");
		}

		private static string GenerateOrderNumber()
		{
			// Ör: ORD-20250824-7F3A
			return $"ORD-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..4].ToUpper()}";
		}

		public async Task<IResult> ConfirmOrderAsync(int orderId, string userId)
		{
			var order = await _orderRepository.GetByIdAsync(orderId);
			if (order == null)
				return new ErrorResult("Sipariş bulunamadı.");

			// Order must belong to this user (merchant check)
			if (order.UserId != userId)
				return new ErrorResult("Bu siparişi onaylama yetkiniz yok.");

			if (order.Status != OrderStatus.Pending)
				return new ErrorResult("Sadece beklemede olan siparişler onaylanabilir.");

			order.Status = OrderStatus.Confirmed;
			await _orderRepository.UpdateAsync(order);

			return new SuccessResult("Sipariş onaylandı.");
		}

	}
}