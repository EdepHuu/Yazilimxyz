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
    public class AppUserRepository : IAppUserRepository
    {
        private readonly AppDbContext _context;
        private readonly UserManager<AppUser> _userManager;

        public AppUserRepository(AppDbContext context, UserManager<AppUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        public async Task<AppUser?> GetByIdAsync(string id)
        {
            return await _userManager.FindByIdAsync(id);
        }

        public async Task<AppUser?> GetByEmailAsync(string email)
        {
            return await _userManager.FindByEmailAsync(email);
        }

        public async Task<AppUser?> GetWithCustomerAsync(string id)
        {
            return await _context.Set<AppUser>()
                .Include(u => u.Customer)
                .FirstOrDefaultAsync(u => u.Id == id);
        }

        public async Task<AppUser?> GetWithMerchantAsync(string id)
        {
            return await _context.Set<AppUser>()
                .Include(u => u.Merchant)
                .FirstOrDefaultAsync(u => u.Id == id);
        }

        public async Task<IEnumerable<AppUser>> GetAllAsync()
        {
            return await _context.Set<AppUser>().ToListAsync();
        }

        public async Task<AppUser?> CreateAsync(AppUser user)
        {
            var result = await _userManager.CreateAsync(user);
            return result.Succeeded ? user : null;
        }

        public async Task<AppUser?> UpdateAsync(AppUser user)
        {
            var result = await _userManager.UpdateAsync(user);
            return result.Succeeded ? user : null;
        }

        public async Task DeleteAsync(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user != null)
            {
                await _userManager.DeleteAsync(user);
            }
        }

        public async Task<bool> ExistsAsync(string id)
        {
            return await _userManager.FindByIdAsync(id) != null;
        }
    }
}
