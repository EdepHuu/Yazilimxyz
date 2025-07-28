using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Yazilimxyz.EntityLayer.Entities
{
    public class ProductImage : BaseEntity
    {
        public string ImageUrl { get; set; }// Örn: "/uploads/products/12345/image1.jpg"

        public int ProductId { get; set; }
        public Product Product { get; set; }
    }
}
