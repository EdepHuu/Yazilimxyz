using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Yazilimxyz.EntityLayer.Entities;

namespace Yazilimxyz.DataAccessLayer.Abstract
{
	public interface IAppAdminRepository
	{
		Task<AppAdmin?> GetByIdAsync(string appUserId);
		Task<AppAdmin?> GetByEmailAsync(string email);
		Task<IEnumerable<AppAdmin>> GetAllActiveAsync();
		Task<AppAdmin?> CreateAsync(AppAdmin admin, string password);
		Task<AppAdmin?> UpdateAsync(AppAdmin admin);
		Task DeleteAsync(string appUserId);
		Task<bool> ExistsAsync(string appUserId);
	}
}
