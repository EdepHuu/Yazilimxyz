namespace Yazilimxyz.BusinessLayer.DTOs.CartItem
{
    public class UpdateCartItemDto
    {
        public int Id { get; set; } 
        public string UserId { get; set; }
        public int ProductVariantId { get; set; }
        public int Quantity { get; set; }
    }
}
