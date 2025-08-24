using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection.Emit;
using System.Text;
using System.Threading.Tasks;
using Yazilimxyz.EntityLayer.Entities;
using System;

namespace Yazilimxyz.DataAccessLayer.Context
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        // DbSet Properties
        public DbSet<Product> Products { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<ProductImage> ProductImages { get; set; }
        public DbSet<ProductVariant> ProductVariants { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<AppUser> AppUsers { get; set; }
        public DbSet<AppAdmin> AppAdmins { get; set; }

        // Support Entities
        public DbSet<SupportMessage> SupportMessages { get; set; }
        public DbSet<SupportConversation> SupportConversations { get; set; }
		public DbSet<MerchantOrder> MerchantOrders { get; set; }
		public DbSet<MerchantOrderItem> MerchantOrderItems { get; set; }
		public DbSet<Merchant> Merchants { get; set; }
        public DbSet<Customer> Customers { get; set; }
        public DbSet<CustomerAddress> CustomerAddresses { get; set; }
        public DbSet<CartItem> CartItems { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

			// OrderItem → ProductVariant
			modelBuilder.Entity<OrderItem>()
	            .HasOne(x => x.Product)
	            .WithMany()
	            .HasForeignKey(x => x.ProductId)
	            .OnDelete(DeleteBehavior.NoAction);

			modelBuilder.Entity<OrderItem>()
				.HasOne(x => x.ProductVariant)
				.WithMany()
				.HasForeignKey(x => x.ProductVariantId)
				.OnDelete(DeleteBehavior.NoAction);


			modelBuilder.Entity<OrderItem>()
                .HasOne(oi => oi.Order)
                .WithMany(o => o.OrderItems)
                .HasForeignKey(oi => oi.OrderId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<OrderItem>()
                .HasOne(oi => oi.MerchantOrder)
                .WithMany(mo => mo.Items)
                .HasForeignKey(oi => oi.MerchantOrderId)
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

            // Product → Merchant
            modelBuilder.Entity<Product>()
                .HasOne(p => p.Merchant)
                .WithMany()
                .HasForeignKey(p => p.MerchantId)
                .OnDelete(DeleteBehavior.Restrict);


            // SupportMessage → Sender
            modelBuilder.Entity<SupportMessage>()
                .HasOne(sm => sm.Sender)
                .WithMany(u => u.SentMessages)
                .HasForeignKey(sm => sm.SenderId)
                .OnDelete(DeleteBehavior.Restrict);

            // SupportMessage → Receiver
            modelBuilder.Entity<SupportMessage>()
                .HasOne(sm => sm.Receiver)
                .WithMany(u => u.ReceivedMessages)
                .HasForeignKey(sm => sm.ReceiverId)
                .OnDelete(DeleteBehavior.Restrict);

            // SupportMessage → Conversation
            modelBuilder.Entity<SupportMessage>()
                .HasOne(sm => sm.Conversation)
                .WithMany(c => c.Messages)
                .HasForeignKey(sm => sm.ConversationId)
                .OnDelete(DeleteBehavior.Cascade);

            // SupportConversation → Customer
            modelBuilder.Entity<SupportConversation>()
                .HasOne(c => c.Customer)
                .WithMany()
                .HasForeignKey(c => c.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);

            // SupportConversation → SupportAgent
            modelBuilder.Entity<SupportConversation>()
                .HasOne(c => c.SupportAgent)
                .WithMany()
                .HasForeignKey(c => c.SupportAgentId)
                .OnDelete(DeleteBehavior.Restrict);

            // Merchant → AppUser
            modelBuilder.Entity<Merchant>()
                    .HasOne(m => m.AppUser)
                    .WithOne(u => u.Merchant)
                    .HasForeignKey<Merchant>(m => m.AppUserId)
                    .OnDelete(DeleteBehavior.Restrict);

            // Customer → AppUser
            modelBuilder.Entity<Customer>()
                .HasOne(c => c.AppUser)
                .WithOne(u => u.Customer)
                .HasForeignKey<Customer>(c => c.AppUserId)
                .OnDelete(DeleteBehavior.Restrict);

            // CustomerAddress → Customer
            modelBuilder.Entity<CustomerAddress>()
                .HasOne(ca => ca.Customer)
                .WithMany(c => c.Addresses)
                .HasForeignKey(ca => ca.CustomerId)
                .OnDelete(DeleteBehavior.Cascade);

            // CartItem → User
            modelBuilder.Entity<CartItem>()
                .HasOne(ci => ci.User)
                .WithMany(u => u.CartItems)
                .HasForeignKey(ci => ci.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // CartItem → ProductVariant
            modelBuilder.Entity<CartItem>()
                .HasOne(ci => ci.Variant)
                .WithMany(pv => pv.CartItems)
                .HasForeignKey(ci => ci.ProductVariantId)
                .OnDelete(DeleteBehavior.Restrict);

            // Order → ShippingAddress
            modelBuilder.Entity<Order>()
                .HasOne(o => o.ShippingAddress)
                .WithMany()
                .HasForeignKey(o => o.ShippingAddressId)
                .OnDelete(DeleteBehavior.Restrict);

            // Order → AppUser
            modelBuilder.Entity<Order>()
                .HasOne(o => o.User)
                .WithMany(u => u.Orders)
                .HasForeignKey(o => o.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // CustomerAddress unique index
            modelBuilder.Entity<CustomerAddress>()
                .HasIndex(x => new { x.CustomerId, x.IsDefault })
                .HasFilter("[IsDefault] = 1")
                .IsUnique();

			// Merchant - MerchantOrder (One to Many)
			modelBuilder.Entity<MerchantOrder>()
				.HasOne(mo => mo.Merchant)
				.WithMany() // AppUser veya Merchant içinde listeyi kullanmıyorsan boş bırak
				.HasForeignKey(mo => mo.MerchantId)
				.OnDelete(DeleteBehavior.Cascade);

			// Order - MerchantOrder (One to Many)
			modelBuilder.Entity<MerchantOrder>()
				.HasOne(mo => mo.Order)
				.WithMany(o => o.MerchantOrders)
				.HasForeignKey(mo => mo.OrderId)
				.OnDelete(DeleteBehavior.Cascade);

			// MerchantOrder - OrderItem (One to Many)
			modelBuilder.Entity<OrderItem>()
                .HasOne(x => x.Order)
                .WithMany(x => x.OrderItems)
                .HasForeignKey(x => x.OrderId)
                .OnDelete(DeleteBehavior.NoAction);

			// Order - OrderItem (One to Many)
			modelBuilder.Entity<OrderItem>()
				.HasOne(oi => oi.Order)
				.WithMany(o => o.OrderItems)
				.HasForeignKey(oi => oi.OrderId)
				.OnDelete(DeleteBehavior.Cascade);

			// MerchantOrder - MerchantOrderItem (One to Many)
			modelBuilder.Entity<MerchantOrderItem>()
				.HasOne(moi => moi.MerchantOrder)
				.WithMany(mo => mo.MerchantOrderItems)
				.HasForeignKey(moi => moi.MerchantOrderId)
				.OnDelete(DeleteBehavior.Cascade);

			modelBuilder.Entity<MerchantOrder>()
	            .HasOne(mo => mo.Merchant)
	            .WithMany()
	            .HasForeignKey(mo => mo.MerchantId)
	            .HasPrincipalKey(u => u.Id)
	            .OnDelete(DeleteBehavior.Restrict); // optional

		}
	}
}