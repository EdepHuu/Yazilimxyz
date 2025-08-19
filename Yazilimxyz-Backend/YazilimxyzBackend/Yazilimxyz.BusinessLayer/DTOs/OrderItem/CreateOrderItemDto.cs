namespace Yazilimxyz.BusinessLayer.DTOs.OrderItem
{
    public class CreateOrderItemDto
    {
        public int ProductId { get; set; }
        public int ProductVariantId { get; set; } // renk/beden gibi varyant
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }




    }
}
