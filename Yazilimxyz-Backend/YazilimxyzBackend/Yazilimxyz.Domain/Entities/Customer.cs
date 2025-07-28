using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Yazilimxyz.Domain.Entities
{
    public class Customer:AppUser
    {
        public string AppUserId { get; set; }

        public string Address { get; set; } = null!;
        // Ekstra: Favoriler, kart bilgisi, vs. buraya eklenebilir
    }

}
