using Yazilimxyz.BusinessLayer.DTOs.AppUser;
using Yazilimxyz.BusinessLayer.DTOs.SupportMessage;

namespace Yazilimxyz.BusinessLayer.Abstract
{
    public interface ISupportMessageService
    {
        Task<ResultSupportMessageDto?> GetByIdAsync(int id);
        Task<List<ResultSupportMessageDto>> GetAllAsync();
        Task<List<ResultSupportMessageDto>> GetConversationAsync(string senderId, string receiverId);
        Task<List<ResultSupportMessageDto>> GetUserMessagesAsync(string userId);
        Task<List<ResultSupportMessageDto>> GetSupportMessagesAsync();
        Task<ResultSupportMessageDto?> GetLatestMessageAsync(string userId);
        Task<List<ResultAppUserDto>> GetConversationPartnersAsync(string userId);

        Task CreateAsync(CreateSupportMessageDto dto);
        Task DeleteAsync(int id);
    }
}
