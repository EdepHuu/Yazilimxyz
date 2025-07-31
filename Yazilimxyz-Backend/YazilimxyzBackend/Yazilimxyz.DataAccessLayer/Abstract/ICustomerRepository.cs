using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Yazilimxyz.EntityLayer.Entities;

namespace Yazilimxyz.DataAccessLayer.Abstract
{
    public interface ICustomerRepository : IGenericRepository<Customer>
    {
        Task<Customer?> GetByAppUserIdAsync(string appUserId);
        Task<Customer?> GetWithAddressesAsync(int id);
    }
}
