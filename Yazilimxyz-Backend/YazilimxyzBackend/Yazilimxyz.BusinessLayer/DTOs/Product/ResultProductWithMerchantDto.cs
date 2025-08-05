using Yazilimxyz.BusinessLayer.DTOs.AppUser;

namespace Yazilimxyz.BusinessLayer.DTOs.Product
{
    public class ResultProductWithMerchantDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public ResultAppUserDto AppUser { get; set; }
        public bool IsActive { get; set; }
    }
}
