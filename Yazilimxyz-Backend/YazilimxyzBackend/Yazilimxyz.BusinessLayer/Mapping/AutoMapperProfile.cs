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

			// Product
			CreateMap<ResultProductDto, Product>().ReverseMap();
			CreateMap<CreateProductDto, Product>().ReverseMap();
			CreateMap<UpdateProductDto, Product>().ReverseMap();
			CreateMap<GetByIdProductDto, Product>().ReverseMap();

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
