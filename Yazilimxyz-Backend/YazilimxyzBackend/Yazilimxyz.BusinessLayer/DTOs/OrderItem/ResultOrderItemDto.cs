namespace Yazilimxyz.BusinessLayer.DTOs.OrderItem
{
    public class ResultOrderItemDto
    {
        public int OrderItemId { get; set; }
        public int OrderId { get; set; }
        public string OrderNumber { get; set; }
        public int ProductId { get; set; }
        public int ProductVariantId { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }

        // Sipariş anındaki ürün bilgileri
        public string ProductName { get; set; }
        public string Size { get; set; }
        public string Color { get; set; }

        // Ek bilgiler (join'den gelecek)
        public string CurrentProductName { get; set; }
        public decimal CurrentProductPrice { get; set; }
        public bool IsProductActive { get; set; }
    }
}
