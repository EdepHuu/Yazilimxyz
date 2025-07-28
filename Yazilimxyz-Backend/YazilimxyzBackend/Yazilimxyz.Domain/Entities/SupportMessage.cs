using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Yazilimxyz.Domain.Entities
{
    public class SupportMessage : BaseEntity
    {
        public string SenderId { get; set; }
        public AppUser Sender { get; set; }

        public string ReceiverId { get; set; }
        public string Message { get; set; }
        
        public bool IsFromSupport { get; set; }
    }
}
