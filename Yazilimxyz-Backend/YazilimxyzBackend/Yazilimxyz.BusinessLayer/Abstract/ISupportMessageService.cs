using Core.Utilities.Results;
using Yazilimxyz.BusinessLayer.DTOs.AppUser;
using Yazilimxyz.BusinessLayer.DTOs.SupportMessage;

namespace Yazilimxyz.BusinessLayer.Abstract
{
    public interface ISupportMessageService
    {
        Task<IDataResult<ResultSupportMessageDto>> GetByIdAsync(int id);
        Task<IDataResult<List<ResultSupportMessageDto>>> GetAllAsync();
        Task<IDataResult<List<ResultSupportMessageDto>>> GetConversationAsync(string senderId, string receiverId);
        Task<IDataResult<List<ResultSupportMessageDto>>> GetUserMessagesAsync(string userId);
        Task<IDataResult<List<ResultSupportMessageDto>>> GetSupportMessagesAsync();
        Task<IDataResult<ResultSupportMessageDto>> GetLatestMessageAsync(string userId);
        Task<IDataResult<List<ResultAppUserDto>>> GetConversationPartnersAsync(string userId);

        Task<IResult> CreateAsync(CreateSupportMessageDto dto);
        Task<IResult> DeleteAsync(int id);
    }
}
