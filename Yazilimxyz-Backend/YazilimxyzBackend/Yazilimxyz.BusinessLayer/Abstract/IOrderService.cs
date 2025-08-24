using Core.Utilities.Results;
using Yazilimxyz.BusinessLayer.DTOs.Order;
using Yazilimxyz.EntityLayer.Enums;

namespace Yazilimxyz.BusinessLayer.Abstract
{
	public interface IOrderService
	{
		// Sepetten sipariş oluştur (kullanıcının açık sepeti alınır, kalemler o sepetten üretilir)
		Task<IDataResult<ResultOrderWithItemsDto>> CreateFromCartAsync(CreateOrderDto dto, string userId);

		// Kullanıcının sipariş listesi
		Task<IDataResult<List<ResultOrderDto>>> GetMyOrdersAsync(string userId);

		// Kullanıcının tek sipariş detayı (kalemler + adres)
		Task<IDataResult<ResultOrderWithItemsDto>> GetMyOrderDetailAsync(int orderId, string userId);

		// Admin / operasyon: sipariş güncelle
		Task<IResult> UpdateAsync(UpdateOrderDto dto);

		// Kullanıcı iptal (kargoya verilmeden)
		Task<IResult> CancelMyOrderAsync(int orderId, string userId);
		Task<IResult> ConfirmOrderAsync(int orderId, string userId);
	}
}
