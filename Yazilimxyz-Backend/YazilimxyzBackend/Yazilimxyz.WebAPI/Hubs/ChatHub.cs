using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;
using Yazilimxyz.BusinessLayer.DTOs.SupportMessage;
using Yazilimxyz.DataAccessLayer.Context;
using Yazilimxyz.EntityLayer.Entities;
using Microsoft.EntityFrameworkCore;

namespace Yazilimxyz.WebAPI.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        private readonly AppDbContext _context;

        public ChatHub(AppDbContext context)
        {
            _context = context;
        }

        // Kullanıcı mesaj gönderdiğinde
        public async Task SendMessage(SupportMessageDto dto)
        {
            var senderIdString = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(senderIdString, out int senderId)) return;

            // Conversation kontrolü
            SupportConversation conversation = null;

            if (dto.ConversationId.HasValue)
            {
                conversation = await _context.SupportConversations
                    .Include(c => c.Messages)
                    .FirstOrDefaultAsync(c => c.Id == dto.ConversationId.Value);
            }

            if (conversation == null)
            {
                // Eğer conversation yoksa otomatik oluştur
                conversation = new SupportConversation
                {
                    CustomerId = senderId,
                    SupportAgentId = dto.ReceiverId,
                    LastMessageAt = DateTime.UtcNow
                };
                _context.SupportConversations.Add(conversation);
                await _context.SaveChangesAsync();
            }

            // Mesaj ekle
            var message = new SupportMessage
            {
                SenderId = senderId,
                ReceiverId = dto.ReceiverId,
                Content = dto.Content,
                SentAt = DateTime.UtcNow,
                ConversationId = conversation.Id
            };

            _context.SupportMessages.Add(message);
            conversation.LastMessageAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            // Hedef kullanıcıya gönder
            await Clients.User(dto.ReceiverId.ToString()).SendAsync("ReceiveMessage", new
            {
                SenderId = senderId,
                dto.Content,
                ConversationId = conversation.Id,
                message.SentAt
            });

            // Kendisine de gönder
            await Clients.Caller.SendAsync("MessageSent", new
            {
                ReceiverId = dto.ReceiverId,
                dto.Content,
                ConversationId = conversation.Id,
                message.SentAt
            });
        }

        // Önceki mesajları getir
        public async Task GetPreviousMessages(int conversationId)
        {
            var senderIdString = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(senderIdString, out int senderId)) return;

            var messages = await _context.SupportMessages
                .Where(m => m.ConversationId == conversationId)
                .OrderBy(m => m.SentAt)
                .Select(m => new
                {
                    m.SenderId,
                    m.ReceiverId,
                    m.Content,
                    m.SentAt,
                    m.ConversationId
                })
                .ToListAsync();

            await Clients.Caller.SendAsync("PreviousMessages", messages);
        }
    }
}
