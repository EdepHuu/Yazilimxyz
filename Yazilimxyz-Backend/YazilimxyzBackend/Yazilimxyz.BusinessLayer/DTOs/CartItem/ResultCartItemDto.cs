using Yazilimxyz.BusinessLayer.DTOs.AppUser;
using Yazilimxyz.BusinessLayer.DTOs.ProductVariant;

namespace Yazilimxyz.BusinessLayer.DTOs.CartItem
{
    public class ResultCartItemDto
    {
        public int Id { get; set; }
        public string UserId { get; set; }
        public int ProductVariantId { get; set; }
        public int Quantity { get; set; }
        public ResultAppUserDto AppUser { get; set; }
        public ResultProductVariantDto Variant { get; set; }
    }
}
