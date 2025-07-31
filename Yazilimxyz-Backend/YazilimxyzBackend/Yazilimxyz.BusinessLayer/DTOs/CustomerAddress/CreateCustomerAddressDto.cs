using System.ComponentModel.DataAnnotations;

namespace Yazilimxyz.BusinessLayer.DTOs.CustomerAddress
{
    public class CreateCustomerAddressDto
    {
        [Required(ErrorMessage = "CustomerId alanı zorunludur.")]
        public int CustomerId { get; set; }

        [Required(ErrorMessage = "Adres başlığı zorunludur.")]
        [StringLength(100, ErrorMessage = "Adres başlığı en fazla 100 karakter olabilir.")]
        public string Title { get; set; }

        [Required(ErrorMessage = "Ad Soyad alanı zorunludur.")]
        [StringLength(150, ErrorMessage = "Ad Soyad en fazla 150 karakter olabilir.")]
        public string FullName { get; set; }

        [Required(ErrorMessage = "Telefon numarası zorunludur.")]
        [StringLength(20, ErrorMessage = "Telefon numarası en fazla 20 karakter olabilir.")]
        public string Phone { get; set; }

        [Required(ErrorMessage = "Adres alanı zorunludur.")]
        [StringLength(500, ErrorMessage = "Adres en fazla 500 karakter olabilir.")]
        public string Address { get; set; }

        [Required(ErrorMessage = "Şehir alanı zorunludur.")]
        [StringLength(50, ErrorMessage = "Şehir en fazla 50 karakter olabilir.")]
        public string City { get; set; }

        [Required(ErrorMessage = "İlçe alanı zorunludur.")]
        [StringLength(50, ErrorMessage = "İlçe en fazla 50 karakter olabilir.")]
        public string District { get; set; }

        [StringLength(10, ErrorMessage = "Posta kodu en fazla 10 karakter olabilir.")]
        public string PostalCode { get; set; }

        public bool IsDefault { get; set; } = false;
    }
}
