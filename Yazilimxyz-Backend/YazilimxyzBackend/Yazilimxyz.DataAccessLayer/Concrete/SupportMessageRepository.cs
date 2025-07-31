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
    public class SupportMessageRepository : Repository<SupportMessage>, ISupportMessageRepository
    {
        public SupportMessageRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<SupportMessage>> GetConversationAsync(string senderId, string receiverId) // iki kullanıcı arasındaki tüm mesajları getirir
        {
            return await _appDbContext.Set<SupportMessage>()
                .Include(sm => sm.Sender)
                .Include(sm => sm.Receiver)
                .Where(sm =>
                    (sm.SenderId == senderId && sm.ReceiverId == receiverId) ||
                    (sm.SenderId == receiverId && sm.ReceiverId == senderId))
                .OrderBy(sm => sm.CreatedAt)
                .ToListAsync();
        }

        public async Task<SupportMessage?> GetLatestMessageAsync(string userId)
        {
            return await _appDbContext.Set<SupportMessage>()
                .Include(sm => sm.Sender)
                .Include(sm => sm.Receiver)
                .Where(sm => sm.SenderId == userId || sm.ReceiverId == userId)
                .OrderByDescending(sm => sm.CreatedAt)
                .FirstOrDefaultAsync();
        }

        public async Task<IEnumerable<SupportMessage>> GetSupportMessagesAsync()
        {
            return await _appDbContext.Set<SupportMessage>()
                .Include(sm => sm.Sender)
                .Include(sm => sm.Receiver)
                .Where(sm => sm.IsFromSupport == true)
                .OrderByDescending(sm => sm.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<SupportMessage>> GetUserMessagesAsync(string userId)
        {
            return await _appDbContext.Set<SupportMessage>()
                .Include(sm => sm.Sender)
                .Include(sm => sm.Receiver)
                .Where(sm => sm.SenderId == userId || sm.ReceiverId == userId)
                .OrderByDescending(sm => sm.CreatedAt) // Yeni mesajlar önce
                .ToListAsync();
        }
        public async Task<IEnumerable<AppUser>> GetConversationPartnersAsync(string userId) // kullanıcının tüm konuşma partnerlerini getirir (mesaj listesi için)
        {
            var partnerIds = await _appDbContext.Set<SupportMessage>()
                .Where(sm => sm.SenderId == userId || sm.ReceiverId == userId)
                .Select(sm => sm.SenderId == userId ? sm.ReceiverId : sm.SenderId)
                .Distinct()
                .ToListAsync();

            return await _appDbContext.Set<AppUser>()
                .Where(u => partnerIds.Contains(u.Id))
                .ToListAsync();
        }
    }
}
