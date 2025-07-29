using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Yazilimxyz.EntityLayer.Entities
{
    public class Product : BaseEntity
    {
        public int Id { get; set; }
        public string Name { get; set; } = null;
        public string Slug { get; set; } = null;
        public string Description { get; set; } = null;
        public decimal BasePrice { get; set; }
        public string FabricInfo { get; set; }
        public string ModelInfo { get; set; }
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
