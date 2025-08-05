using AutoMapper;
using Yazilimxyz.BusinessLayer.DTOs.AppAdmin;
using Yazilimxyz.BusinessLayer.DTOs.AppUser;
using Yazilimxyz.BusinessLayer.DTOs.CartItem;
using Yazilimxyz.BusinessLayer.DTOs.Category;
using Yazilimxyz.BusinessLayer.DTOs.Customer;
using Yazilimxyz.BusinessLayer.DTOs.CustomerAddress;
using Yazilimxyz.BusinessLayer.DTOs.Merchant;
using Yazilimxyz.BusinessLayer.DTOs.Order;
using Yazilimxyz.BusinessLayer.DTOs.OrderItem;
using Yazilimxyz.BusinessLayer.DTOs.Product;
using Yazilimxyz.BusinessLayer.DTOs.ProductImage;
using Yazilimxyz.BusinessLayer.DTOs.ProductVariant;
using Yazilimxyz.BusinessLayer.DTOs.SupportMessage;
using Yazilimxyz.EntityLayer.Entities;

namespace Yazilimxyz.BusinessLayer.Mapping
{
	public class AutoMapperProfile : Profile
	{
		public AutoMapperProfile()
		{
			// Category
			CreateMap<Category, ResultCategoryDto>()
				.ForMember(dest => dest.ProductCount, opt => opt.MapFrom(src => src.Products.Count))
				.ForMember(dest => dest.SubCategoryCount, opt => opt.MapFrom(src => src.SubCategories.Count));
			CreateMap<CreateCategoryDto, Category>().ReverseMap();
			CreateMap<UpdateCategoryDto, Category>().ReverseMap();
			CreateMap<GetByIdCategoryDto, Category>().ReverseMap();

            CreateMap<Category, ResultCategoryWithSubDto>()
				.ForMember(dest => dest.ProductCount, opt => opt.MapFrom(src => src.Products.Count))
				.ForMember(dest => dest.SubCategoryCount, opt => opt.MapFrom(src => src.SubCategories.Count))
				.ForMember(dest => dest.SubCategories, opt => opt.MapFrom(src => src.SubCategories));

			CreateMap<Category, ResultCategoryHierarchyDto>()
			.ForMember(dest => dest.ProductCount, opt => opt.MapFrom(src => src.Products.Count));
			// AutoMapper, Category'nin SubCategories ve ParentCategory özelliklerini 
			// ResultCategoryHierarchyDto'nun aynı isimli özelliklerine otomatik olarak eşleştirecektir.
			// Bu nedenle, SubCategories ve ParentCategory için ForMember kullanmaya gerek yoktur.
			// Ancak veritabanından veri çekerken .Include() kullanmanız gerekir.
    

            // Product
            CreateMap<ResultProductDto, Product>().ReverseMap();
			CreateMap<CreateProductDto, Product>().ReverseMap();
			CreateMap<UpdateProductDto, Product>().ReverseMap();
			CreateMap<GetByIdProductDto, Product>().ReverseMap();

            CreateMap<Product, ResultProductWithVariantsDto>()
				.ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.Category.Name))
				.ForMember(dest => dest.MerchantName, opt => opt.MapFrom(src => src.Merchant != null ? src.Merchant.AppUser : null))
				.ForMember(dest => dest.Gender, opt => opt.MapFrom(src => src.Gender.ToString()))
				.ForMember(dest => dest.Variants, opt => opt.MapFrom(src => src.ProductVariants));

