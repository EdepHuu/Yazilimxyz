using AutoMapper;
using Core.Aspects.Autofac.Caching;
using Core.Utilities.Results;
using SignalRNotificationApi.Models;
using Yazilimxyz.BusinessLayer.Abstract;
using Yazilimxyz.BusinessLayer.Constans;
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

        [CacheAspect]
        public async Task<IDataResult<ResultSupportMessageDto>> GetByIdAsync(int id)
        {
            if (id <= 0)
                return new ErrorDataResult<ResultSupportMessageDto>(Messages.InvalidSupportMessageId);

            var message = await _supportMessageRepository.GetByIdAsync(id);
            if (message == null)
                return new ErrorDataResult<ResultSupportMessageDto>(Messages.SupportMessageNotFound);

            return new SuccessDataResult<ResultSupportMessageDto>(_mapper.Map<ResultSupportMessageDto>(message));
        }

        [CacheAspect]
        public async Task<IDataResult<List<ResultSupportMessageDto>>> GetAllAsync()
        {
            var messages = await _supportMessageRepository.GetAllAsync();
            return new SuccessDataResult<List<ResultSupportMessageDto>>(_mapper.Map<List<ResultSupportMessageDto>>(messages));
        }

        [CacheAspect]
        public async Task<IDataResult<List<ResultSupportMessageDto>>> GetConversationAsync(string senderId, string receiverId)
        {
            if (string.IsNullOrWhiteSpace(senderId))
                return new ErrorDataResult<List<ResultSupportMessageDto>>(Messages.SenderIdRequired);

            if (string.IsNullOrWhiteSpace(receiverId))
                return new ErrorDataResult<List<ResultSupportMessageDto>>(Messages.ReceiverIdRequired);

            if (senderId == receiverId)
                return new ErrorDataResult<List<ResultSupportMessageDto>>(Messages.SenderReceiverSame);

            var messages = await _supportMessageRepository.GetConversationAsync(senderId, receiverId);
            return new SuccessDataResult<List<ResultSupportMessageDto>>(_mapper.Map<List<ResultSupportMessageDto>>(messages));
        }

        [CacheAspect]
        public async Task<IDataResult<List<ResultSupportMessageDto>>> GetUserMessagesAsync(string userId)
        {
            if (string.IsNullOrWhiteSpace(userId))
                return new ErrorDataResult<List<ResultSupportMessageDto>>(Messages.UserIdRequired);

            var messages = await _supportMessageRepository.GetUserMessagesAsync(userId);
            return new SuccessDataResult<List<ResultSupportMessageDto>>(_mapper.Map<List<ResultSupportMessageDto>>(messages));
        }

        [CacheAspect]
        public async Task<IDataResult<List<ResultSupportMessageDto>>> GetSupportMessagesAsync()
        {
            var messages = await _supportMessageRepository.GetSupportMessagesAsync();
            return new SuccessDataResult<List<ResultSupportMessageDto>>(_mapper.Map<List<ResultSupportMessageDto>>(messages));
        }

        [CacheAspect]
        public async Task<IDataResult<ResultSupportMessageDto>> GetLatestMessageAsync(string userId)
        {
            if (string.IsNullOrWhiteSpace(userId))
                return new ErrorDataResult<ResultSupportMessageDto>(Messages.UserIdRequired);

            var message = await _supportMessageRepository.GetLatestMessageAsync(userId);
            if (message == null)
                return new ErrorDataResult<ResultSupportMessageDto>(Messages.SupportMessageNotFound);

            return new SuccessDataResult<ResultSupportMessageDto>(_mapper.Map<ResultSupportMessageDto>(message));
        }

        [CacheAspect]
        public async Task<IDataResult<List<ResultAppUserDto>>> GetConversationPartnersAsync(string userId)
        {
            if (string.IsNullOrWhiteSpace(userId))
                return new ErrorDataResult<List<ResultAppUserDto>>(Messages.UserIdRequired);

            var partners = await _supportMessageRepository.GetConversationPartnersAsync(userId);
            return new SuccessDataResult<List<ResultAppUserDto>>(_mapper.Map<List<ResultAppUserDto>>(partners));
        }

        [CacheRemoveAspect("ISupportMessageService.Get")]
        public async Task<IResult> CreateAsync(CreateSupportMessageDto dto)
        {
            if (dto == null)
                return new ErrorResult(Messages.SupportMessageNotFound);

            if (string.IsNullOrWhiteSpace(dto.Message))
                return new ErrorResult(Messages.MessageContentRequired);

            if (dto.Message.Length > 1000)
                return new ErrorResult(Messages.MessageContentTooLong);

            var message = _mapper.Map<SupportMessage>(dto);
            await _supportMessageRepository.AddAsync(message);

            return new SuccessResult(Messages.SupportMessageCreated);
        }

        [CacheRemoveAspect("ISupportMessageService.Get")]
        public async Task<IResult> DeleteAsync(int id)
        {
            if (id <= 0)
                return new ErrorResult(Messages.InvalidSupportMessageId);

            var existingMessage = await _supportMessageRepository.GetByIdAsync(id);
            if (existingMessage == null)
                return new ErrorResult(Messages.SupportMessageNotFound);

            await _supportMessageRepository.DeleteAsync(id);
            return new SuccessResult(Messages.SupportMessageDeleted);
        }
    }

}