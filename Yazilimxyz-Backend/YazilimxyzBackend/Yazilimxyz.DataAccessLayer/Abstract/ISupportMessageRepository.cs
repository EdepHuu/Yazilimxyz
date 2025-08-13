using SignalRNotificationApi.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Yazilimxyz.EntityLayer.Entities;

namespace Yazilimxyz.DataAccessLayer.Abstract
{
    public interface ISupportMessageRepository : IGenericRepository<SupportMessage>
    {
        Task<IEnumerable<SupportMessage>> GetConversationAsync(string senderId, string receiverId);
        Task<IEnumerable<SupportMessage>> GetUserMessagesAsync(string userId);
        Task<IEnumerable<SupportMessage>> GetSupportMessagesAsync();
        Task<SupportMessage?> GetLatestMessageAsync(string userId);
        Task<IEnumerable<AppUser>> GetConversationPartnersAsync(string userId);
    }
}
