using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Yazilimxyz.EntityLayer.Entities
{
    public class ProductImage : BaseEntity
    {
        public string ImageUrl { get; set; }
        public string AltText { get; set; }
        public int SortOrder { get; set; }

        public int ProductId { get; set; }
        public Product Product { get; set; }
    }
}
