using System.ComponentModel.DataAnnotations;

namespace Yazilimxyz.BusinessLayer.DTOs.Customer
{
    public class CreateCustomerDto
    {
        [Required(ErrorMessage = "AppUserId alanı zorunludur.")]
        public string AppUserId { get; set; }
    }
}
