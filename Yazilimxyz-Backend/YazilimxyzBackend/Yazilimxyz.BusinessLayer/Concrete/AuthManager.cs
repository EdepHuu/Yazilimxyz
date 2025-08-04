using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Yazilimxyz.BusinessLayer.Abstract;
using Yazilimxyz.BusinessLayer.DTOs.Auth;
using Yazilimxyz.DataAccessLayer.Context;
using Yazilimxyz.EntityLayer.Entities;
using Yazilimxyz.InfrastructureLayer.Security;

namespace Yazilimxyz.BusinessLayer.Concrete
{
	public class AuthManager : IAuthService
	{
		private readonly UserManager<AppUser> _userManager;
		private readonly ITokenService _tokenService;
		private readonly AppDbContext _context;

		public AuthManager(UserManager<AppUser> userManager, ITokenService tokenService, AppDbContext context)
		{
			_userManager = userManager;
			_tokenService = tokenService;
			_context = context;
		}

		public async Task<ResultUserDto> RegisterAsync(RegisterDto dto)
		{
			try
			{
				if (await _userManager.FindByEmailAsync(dto.Email) is not null)
					return new ResultUserDto { Success = false, Message = $"'{dto.Email}' zaten kayıtlı." };

				var user = new AppUser
				{
					Name = dto.Name,
					LastName = dto.LastName,
					Email = dto.Email,
					UserName = dto.Email,
					PhoneNumber = dto.Phone
				};

				var result = await _userManager.CreateAsync(user, dto.Password);
				if (!result.Succeeded)
					return new ResultUserDto
					{
						Success = false,
						Message = string.Join(" | ", result.Errors.Select(e => e.Description))
					};

				switch (dto.Role)
				{
					case "Customer":
						_context.Customers.Add(new Customer { AppUserId = user.Id });
						break;

					case "Merchant":
						_context.Merchants.Add(new Merchant
						{
							AppUserId = user.Id,
							CompanyName = dto.CompanyName ?? "",
							Iban = dto.Iban ?? "",
							TaxNumber = dto.TaxNumber ?? "",
							CompanyAddress = dto.CompanyAddress ?? "",
							Phone = dto.Phone ?? ""
						});
						break;

					case "AppAdmin":
						_context.AppAdmins.Add(new AppAdmin
						{
							AppUserId = user.Id,
							Name = dto.Name,
							LastName = dto.LastName
						});
						break;

					default:
						return new ResultUserDto { Success = false, Message = "Geçersiz rol türü." };
				}

				await _context.SaveChangesAsync();

				return new ResultUserDto
				{
					Success = true,
					Message = "Kayıt başarılı",
					Name = user.Name,
					LastName = user.LastName,
					Email = user.Email,
					Role = dto.Role
				};
			}
			catch (Exception ex)
			{
				return new ResultUserDto { Success = false, Message = ex.Message };
			}
		}

		public async Task<ResultUserDto> LoginAsync(LoginDto dto)
		{
			var user = await _userManager.FindByEmailAsync(dto.Email);
			if (user == null || !await _userManager.CheckPasswordAsync(user, dto.Password))
			{
				return new ResultUserDto
				{
					Success = false,
					Message = "Email veya şifre hatalı."
				};
			}

			string role = await _context.AppAdmins.AnyAsync(a => a.AppUserId == user.Id) ? "AppAdmin" :
			  await _context.Merchants.AnyAsync(m => m.AppUserId == user.Id) ? "Merchant" :
			  "Customer";

			return new ResultUserDto
			{
				Success = true,
				Name = user.Name,
				LastName = user.LastName,
				Email = user.Email,
				Role = role,
				Token = _tokenService.CreateToken(user, role),
				Message = "Giriş başarılı"
			};
		}
	}
}
