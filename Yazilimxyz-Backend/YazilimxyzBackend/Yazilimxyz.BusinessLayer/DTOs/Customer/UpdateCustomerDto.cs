using System.ComponentModel.DataAnnotations;

namespace Yazilimxyz.BusinessLayer.DTOs.Customer
{
   public  class UpdateCustomerDto
    {
        [Required(ErrorMessage = "Id alanı zorunludur.")]
        public int Id { get; set; }

        [Required(ErrorMessage = "AppUserId alanı zorunludur.")]
        public string AppUserId { get; set; }
    }
}
