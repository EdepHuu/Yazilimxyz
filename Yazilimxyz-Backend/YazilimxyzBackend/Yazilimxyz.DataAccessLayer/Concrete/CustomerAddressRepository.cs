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
    public class CustomerAddressRepository : Repository<CustomerAddress>, ICustomerAddressRepository
    {
        public CustomerAddressRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<CustomerAddress>> GetByCustomerIdAsync(int customerId)
        {
            return await _dbSet.Where(a => a.CustomerId == customerId).ToListAsync();
        }

        public async Task<CustomerAddress?> GetDefaultAddressAsync(int customerId)
        {
            return await _dbSet.FirstOrDefaultAsync(a => a.CustomerId == customerId && a.IsDefault);
        }

		public async Task SetDefaultAddressAsync(int customerId, int addressId)
		{
			// Güvenlik: hedef adres müşteriye ait mi?
			var exists = await _dbSet.AnyAsync(a => a.Id == addressId && a.CustomerId == customerId);
			if (!exists) throw new Exception("Adres bulunamadı veya müşteriye ait değil.");

			await using var tx = await _appDbContext.Database.BeginTransactionAsync();

			// 1) Hepsini false yap
			await _dbSet
				.Where(a => a.CustomerId == customerId && a.IsDefault)
				.ExecuteUpdateAsync(s => s.SetProperty(x => x.IsDefault, false));

			// 2) Seçileni true yap
			await _dbSet
				.Where(a => a.Id == addressId && a.CustomerId == customerId)
				.ExecuteUpdateAsync(s => s.SetProperty(x => x.IsDefault, true));

			await tx.CommitAsync();
		}
	}
}
