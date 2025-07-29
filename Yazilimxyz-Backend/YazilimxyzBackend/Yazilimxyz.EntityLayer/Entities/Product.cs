using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Yazilimxyz.EntityLayer.Entities
{
    public class Product : BaseEntity
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; } = null;
        public string ProductSlug { get; set; } = null;
        public string ProductDescription { get; set; } = null;
        public decimal ProductPrice { get; set; }
        public string ProductFabricInfo { get; set; }
        public string ProductModelInfo { get; set; }
        public string ProductCode { get; set; }
        public bool IsActive { get; set; } = true;

        public int CategoryId { get; set; }
        public Category Category { get; set; }

        public string StoreId { get; set; }
        public AppUser Store { get; set; }

        public ICollection<ProductVariant> ProductVariants { get; set; }
        public ICollection<ProductImage> ProductImages { get; set; }
    }
}
