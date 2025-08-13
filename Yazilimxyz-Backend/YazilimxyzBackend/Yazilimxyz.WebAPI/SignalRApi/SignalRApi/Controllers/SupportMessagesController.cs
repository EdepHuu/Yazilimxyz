using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;
using Yazilimxyz.DataAccessLayer.Context;
using Yazilimxyz.EntityLayer.Entities;

namespace Yazilimxyz.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SupportMessagesController : ControllerBase
    {
        private readonly AppDbContext _dbContext;

        public SupportMessagesController(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpGet("history/{userId}")]
        public async Task<IActionResult> GetSupportMessages(string userId)
        {
            var messages = await _dbContext.SupportMessages
                .Where(m => m.SenderId == userId || m.ReceiverId == userId)
                .OrderBy(m => m.CreatedAt)
                .ToListAsync();

            return Ok(messages);
        }
    }
}
