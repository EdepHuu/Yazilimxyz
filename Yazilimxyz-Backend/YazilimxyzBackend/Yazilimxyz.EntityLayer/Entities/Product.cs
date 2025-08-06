using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Yazilimxyz.EntityLayer.Entities;
using Yazilimxyz.EntityLayer.Enums;

namespace Yazilimxyz.EntityLayer.Entities
{
	public class Product : BaseEntity
	{
		public string Name { get; set; }
		public string Description { get; set; }
		public decimal BasePrice { get; set; }
		public string ModelMeasurements { get; set; } // ModelInfo yerine daha açıklayıcı
		public string FabricInfo { get; set; }
		public string ProductCode { get; set; }
		public GenderType Gender { get; set; }
		public bool IsActive { get; set; } = true;

		public int CategoryId { get; set; }
		public Category Category { get; set; }

		public int MerchantId { get; set; }
		public Merchant Merchant { get; set; }
		public string AppUserId { get; set; }  // BURASI EKLENECEK 

		public ICollection<ProductVariant> ProductVariants { get; set; } = new List<ProductVariant>();
		public ICollection<ProductImage> ProductImages { get; set; } = new List<ProductImage>();
		public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
	}
}
