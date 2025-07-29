using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Yazilimxyz.EntityLayer.Entities
{
    public class ProductVariant : BaseEntity
    {
        public int ProductId { get; set; }
        public Product Product { get; set; }

        public string Size { get; set; }
        public string Color { get; set; }
        public int Stock { get; set; }
        public ICollection<OrderItem> OrderItems { get; set; } 
	}
}
