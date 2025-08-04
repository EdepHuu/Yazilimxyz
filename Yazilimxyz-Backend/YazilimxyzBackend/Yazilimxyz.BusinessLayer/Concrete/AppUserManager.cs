using AutoMapper;
using Yazilimxyz.BusinessLayer.Abstract;
using Yazilimxyz.BusinessLayer.DTOs.AppUser;
using Yazilimxyz.DataAccessLayer.Abstract;
using Yazilimxyz.EntityLayer.Entities;

namespace Yazilimxyz.BusinessLayer.Concrete
{
    public class AppUserManager : IAppUserService
    {
        private readonly IAppUserRepository _appUserRepository;
        private readonly IMapper _mapper;

        public AppUserManager(IAppUserRepository appUserRepository, IMapper mapper)
        {
            _appUserRepository = appUserRepository;
            _mapper = mapper;
        }

        public async Task<ResultAppUserDto?> GetByIdAsync(string id)
        {
            var user = await _appUserRepository.GetByIdAsync(id);
            return user is not null ? _mapper.Map<ResultAppUserDto>(user) : null;
        }

        public async Task<ResultAppUserDto?> GetByEmailAsync(string email)
        {
            var user = await _appUserRepository.GetByEmailAsync(email);
            return user is not null ? _mapper.Map<ResultAppUserDto>(user) : null;
        }

        //public async Task<ResultAppUserWithCustomerDto?> GetWithCustomerAsync(string id)
        //{
        //    var user = await _appUserRepository.GetWithCustomerAsync(id);
        //    return user is not null ? _mapper.Map<ResultAppUserWithCustomerDto>(user) : null;
        //}

        //public async Task<ResultAppUserWithMerchantDto?> GetWithMerchantAsync(string id)
        //{
        //    var user = await _appUserRepository.GetWithMerchantAsync(id);
        //    return user is not null ? _mapper.Map<ResultAppUserWithMerchantDto>(user) : null;
        //}

        public async Task<List<ResultAppUserDto>> GetAllAsync()
        {
            var users = await _appUserRepository.GetAllAsync();
            return _mapper.Map<List<ResultAppUserDto>>(users);
        }

        public async Task<bool> ExistsAsync(string id)
        {
            return await _appUserRepository.ExistsAsync(id);
        }

        public async Task CreateAsync(CreateAppUserDto dto)
        {
            var user = _mapper.Map<AppUser>(dto);
            await _appUserRepository.CreateAsync(user);
        }

        public async Task UpdateAsync(UpdateAppUserDto dto)
        {
            var user = _mapper.Map<AppUser>(dto);
            await _appUserRepository.UpdateAsync(user);
        }

        public async Task DeleteAsync(string id)
        {
            await _appUserRepository.DeleteAsync(id);
        }
    }
}
