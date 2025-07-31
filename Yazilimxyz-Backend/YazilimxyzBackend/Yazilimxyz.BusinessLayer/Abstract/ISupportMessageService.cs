using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Yazilimxyz.BusinessLayer.DTOs.SupportMessage;

namespace Yazilimxyz.BusinessLayer.Abstract
{
    public interface ISupportMessageService
    {
        Task<List<ResultSupportMessageDto>> GetAllAsync();
        Task<ResultSupportMessageDto> GetByIdAsync(int id);
        Task CreateAsync(CreateSupportMessageDto dto);
        Task DeleteAsync(int id);
    }
}
