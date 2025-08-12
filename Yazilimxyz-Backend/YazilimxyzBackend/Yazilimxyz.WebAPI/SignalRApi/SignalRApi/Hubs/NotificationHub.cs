using Microsoft.AspNetCore.SignalR;
using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Yazilimxyz.DataAccessLayer.Context;
using Microsoft.EntityFrameworkCore;

namespace SignalRNotificationApi.Hubs
{
    public class NotificationHub : Hub
    {
        private readonly AppDbContext _dbContext;

        public NotificationHub(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public override async Task OnConnectedAsync()
        {
            // Token veya context üzerinden userId al
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrWhiteSpace(userId))
            {
                Context.Abort();
                return;
            }

            // Kullanıcı gerçekten DB'de var mı kontrol et
            var user = await _dbContext.AppUsers.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null)
            {
                Context.Abort();
                return;
            }

            // Kullanıcıyı kendi userId grubuna ekle
            await Groups.AddToGroupAsync(Context.ConnectionId, userId);

            // Bağlantı bilgisini client’a gönder
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
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!string.IsNullOrWhiteSpace(userId))
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

        // Bildirim gönderme metodu
        public async Task SendNotification(string userId, string message)
        {
            await Clients.Group(userId).SendAsync("ReceiveNotification", new
            {
                UserId = userId,
                Message = message,
                SentAt = DateTime.UtcNow
            });
        }
    }
}
