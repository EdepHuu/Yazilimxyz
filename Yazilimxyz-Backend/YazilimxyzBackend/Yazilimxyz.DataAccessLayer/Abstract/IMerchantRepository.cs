using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Yazilimxyz.EntityLayer.Entities;

namespace Yazilimxyz.DataAccessLayer.Abstract
{
	public interface IMerchantRepository : IGenericRepository<Merchant>
	{
		Task<Merchant?> GetByAppUserIdAsync(string appUserId);
		Task<Merchant?> GetByIdWithUserAsync(int id);                    // EKLEDİM
		Task<Merchant?> GetByAppUserIdWithUserAsync(string appUserId);   // EKLEDİM

		Task<List<Merchant>> GetByCompanyName(string companyName);       // DÖNÜŞ TÜRÜNÜ List yaptım
		Task<List<Product>> GetProductsByMerchantAsync(int merchantId);

		Task<bool> ExistsByIbanAsync(string iban, int? excludeId);       // EKLEDİM
		Task<bool> ExistsByTaxNumberAsync(string taxNumber, int? excludeId); // EKLEDİM

		Task SetActiveAsync(int id, bool isActive);                      // EKLEDİM
	}
}
