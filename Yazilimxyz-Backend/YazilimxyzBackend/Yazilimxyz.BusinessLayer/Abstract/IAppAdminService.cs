using Yazilimxyz.BusinessLayer.DTOs.AppAdmin;

namespace Yazilimxyz.BusinessLayer.Abstract
{
    public interface IAppAdminService
    {
        Task<List<ResultAppAdminDto>> GetAllActiveAsync();
        Task<ResultAppAdminDto?> GetByIdAsync(string id);
        Task<ResultAppAdminDto?> GetByEmailAsync(string email);
        Task<bool> ExistsAsync(string id);
        Task<ResultAppAdminDto?> CreateAsync(CreateAppAdminDto dto, string password);
        Task<ResultAppAdminDto?> UpdateAsync(UpdateAppAdminDto dto);
        Task DeleteAsync(string id);
    }
}
