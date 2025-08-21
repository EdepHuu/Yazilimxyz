using AutoMapper;
using Yazilimxyz.BusinessLayer.DTOs.SupportMessage;
using Yazilimxyz.EntityLayer.Entities;

namespace Yazilimxyz.BusinessLayer.Mapping
{
    public partial class AutoMapperProfile : Profile
    {
        public void ConfigureSupportMessageMaps()
        {
            CreateMap<AppUser, SupportUserDto>();

            CreateMap<SupportMessage, SupportMessageDto>()
                .ForMember(dest => dest.Sender, opt => opt.MapFrom(src => src.Sender))
                .ForMember(dest => dest.ReceiverId, opt => opt.MapFrom(src => src.ReceiverId))
                .ForMember(dest => dest.ConversationId, opt => opt.MapFrom(src => src.ConversationId));

            CreateMap<SupportMessage, ResultSupportMessageDto>()
                .ForMember(dest => dest.CustomerName, opt => opt.MapFrom(src => src.Sender.UserName))
                .ForMember(dest => dest.CustomerEmail, opt => opt.MapFrom(src => src.Sender.Email));

            CreateMap<SupportMessage, GetByIdSupportMessageDto>()
                .ForMember(dest => dest.Sender, opt => opt.MapFrom(src => src.Sender));

            CreateMap<CreateSupportMessageDto, SupportMessage>();
            CreateMap<UpdateSupportMessageDto, SupportMessage>();
        }
    }
}
