using AutoMapper;
using Yazilimxyz.BusinessLayer.Abstract;
using Yazilimxyz.BusinessLayer.DTOs.AppUser;
using Yazilimxyz.BusinessLayer.DTOs.SupportMessage;
using Yazilimxyz.DataAccessLayer.Abstract;
using Yazilimxyz.EntityLayer.Entities;

namespace Yazilimxyz.BusinessLayer.Concrete
{
    public class SupportMessageManager : ISupportMessageService
    {
        private readonly ISupportMessageRepository _supportMessageRepository;
        private readonly IMapper _mapper;

        public SupportMessageManager(ISupportMessageRepository supportMessageRepository, IMapper mapper)
        {
            _supportMessageRepository = supportMessageRepository;
            _mapper = mapper;
        }

        public async Task<ResultSupportMessageDto?> GetByIdAsync(int id)
        {
            var message = await _supportMessageRepository.GetByIdAsync(id);
            return _mapper.Map<ResultSupportMessageDto>(message);
        }

        public async Task<List<ResultSupportMessageDto>> GetAllAsync()
        {
            var messages = await _supportMessageRepository.GetAllAsync();
            return _mapper.Map<List<ResultSupportMessageDto>>(messages);
        }

        public async Task<List<ResultSupportMessageDto>> GetConversationAsync(string senderId, string receiverId)
        {
            var messages = await _supportMessageRepository.GetConversationAsync(senderId, receiverId);
            return _mapper.Map<List<ResultSupportMessageDto>>(messages);
        }

        public async Task<List<ResultSupportMessageDto>> GetUserMessagesAsync(string userId)
        {
            var messages = await _supportMessageRepository.GetUserMessagesAsync(userId);
            return _mapper.Map<List<ResultSupportMessageDto>>(messages);
        }

        public async Task<List<ResultSupportMessageDto>> GetSupportMessagesAsync()
        {
            var messages = await _supportMessageRepository.GetSupportMessagesAsync();
            return _mapper.Map<List<ResultSupportMessageDto>>(messages);
        }

        public async Task<ResultSupportMessageDto?> GetLatestMessageAsync(string userId)
        {
            var message = await _supportMessageRepository.GetLatestMessageAsync(userId);
            return _mapper.Map<ResultSupportMessageDto>(message);
        }

        public async Task<List<ResultAppUserDto>> GetConversationPartnersAsync(string userId)
        {
            var partners = await _supportMessageRepository.GetConversationPartnersAsync(userId);
            return _mapper.Map<List<ResultAppUserDto>>(partners);
        }

        public async Task CreateAsync(CreateSupportMessageDto dto)
        {
            var message = _mapper.Map<SupportMessage>(dto);
            await _supportMessageRepository.AddAsync(message);
        }

        public async Task DeleteAsync(int id)
        {
            await _supportMessageRepository.DeleteAsync(id);
        }
    }
}
