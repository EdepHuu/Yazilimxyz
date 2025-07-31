using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Yazilimxyz.EntityLayer.Entities;

namespace Yazilimxyz.DataAccessLayer.Abstract
{
    public interface ICustomerAddressRepository : IGenericRepository<CustomerAddress>
    {
        Task<IEnumerable<CustomerAddress>> GetByCustomerIdAsync(int customerId);
        Task<CustomerAddress?> GetDefaultAddressAsync(int customerId);
        Task SetDefaultAddressAsync(int customerId, int addressId);
    }
}
