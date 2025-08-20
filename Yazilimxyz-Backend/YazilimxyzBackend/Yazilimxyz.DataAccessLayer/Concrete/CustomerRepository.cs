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
	public class CustomerRepository : Repository<Customer>, ICustomerRepository
	{
		public CustomerRepository(AppDbContext context) : base(context) { }

		public async Task<Customer?> GetByIdWithUserAsync(int id)
		{
			return await _dbSet
				.Include(c => c.AppUser)
				.Include(c => c.Addresses)
				.FirstOrDefaultAsync(c => c.Id == id);
		}

		public async Task<Customer?> GetByAppUserIdAsync(string appUserId)
		{
			return await _dbSet.FirstOrDefaultAsync(c => c.AppUserId == appUserId);
		}

		public async Task<Customer?> GetByAppUserIdWithUserAsync(string appUserId)
		{
			return await _dbSet
				.Include(c => c.AppUser)
				.FirstOrDefaultAsync(c => c.AppUserId == appUserId);
		}

		public async Task<Customer?> GetByAppUserIdWithUserAndAddressesAsync(string appUserId)
		{
			return await _dbSet
				.Include(c => c.AppUser)
				.Include(c => c.Addresses)
				.FirstOrDefaultAsync(c => c.AppUserId == appUserId);
		}

		public async Task<Customer?> GetWithAddressesAsync(int id)
		{
			return await _dbSet
				.Include(c => c.AppUser)
				.Include(c => c.Addresses)
				.FirstOrDefaultAsync(c => c.Id == id);
		}

		public async Task SetActiveAsync(int id, bool isActive)
		{
			var customer = await _dbSet
				.Include(c => c.AppUser)
				.FirstOrDefaultAsync(c => c.Id == id);

			if (customer == null)
			{
				return;
			}

			// Merchant’ta yaptığımız gibi AppUser üzerinden soft-deactivate:
			customer.AppUser.LockoutEnd = isActive ? null : DateTimeOffset.MaxValue;
			await _appDbContext.SaveChangesAsync();
		}
	}
}
