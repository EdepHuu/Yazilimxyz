using Yazilimxyz.BusinessLayer.DTOs.CustomerAddress;

namespace Yazilimxyz.BusinessLayer.DTOs.Customer
{
    public class ResultCustomerWithAddressesDto
    {
        public int Id { get; set; }
        public string AppUserId { get; set; }
        public string UserName { get; set; }
        public string Email { get; set; }
        public int AddressCount { get; set; }

        // Bu müşteriyle ilişkili tüm adreslerin listesi
        public List<ResultCustomerAddressDto> Addresses { get; set; } = new();
    }
}
