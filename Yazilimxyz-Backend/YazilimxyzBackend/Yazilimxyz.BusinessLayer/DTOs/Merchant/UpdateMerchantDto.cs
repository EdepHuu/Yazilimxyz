using System.ComponentModel.DataAnnotations;

namespace Yazilimxyz.BusinessLayer.DTOs.Merchant
{
    public class UpdateMerchantDto
    {
        [Required]
        public int Id { get; set; }

        [Required]
        public string AppUserId { get; set; }

        [Required]
        [StringLength(100)]
        public string CompanyName { get; set; }

        [Required]
        [StringLength(26)]
        public string Iban { get; set; }

        [Required]
        [StringLength(11)]
        public string TaxNumber { get; set; }

        [Required]
        [StringLength(200)]
        public string CompanyAddress { get; set; }

        [Required]
        [Phone]
        [StringLength(15)]
        public string Phone { get; set; }
    }
}
