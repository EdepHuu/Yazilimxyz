namespace Yazilimxyz.BusinessLayer.DTOs.CartItem
{
    public class CreateCartItemDto
    {
        public string UserId { get; set; }
        public int ProductVariantId { get; set; }
        public int Quantity { get; set; }
    }
}
