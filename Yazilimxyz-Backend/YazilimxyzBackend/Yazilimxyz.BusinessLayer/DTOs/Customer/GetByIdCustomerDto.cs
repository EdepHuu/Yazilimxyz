using Yazilimxyz.BusinessLayer.DTOs.CustomerAddress;

namespace Yazilimxyz.BusinessLayer.DTOs.Customer
{
    public class GetByIdCustomerDto
    {
        public int Id { get; set; }
        public string AppUserId { get; set; }

        // AppUser bilgileri
        public string UserName { get; set; }
        public string Email { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string PhoneNumber { get; set; }

        // Address bilgileri
        public List<ResultCustomerAddressDto> Addresses { get; set; } = new List<ResultCustomerAddressDto>();
    }
}