            CreateMap<Product, ResultProductWithImagesDto>()
				.ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.Category.Name))
				.ForMember(dest => dest.MerchantName, opt => opt.MapFrom(src => src.Merchant != null ? src.Merchant.AppUser : null))
				.ForMember(dest => dest.Gender, opt => opt.MapFrom(src => src.Gender.ToString()))
				.ForMember(dest => dest.Images, opt => opt.MapFrom(src => src.ProductImages));

			CreateMap<Product, ResultProductDetailedDto>()
				.ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.Category.Name))
				.ForMember(dest => dest.MerchantName, opt => opt.MapFrom(src => src.Merchant.CompanyName))
				.ForMember(dest => dest.MerchantId, opt => opt.MapFrom(src => src.MerchantId)) // Bu satır önemli
				.ForMember(dest => dest.Gender, opt => opt.MapFrom(src => src.Gender)) // Enum kalacaksa ToString yok
				.ForMember(dest => dest.Images, opt => opt.MapFrom(src => src.ProductImages))
				.ForMember(dest => dest.Variants, opt => opt.MapFrom(src => src.ProductVariants));

			// ProductImage
			CreateMap<ResultProductImageDto, ProductImage>().ReverseMap();
			CreateMap<CreateProductImageDto, ProductImage>().ReverseMap();
			CreateMap<UpdateProductImageDto, ProductImage>().ReverseMap();
			CreateMap<GetByIdProductImageDto, ProductImage>().ReverseMap();

			// ProductVariant
			CreateMap<ResultProductVariantDto, ProductVariant>().ReverseMap();
			CreateMap<CreateProductVariantDto, ProductVariant>().ReverseMap();
			CreateMap<UpdateProductVariantDto, ProductVariant>().ReverseMap();
			CreateMap<GetByIdProductVariantDto, ProductVariant>().ReverseMap();

			// Order
			CreateMap<ResultOrderDto, Order>().ReverseMap();
			CreateMap<CreateOrderDto, Order>().ReverseMap();
			CreateMap<UpdateOrderDto, Order>().ReverseMap();
			CreateMap<GetByIdOrderDto, Order>().ReverseMap();

            CreateMap<Order, ResultOrderWithItemsDto>()
				.ForMember(dest => dest.StatusText, opt => opt.MapFrom(src => src.Status.ToString()))
				.ForMember(dest => dest.PaymentStatusText, opt => opt.MapFrom(src => src.PaymentStatus.ToString()))
				.ForMember(dest => dest.Items, opt => opt.MapFrom(src => src.OrderItems));

            // OrderItem (Sadece tek yönlü, reverseMap yok!)
            CreateMap<OrderItem, ResultOrderItemDto>()
				.ForMember(dest => dest.OrderItemId, opt => opt.MapFrom(src => src.OrderItemId))
				.ForMember(dest => dest.OrderId, opt => opt.MapFrom(src => src.OrderId))
				.ForMember(dest => dest.ProductId, opt => opt.MapFrom(src => src.ProductId))
				.ForMember(dest => dest.ProductVariantId, opt => opt.MapFrom(src => src.ProductVariantId))
				.ForMember(dest => dest.Quantity, opt => opt.MapFrom(src => src.Quantity))
				.ForMember(dest => dest.UnitPrice, opt => opt.MapFrom(src => src.UnitPrice))
				.ForMember(dest => dest.TotalPrice, opt => opt.MapFrom(src => src.TotalPrice))
				.ForMember(dest => dest.ProductName, opt => opt.MapFrom(src => src.ProductName))
				.ForMember(dest => dest.Size, opt => opt.MapFrom(src => src.Size))
				.ForMember(dest => dest.Color, opt => opt.MapFrom(src => src.Color))
				.ForAllMembers(opt => opt.Ignore()); // ✅ Doğru yer burası



			CreateMap<CreateOrderItemDto, OrderItem>().ReverseMap();
			CreateMap<UpdateOrderItemDto, OrderItem>().ReverseMap();
			CreateMap<GetByIdOrderItemDto, OrderItem>().ReverseMap();

			// Merchant
			CreateMap<ResultMerchantDto, Merchant>().ReverseMap();
			CreateMap<CreateMerchantDto, Merchant>().ReverseMap();
			CreateMap<UpdateMerchantDto, Merchant>().ReverseMap();
			CreateMap<GetByIdMerchantDto, Merchant>().ReverseMap();

			// SupportMessage
			CreateMap<ResultSupportMessageDto, SupportMessage>().ReverseMap();
			CreateMap<CreateSupportMessageDto, SupportMessage>().ReverseMap();
			CreateMap<GetByIdSupportMessageDto, SupportMessage>().ReverseMap();

			// Customer
			CreateMap<ResultCustomerDto, Customer>().ReverseMap();
			CreateMap<CreateCustomerDto, Customer>().ReverseMap();
			CreateMap<UpdateCustomerDto, Customer>().ReverseMap();
			CreateMap<GetByIdCustomerDto, Customer>().ReverseMap();

            CreateMap<Customer, ResultCustomerWithAddressesDto>()
				.ForMember(dest => dest.AddressCount, opt => opt.MapFrom(src => src.Addresses.Count))
				.ForMember(dest => dest.Addresses, opt => opt.MapFrom(src => src.Addresses));

            // CustomerAddress
            CreateMap<ResultCustomerAddressDto, CustomerAddress>().ReverseMap();
			CreateMap<CreateCustomerAddressDto, CustomerAddress>().ReverseMap();
			CreateMap<UpdateCustomerAddressDto, CustomerAddress>().ReverseMap();
			CreateMap<GetByIdCustomerAddressDto, CustomerAddress>().ReverseMap();

			// AppUser
			CreateMap<ResultAppUserDto, AppUser>().ReverseMap();
			CreateMap<CreateAppUserDto, AppUser>().ReverseMap();
			CreateMap<UpdateAppUserDto, AppUser>().ReverseMap();
			CreateMap<GetByIdAppUserDto, AppUser>().ReverseMap();

            CreateMap<AppUser, ResultAppUserWithMerchantDto>()
				.ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
				.ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.UserName))
				.ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name))
				.ForMember(dest => dest.LastName, opt => opt.MapFrom(src => src.LastName))
				.ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email))
				.ForMember(dest => dest.PhoneNumber, opt => opt.MapFrom(src => src.PhoneNumber))
				.ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.CreatedAt))
				// İlişkili Merchant verilerini eşliyoruz
				// Merchant nesnesinin null olma ihtimaline karşı null kontrolü ekliyoruz
				.ForMember(dest => dest.MerchantId, opt => opt.MapFrom(src => src.Merchant != null ? (int?)src.Merchant.Id : null))
				.ForMember(dest => dest.CompanyName, opt => opt.MapFrom(src => src.Merchant != null ? src.Merchant.CompanyName : null))
				.ForMember(dest => dest.Iban, opt => opt.MapFrom(src => src.Merchant != null ? src.Merchant.Iban : null))
				.ForMember(dest => dest.TaxNumber, opt => opt.MapFrom(src => src.Merchant != null ? src.Merchant.TaxNumber : null))
				.ForMember(dest => dest.CompanyAddress, opt => opt.MapFrom(src => src.Merchant != null ? src.Merchant.CompanyAddress : null))
				.ForMember(dest => dest.MerchantPhone, opt => opt.MapFrom(src => src.Merchant != null ? src.Merchant.Phone : null));

            CreateMap<AppUser, ResultAppUserWithCustomerDto>()
				.ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
				.ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.UserName))
				.ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name))
				.ForMember(dest => dest.LastName, opt => opt.MapFrom(src => src.LastName))
				.ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email))
				.ForMember(dest => dest.PhoneNumber, opt => opt.MapFrom(src => src.PhoneNumber))
				.ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.CreatedAt))
				// İlişkili Customer verilerini eşliyoruz
				// Customer nesnesinin null olma ihtimaline karşı null kontrolü ekliyoruz
				.ForMember(dest => dest.CustomerId, opt => opt.MapFrom(src => src.Customer != null ? (int?)src.Customer.Id : null))
				.ForMember(dest => dest.AddressCount, opt => opt.MapFrom(src => src.Customer != null ? src.Customer.Addresses.Count : 0));

            // CartItem
            CreateMap<ResultCartItemDto, CartItem>().ReverseMap();
			CreateMap<CreateCartItemDto, CartItem>().ReverseMap();
			CreateMap<UpdateCartItemDto, CartItem>().ReverseMap();
			CreateMap<GetByIdCartItemDto, CartItem>().ReverseMap();

			// AppAdmin
			CreateMap<ResultAppAdminDto, AppAdmin>().ReverseMap();
			CreateMap<CreateAppAdminDto, AppAdmin>().ReverseMap();
			CreateMap<UpdateAppAdminDto, AppAdmin>().ReverseMap();
			CreateMap<GetByIdAppAdminDto, AppAdmin>().ReverseMap();
		}
	}
}
