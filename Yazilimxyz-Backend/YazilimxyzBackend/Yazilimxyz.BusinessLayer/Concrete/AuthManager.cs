using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Yazilimxyz.BusinessLayer.Abstract;
using Yazilimxyz.DataAccessLayer.Context;
using Yazilimxyz.BusinessLayer.DTOs.Auth;
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
				// 1. Email zaten kayıtlı mı kontrolü
				if (await _userManager.FindByEmailAsync(dto.Email) is not null)
				{
					return new ResultUserDto
					{
						Success = false,
						Message = $"'{dto.Email}' zaten kayıtlı."
					};
				}

				// 2. AppUser oluştur
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
				{
					return new ResultUserDto
					{
						Success = false,
						Message = string.Join(" | ", result.Errors.Select(e => e.Description))
					};
				}

				// 3. Role göre ilgili tabloya kayıt
				switch (dto.Role)
				{
					case "Customer":
						var customer = new Customer
						{
							AppUserId = user.Id
						};
						_context.Customers.Add(customer);
						break;

					case "Merchant":
						var merchant = new Merchant
						{
							AppUserId = user.Id,
							CompanyName = dto.CompanyName ?? "", // opsiyonel
							Iban = dto.Iban ?? "",
							TaxNumber = dto.TaxNumber ?? "",
							CompanyAddress = dto.CompanyAddress ?? "",
							Phone = dto.Phone ?? ""
						};
						_context.Merchants.Add(merchant);
						break;

					case "AppAdmin":
						var admin = new AppAdmin
						{
							Id = user.Id, // IdentityUser'dan kalıtım aldıkları için ID aynı
							Name = user.Name,
							LastName = user.LastName,
							Email = user.Email,
							UserName = user.Email,
							IsActive = true
						};
						_context.AppAdmins.Add(admin);
						break;

					default:
						return new ResultUserDto
						{
							Success = false,
							Message = "Geçersiz rol türü."
						};
				}

				await _context.SaveChangesAsync();

				return new ResultUserDto
				{
					Success = true,
					Message = "Kayıt başarılı."
				};
			}
			catch (Exception ex)
			{
				return new ResultUserDto
				{
					Success = false,
					Message = ex.Message
				};
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

			string role = await _context.AppAdmins.AnyAsync(a => a.Id == user.Id) ? "AppAdmin" :
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
