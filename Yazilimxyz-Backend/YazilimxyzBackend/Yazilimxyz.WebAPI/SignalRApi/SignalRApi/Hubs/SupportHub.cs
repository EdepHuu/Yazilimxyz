using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using SignalRNotificationApi.Models;
using System;
using System.Collections.Concurrent;
using System.Security.Claims;
using System.Threading.Tasks;
using Yazilimxyz.DataAccessLayer.Context;
using Yazilimxyz.EntityLayer.Entities;

namespace Yazilimxyz.InfrastructureLayer.SignalR.Hubs
{
    public class SupportHub : Hub
    {
        private readonly AppDbContext _dbContext;
        private static readonly ConcurrentDictionary<string, string> UserConnections = new();

        public SupportHub(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public override async Task OnConnectedAsync()
        {
            // Kullanıcı id'sini token'dan çek
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrWhiteSpace(userId))
            {
                Context.Abort();
                return;
            }

            // Kullanıcı gerçekten var mı kontrol et
            var user = await _dbContext.AppUsers.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null)
            {
                Context.Abort();
                return;
            }

            // ConnectionId → UserId eşleşmesi ekle
            UserConnections[Context.ConnectionId] = userId;

            // Kullanıcıyı grubuna ekle
            await Groups.AddToGroupAsync(Context.ConnectionId, userId);

            await Clients.Group(userId).SendAsync("UserConnected", new
            {
                UserId = userId,
                ConnectionId = Context.ConnectionId,
                ConnectedAt = DateTime.UtcNow
            });

            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            if (UserConnections.TryRemove(Context.ConnectionId, out var userId))
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, userId);

                await Clients.Group(userId).SendAsync("UserDisconnected", new
                {
                    UserId = userId,
                    ConnectionId = Context.ConnectionId,
                    DisconnectedAt = DateTime.UtcNow
                });
            }

            await base.OnDisconnectedAsync(exception);
        }

        // Kullanıcıya mesaj gönderme
        public async Task SendMessageToUser(string receiverUserId, string message)
        {
            var senderUserId = UserConnections.GetValueOrDefault(Context.ConnectionId);
            if (string.IsNullOrEmpty(senderUserId)) return;

            var senderUser = await _dbContext.AppUsers.FindAsync(senderUserId);
            var receiverUser = await _dbContext.AppUsers.FindAsync(receiverUserId);

            if (senderUser == null || receiverUser == null) return;

            var supportMessage = new SupportMessage
            {
                SenderId = senderUserId,
                ReceiverId = receiverUserId,
                Message = message,
                CreatedAt = DateTime.UtcNow
            };

            _dbContext.SupportMessages.Add(supportMessage);
            await _dbContext.SaveChangesAsync();

            // Alıcıya mesaj gönder
            await Clients.Group(receiverUserId).SendAsync("ReceiveSupportMessage", supportMessage);

            // Gönderen de kendi ekranında görsün
            if (senderUserId != receiverUserId)
            {
                await Clients.Group(senderUserId).SendAsync("ReceiveSupportMessage", supportMessage);
            }
        }
    }
}
