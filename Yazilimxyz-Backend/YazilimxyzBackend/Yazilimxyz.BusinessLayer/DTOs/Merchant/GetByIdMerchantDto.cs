using Yazilimxyz.BusinessLayer.DTOs.AppUser;

namespace Yazilimxyz.BusinessLayer.DTOs.Merchant
{
    public class GetByIdMerchantDto
    {
        public int Id { get; set; }
        public string AppUserId { get; set; }
		public ResultAppUserDto AppUser { get; set; }
        public string CompanyName { get; set; }
        public string Iban { get; set; }
        public string TaxNumber { get; set; }
        public string CompanyAddress { get; set; }
        public string Phone { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime? UpdatedDate { get; set; }
    }
}
