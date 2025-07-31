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
            var addresses = await _dbSet.Where(a => a.CustomerId == customerId).ToListAsync();
            foreach ( var address in addresses)
            {
                address.IsDefault = address.Id == addressId;
            }
            await _appDbContext.SaveChangesAsync();
        }
    }
}
