using AutoMapper;
using Core.Aspects.Autofac.Caching;
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

        [CacheAspect] // key, value
        public async Task<ResultSupportMessageDto?> GetByIdAsync(int id)
        {
            // Validation kontrolü
            if (id <= 0)
            {
                throw new ArgumentException("Invalid message ID. ID must be greater than 0.", nameof(id));
            }

            var message = await _supportMessageRepository.GetByIdAsync(id);
            return _mapper.Map<ResultSupportMessageDto>(message);
        }

        [CacheAspect] // key, value
        public async Task<List<ResultSupportMessageDto>> GetAllAsync()
        {
            var messages = await _supportMessageRepository.GetAllAsync();
            return _mapper.Map<List<ResultSupportMessageDto>>(messages);
        }

        [CacheAspect] // key, value
        public async Task<List<ResultSupportMessageDto>> GetConversationAsync(string senderId, string receiverId)
        {
            // Validation kontrolları
            if (string.IsNullOrWhiteSpace(senderId))
            {
                throw new ArgumentException("Sender ID cannot be null or empty.", nameof(senderId));
            }

            if (string.IsNullOrWhiteSpace(receiverId))
            {
                throw new ArgumentException("Receiver ID cannot be null or empty.", nameof(receiverId));
            }

            if (senderId == receiverId)
            {
                throw new ArgumentException("Sender and receiver cannot be the same user.");
            }

            var messages = await _supportMessageRepository.GetConversationAsync(senderId, receiverId);
            return _mapper.Map<List<ResultSupportMessageDto>>(messages);
        }

        [CacheAspect] // key, value
        public async Task<List<ResultSupportMessageDto>> GetUserMessagesAsync(string userId)
        {
            // Validation kontrolü
            if (string.IsNullOrWhiteSpace(userId))
            {
                throw new ArgumentException("User ID cannot be null or empty.", nameof(userId));
            }

            var messages = await _supportMessageRepository.GetUserMessagesAsync(userId);
            return _mapper.Map<List<ResultSupportMessageDto>>(messages);
        }

        [CacheAspect] // key, value
        public async Task<List<ResultSupportMessageDto>> GetSupportMessagesAsync()
        {
            var messages = await _supportMessageRepository.GetSupportMessagesAsync();
            return _mapper.Map<List<ResultSupportMessageDto>>(messages);
        }

        [CacheAspect] // key, value
        public async Task<ResultSupportMessageDto?> GetLatestMessageAsync(string userId)
        {
            // Validation kontrolü
            if (string.IsNullOrWhiteSpace(userId))
            {
                throw new ArgumentException("User ID cannot be null or empty.", nameof(userId));
            }

            var message = await _supportMessageRepository.GetLatestMessageAsync(userId);
            return _mapper.Map<ResultSupportMessageDto>(message);
        }

        [CacheAspect] // key, value
        public async Task<List<ResultAppUserDto>> GetConversationPartnersAsync(string userId)
        {
            // Validation kontrolü
            if (string.IsNullOrWhiteSpace(userId))
            {
                throw new ArgumentException("User ID cannot be null or empty.", nameof(userId));
            }

            var partners = await _supportMessageRepository.GetConversationPartnersAsync(userId);
            return _mapper.Map<List<ResultAppUserDto>>(partners);
        }

        [CacheRemoveAspect("ISupportMessageService.Get")]
        public async Task CreateAsync(CreateSupportMessageDto dto)
        {
            // Validation kontrolları
            if (dto == null)
            {
                throw new ArgumentNullException(nameof(dto), "Support message DTO cannot be null.");
            }

            if (string.IsNullOrWhiteSpace(dto.Message))
            {
                throw new ArgumentException("Message content is required.", nameof(dto.Message));
            }

            if (dto.Message.Length > 1000)
            {
                throw new ArgumentException("Message content cannot exceed 1000 characters.", nameof(dto.Message));
            }

            var message = _mapper.Map<SupportMessage>(dto);
            await _supportMessageRepository.AddAsync(message);
        }

        [CacheRemoveAspect("ISupportMessageService.Get")]
        public async Task DeleteAsync(int id)
        {
            // Validation kontrolları
            if (id <= 0)
            {
                throw new ArgumentException("Invalid message ID. ID must be greater than 0.", nameof(id));
            }

            // Mesajın var olup olmadığını kontrol et
            var existingMessage = await _supportMessageRepository.GetByIdAsync(id);
            if (existingMessage == null)
            {
                throw new InvalidOperationException($"Support message with ID {id} not found.");
            }

            await _supportMessageRepository.DeleteAsync(id);
        }
    }
}