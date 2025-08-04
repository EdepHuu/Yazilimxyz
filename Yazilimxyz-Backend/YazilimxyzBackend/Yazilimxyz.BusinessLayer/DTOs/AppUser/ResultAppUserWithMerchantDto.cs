namespace Yazilimxyz.BusinessLayer.DTOs.AppUser
{
   public class ResultAppUserWithMerchantDto
    {
        // AppUser alanları
        public string Id { get; set; }
        public string UserName { get; set; }
        public string Name { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public DateTime CreatedAt { get; set; }

        // Merchant alanları
        public int MerchantId { get; set; }
        public string CompanyName { get; set; }
        public string Iban { get; set; }
        public string TaxNumber { get; set; }
        public string CompanyAddress { get; set; }
        public string MerchantPhone { get; set; }

    }
}
