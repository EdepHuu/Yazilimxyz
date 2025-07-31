namespace Yazilimxyz.BusinessLayer.DTOs.Customer
{
    public class ResultCustomerDto
    {
        public int Id { get; set; }
        public string AppUserId { get; set; }
        public string UserName { get; set; }
        public string Email { get; set; }
        public int AddressCount { get; set; }
    }
}
