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
	public class MerchantRepository : Repository<Merchant>, IMerchantRepository
	{
		public MerchantRepository(AppDbContext context) : base(context) { }

		public async Task<Merchant?> GetByAppUserIdAsync(string appUserId)
		{
			return await _dbSet.FirstOrDefaultAsync(m => m.AppUserId == appUserId);
		}

		public async Task<Merchant?> GetByIdWithUserAsync(int id) // EKLEDİM
		{
			return await _dbSet
				.Include(m => m.AppUser)
				.FirstOrDefaultAsync(m => m.Id == id);
		}

		public async Task<Merchant?> GetByAppUserIdWithUserAsync(string appUserId) // EKLEDİM
		{
			return await _dbSet
				.Include(m => m.AppUser)
				.FirstOrDefaultAsync(m => m.AppUserId == appUserId);
		}

		public async Task<List<Merchant>> GetByCompanyName(string companyName) // List<T>
		{
			var q = companyName?.Trim() ?? string.Empty;
			return await _dbSet
				.Where(m => m.CompanyName.Contains(q))
				.ToListAsync();
		}

		public async Task<List<Product>> GetProductsByMerchantAsync(int merchantId) // List<T>
		{
			return await _appDbContext.Products
				.Where(p => p.MerchantId == merchantId && p.IsActive)
				.Include(p => p.ProductImages) // ResultProductDto'da MainPhoto map'i için gerekli
				.Include(p => p.Category)
				.OrderBy(p => p.Name)
				.ToListAsync();
		}

		public async Task<bool> ExistsByIbanAsync(string iban, int? excludeId) // EKLEDİM
		{
			var query = _dbSet.AsQueryable().Where(m => m.Iban == iban);
			if (excludeId.HasValue)
			{
				query = query.Where(m => m.Id != excludeId.Value);
			}
			return await query.AnyAsync();
		}

		public async Task<bool> ExistsByTaxNumberAsync(string taxNumber, int? excludeId) // EKLEDİM
		{
			var query = _dbSet.AsQueryable().Where(m => m.TaxNumber == taxNumber);
			if (excludeId.HasValue)
			{
				query = query.Where(m => m.Id != excludeId.Value);
			}
			return await query.AnyAsync();
		}

		public async Task SetActiveAsync(int id, bool isActive) // EKLEDİM
		{
			var merchant = await _dbSet.Include(m => m.AppUser).FirstOrDefaultAsync(m => m.Id == id);
			if (merchant == null)
			{
				return;
			}

			// Örnek yaklaşım: AppUser kilitle/aç
			merchant.AppUser.LockoutEnd = isActive ? null : DateTimeOffset.MaxValue;
			await _appDbContext.SaveChangesAsync();
		}
	}

}
