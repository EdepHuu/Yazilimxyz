using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Yazilimxyz.EntityLayer.Entities
{
    public class CartItem
    {
        public int Id { get; set; }

        public string UserId { get; set; }
        public AppUser User { get; set; }

        public int ProductVariantId { get; set; }
        public ProductVariant Variant { get; set; }

        public int Quantity { get; set; }
    }
}
