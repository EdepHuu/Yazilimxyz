using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Yazilimxyz.EntityLayer.Entities
{
    public class AppAdmin : IdentityUser
    {
        public string Name { get; set; }
        public string LastName { get; set; }
        public bool IsActive { get; set; } = true;
    }
}
