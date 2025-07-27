using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Yazilimxyz.Domain.Entities
{
    public class Order : BaseEntity
    {
        public string UserId { get; set; }
        public AppUser User { get; set; }

        public ICollection<OrderItem> Items { get; set; }

        public string Status { get; set; } // Hazırlanıyor, Kargoda, Teslim Edildi
        public DateTime OrderDate { get; set; } = DateTime.UtcNow;
    }
}
