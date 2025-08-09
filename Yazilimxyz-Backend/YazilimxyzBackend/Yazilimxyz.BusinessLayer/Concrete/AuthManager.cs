using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Yazilimxyz.BusinessLayer.Abstract;
using Yazilimxyz.BusinessLayer.DTOs.Auth;
using Yazilimxyz.BusinessLayer.DTOs.Merchant;
using Yazilimxyz.DataAccessLayer.Context;
using Yazilimxyz.EntityLayer.Entities;
using Yazilimxyz.InfrastructureLayer.Security;

namespace Yazilimxyz.BusinessLayer.Concrete
{
	public class AuthManager : IAuthService
	{
		private readonly UserManager<AppUser> _userManager;
		private readonly ITokenService _tokenService;
		private readonly ICustomerService _customerService;
		private readonly IMerchantService _merchantService;
		private readonly AppDbContext _db;

		public AuthManager(
			UserManager<AppUser> userManager,
			ITokenService tokenService,
			ICustomerService customerService,
			IMerchantService merchantService,
			AppDbContext db)
		{
			_userManager = userManager;
			_tokenService = tokenService;
			_customerService = customerService;
			_merchantService = merchantService;
			_db = db;
		}

		public async Task<ResultUserDto> RegisterAsync(RegisterDto dto)
		{
			if (dto == null)
			{
				return Fail("Geçersiz istek.");
			}

			if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
			{
				return Fail("Email ve şifre zorunludur.");
			}

			var isCustomer = string.Equals(dto.Role, "Customer", StringComparison.OrdinalIgnoreCase);
			var isMerchant = string.Equals(dto.Role, "Merchant", StringComparison.OrdinalIgnoreCase);
			if (!isCustomer && !isMerchant)
			{
				return Fail("Geçersiz rol. Sadece 'Customer' veya 'Merchant' kayıt olabilir.");
			}

			// ---- CUSTOMER: merchant alanları GELİRSE reddet ----
			if (isCustomer)
			{
				if (!string.IsNullOrWhiteSpace(dto.CompanyName))
				{
					return Fail("Customer kaydında şirket adı gönderilemez.");
				}
				if (!string.IsNullOrWhiteSpace(dto.Iban))
				{
					return Fail("Customer kaydında IBAN gönderilemez.");
				}
				if (!string.IsNullOrWhiteSpace(dto.TaxNumber))
				{
					return Fail("Customer kaydında vergi numarası gönderilemez.");
				}
				if (!string.IsNullOrWhiteSpace(dto.CompanyAddress))
				{
					return Fail("Customer kaydında şirket adresi gönderilemez.");
				}
			}

			// ---- MERCHANT: merchant alanları ZORUNLU ----
			if (isMerchant)
			{
				if (string.IsNullOrWhiteSpace(dto.CompanyName)) return Fail("Şirket adı zorunludur.");
				if (string.IsNullOrWhiteSpace(dto.Iban)) return Fail("IBAN zorunludur.");
				if (string.IsNullOrWhiteSpace(dto.TaxNumber)) return Fail("Vergi numarası zorunludur.");
				if (string.IsNullOrWhiteSpace(dto.CompanyAddress)) return Fail("Şirket adresi zorunludur.");
				if (string.IsNullOrWhiteSpace(dto.Phone)) return Fail("Telefon zorunludur.");
			}

			var exists = await _userManager.FindByEmailAsync(dto.Email);
			if (exists != null)
			{
				return Fail($"'{dto.Email}' zaten kayıtlı.");
			}

			// AppUser oluştur (admin kayıt yolu kapalı)
			var user = new AppUser
			{
				Name = dto.Name,
				LastName = dto.LastName,
				Email = dto.Email,
				UserName = dto.Email,
				PhoneNumber = dto.Phone, // her iki rolde de serbest/zorunlu (Merchant’ta zorunlu kontrolü yukarıda)
				IsAdmin = false,
				CreatedAt = DateTime.UtcNow
			};

			var createRes = await _userManager.CreateAsync(user, dto.Password);
			if (!createRes.Succeeded)
			{
				return Fail(string.Join(" | ", createRes.Errors.Select(e => e.Description)));
			}

			try
			{
				if (isCustomer)
				{
					// Customer için domain kaydı
					await _customerService.CreateForUserAsync(user.Id);
				}
				else // Merchant
				{
					// Merchant için domain kaydı (alanlar zorunlu kontrol edildi)
					var merchantDto = new CreateMerchantDto
					{
						AppUserId = user.Id,
						CompanyName = dto.CompanyName!,
						Iban = dto.Iban!,
						TaxNumber = dto.TaxNumber!,
						CompanyAddress = dto.CompanyAddress!,
						Phone = dto.Phone!
					};

					await _merchantService.CreateForUserAsync(merchantDto);
				}

				return new ResultUserDto
				{
					Success = true,
					Message = "Kayıt başarılı.",
					Name = user.Name,
					LastName = user.LastName,
					Email = user.Email,
					Role = dto.Role,
					Token = _tokenService.CreateToken(user, dto.Role)
				};
			}
			catch (Exception ex)
			{
				// domain oluşturma başarısızsa AppUser'ı geri al
				await _userManager.DeleteAsync(user);
				return Fail(ex.Message);
			}
		}

		public async Task<ResultUserDto> LoginAsync(LoginDto dto)
		{
			if (dto == null || string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
			{
				return Fail("Email ve şifre zorunludur.");
			}

			var user = await _userManager.FindByEmailAsync(dto.Email);
			if (user == null)
			{
				return Fail("Email veya şifre hatalı.");
			}

			var passOk = await _userManager.CheckPasswordAsync(user, dto.Password);
			if (!passOk)
			{
				return Fail("Email veya şifre hatalı.");
			}

			// Rol tespiti
			string role;
			if (user.IsAdmin)
			{
				role = "AppAdmin";
			}
			else
			{
				// Merchant / Customer kontrolü
				var isMerchant = await _db.Merchants.AnyAsync(m => m.AppUserId == user.Id);
				if (isMerchant)
				{
					role = "Merchant";
				}
				else
				{
					var isCustomer = await _db.Customers.AnyAsync(c => c.AppUserId == user.Id);
					role = isCustomer ? "Customer" : "User";
				}
			}

			return new ResultUserDto
			{
				Success = true,
				Message = "Giriş başarılı.",
				Name = user.Name,
				LastName = user.LastName,
				Email = user.Email,
				Role = role,
				Token = _tokenService.CreateToken(user, role)
			};
		}

		private static ResultUserDto Fail(string msg) => new()
		{
			Success = false,
			Message = msg
		};
	}
}
