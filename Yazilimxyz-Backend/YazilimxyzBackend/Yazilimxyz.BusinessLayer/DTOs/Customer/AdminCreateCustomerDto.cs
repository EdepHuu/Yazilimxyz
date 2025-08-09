using System.ComponentModel.DataAnnotations;

namespace Yazilimxyz.BusinessLayer.DTOs.Customer
{
	public class AdminCreateCustomerDto
	{
		[Required] public string AppUserId { get; set; }
	}
}
