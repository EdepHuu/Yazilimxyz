using AutoMapper;
using Yazilimxyz.BusinessLayer.DTOs.Category;
using Yazilimxyz.BusinessLayer.DTOs.Product;
using Yazilimxyz.BusinessLayer.DTOs.ProductImage;
using Yazilimxyz.BusinessLayer.DTOs.ProductVariant;
using Yazilimxyz.EntityLayer.Entities;

namespace Yazilimxyz.BusinessLayer.Mapping
{
    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {
            CreateMap<ResultCategoryDto, Category>().ReverseMap();
            CreateMap<CreateCategoryDto, Category>().ReverseMap();
            CreateMap<UpdateCategoryDto, Category>().ReverseMap();
            CreateMap<GetByIdCategoryDto, Category>().ReverseMap();

            CreateMap<ResultProductDto, Product>().ReverseMap();
            CreateMap<CreateProductDto, Product>().ReverseMap();
            CreateMap<UpdateProductDto, Product>().ReverseMap();
            CreateMap<GetByIdProductDto, Product>().ReverseMap();

           
            CreateMap<ResultProductImageDto, ProductImage>().ReverseMap();
            CreateMap<CreateProductImageDto, ProductImage>().ReverseMap();
            CreateMap<UpdateProductImageDto, ProductImage>().ReverseMap();
            CreateMap<GetByIdProductImageDto, ProductImage>().ReverseMap();

            CreateMap<ResultProductVariantDto, ProductVariant>().ReverseMap();
            CreateMap<CreateProductVariantDto, ProductVariant>().ReverseMap();
            CreateMap<UpdateProductVariantDto, ProductVariant>().ReverseMap();
            CreateMap<GetByIdProductVariantDto, ProductVariant>().ReverseMap();

        }
    }
}