using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Yazilimxyz.BusinessLayer.DTOs.AppUser
{
	public class CreateAppUserDto
	{
		[Required(ErrorMessage = "Kullanıcı adı boş bırakılamaz.")]
		[StringLength(50, ErrorMessage = "Kullanıcı adı en fazla 50 karakter olmalıdır.")]
		public string UserName { get; set; }

		[Required(ErrorMessage = "Ad alanı boş bırakılamaz.")]
		[StringLength(50, ErrorMessage = "Ad en fazla 50 karakter olmalıdır.")]
		public string Name { get; set; }

		[Required(ErrorMessage = "Soyadı alanı boş bırakılamaz.")]
		[StringLength(50, ErrorMessage = "Soyadı en fazla 50 karakter olmalıdır.")]
		public string LastName { get; set; }

		[Required(ErrorMessage = "Email adresi boş bırakılamaz.")]
		[EmailAddress(ErrorMessage = "Geçerli bir email adresi giriniz.")]
		public string Email { get; set; }

		[Required(ErrorMessage = "Şifre alanı boş bırakılamaz.")]
		[StringLength(100, MinimumLength = 6, ErrorMessage = "Şifre en az 6, en fazla 100 karakter olmalıdır.")]
		public string Password { get; set; }
	}
}
