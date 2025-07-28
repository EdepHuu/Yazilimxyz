using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Yazilimxyz.Domain.Entities;

namespace Yazilimxyz.Infrastructure.Context
{
	public class AppDbContext : DbContext
	{
		public AppDbContext(DbContextOptions<AppDbContext> options)
			: base(options)
		{
		}

		// DbSet properties
		public DbSet<Product> Products { get; set; }
		public DbSet<Category> Categories { get; set; }
		public DbSet<ProductImage> ProductImages { get; set; }
		public DbSet<ProductVariant> ProductVariants { get; set; }
		public DbSet<Order> Orders { get; set; }
		public DbSet<OrderItem> OrderItems { get; set; }
		public DbSet<AppUser> AppUsers { get; set; }
		public DbSet<SupportMessage> SupportMessages { get; set; }

		protected override void OnModelCreating(ModelBuilder modelBuilder)
		{
			base.OnModelCreating(modelBuilder);

			// OrderItem → ProductVariant
			modelBuilder.Entity<OrderItem>()
				.HasOne(oi => oi.ProductVariant)
				.WithMany(pv => pv.OrderItems)
				.HasForeignKey(oi => oi.ProductVariantId)
				.OnDelete(DeleteBehavior.Restrict);

			// OrderItem → Product
			modelBuilder.Entity<OrderItem>()
				.HasOne(oi => oi.Product)
				.WithMany()
				.HasForeignKey(oi => oi.ProductId)
				.OnDelete(DeleteBehavior.Restrict);

			// OrderItem → Order
			modelBuilder.Entity<OrderItem>()
				.HasOne(oi => oi.Order)
				.WithMany(o => o.OrderItems)
				.HasForeignKey(oi => oi.OrderId)
				.OnDelete(DeleteBehavior.Restrict);

			// ProductVariant → Product
			modelBuilder.Entity<ProductVariant>()
				.HasOne(pv => pv.Product)
				.WithMany(p => p.ProductVariants)
				.HasForeignKey(pv => pv.ProductId)
				.OnDelete(DeleteBehavior.Restrict);

			// ProductImage → Product
			modelBuilder.Entity<ProductImage>()
				.HasOne(pi => pi.Product)
				.WithMany(p => p.ProductImages)
				.HasForeignKey(pi => pi.ProductId)
				.OnDelete(DeleteBehavior.Restrict);
		}
	}
}
