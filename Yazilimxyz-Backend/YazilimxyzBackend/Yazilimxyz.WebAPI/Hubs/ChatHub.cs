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

        public async Task SendMessage(CreateSupportMessageDto dto)
        {
            var senderId = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(senderId)) return;

            // Conversation kontrolü
            SupportConversation conversation = null;
            if (!string.IsNullOrEmpty(dto.ConversationId) && int.TryParse(dto.ConversationId, out int convId))
            {
                conversation = await _context.SupportConversations
                    .Include(c => c.Messages)
                    .FirstOrDefaultAsync(c => c.Id == convId);
            }

            if (conversation == null)
            {
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

            // Mesajları gönder
            await Clients.User(dto.ReceiverId).SendAsync("ReceiveMessage", new
            {
                SenderId = senderId,
                dto.Content,
                ConversationId = conversation.Id,
                message.SentAt
            });

            await Clients.Caller.SendAsync("MessageSent", new
            {
                ReceiverId = dto.ReceiverId,
                dto.Content,
                ConversationId = conversation.Id,
                message.SentAt
            });
        }

        public async Task GetPreviousMessages(string conversationId)
        {
            var senderId = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(senderId)) return;

            if (!int.TryParse(conversationId, out int convId)) return;

            var messages = await _context.SupportMessages
                .Where(m => m.ConversationId == convId)
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
