using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Yazilimxyz.DataAccessLayer.Abstract;
using Yazilimxyz.DataAccessLayer.Context;
using Yazilimxyz.EntityLayer.Entities;

namespace Yazilimxyz.DataAccessLayer.Concrete
{
	public class AppAdminRepository : IAppAdminRepository
	{
		private readonly UserManager<AppUser> _userManager;
		private readonly AppDbContext _context;

		public AppAdminRepository(UserManager<AppUser> userManager, AppDbContext context)
		{
			_userManager = userManager;
			_context = context;
		}

		public async Task<AppAdmin?> GetByIdAsync(string id)
		{
			return await _context.AppAdmins
				.Include(x => x.AppUser)
				.FirstOrDefaultAsync(x => x.AppUserId == id);
		}

		public async Task<AppAdmin?> GetByEmailAsync(string email)
		{
			var user = await _userManager.FindByEmailAsync(email);
			if (user == null) return null;
			return await _context.AppAdmins
				.Include(x => x.AppUser)
				.FirstOrDefaultAsync(x => x.AppUserId == user.Id);
		}

		public async Task<IEnumerable<AppAdmin>> GetAllActiveAsync()
		{
			return await _context.AppAdmins
				.Include(x => x.AppUser)
				.Where(a => a.IsActive)
				.ToListAsync();
		}

		public async Task<AppAdmin?> CreateAsync(AppAdmin admin, string password)
		{
			var appUser = admin.AppUser;
			var result = await _userManager.CreateAsync(appUser, password);
			if (!result.Succeeded)
				return null;

			admin.AppUserId = appUser.Id;
			_context.AppAdmins.Add(admin);
			await _context.SaveChangesAsync();
			return admin;
		}

		public async Task<AppAdmin?> UpdateAsync(AppAdmin admin)
		{
			var result = await _userManager.UpdateAsync(admin.AppUser);
			if (!result.Succeeded)
				return null;

			_context.AppAdmins.Update(admin);
			await _context.SaveChangesAsync();
			return admin;
		}

		public async Task DeleteAsync(string id)
		{
			var admin = await GetByIdAsync(id);
			if (admin != null)
			{
				await _userManager.DeleteAsync(admin.AppUser);
				_context.AppAdmins.Remove(admin);
				await _context.SaveChangesAsync();
			}
		}

		public async Task<bool> ExistsAsync(string id)
		{
			return await _context.AppAdmins.AnyAsync(x => x.AppUserId == id);
		}
	}
}
