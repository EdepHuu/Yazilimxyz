namespace Yazilimxyz.BusinessLayer.DTOs.OrderItem
{
    public class UpdateOrderItemDto
    {
        public int OrderItemId { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }
    }
}
