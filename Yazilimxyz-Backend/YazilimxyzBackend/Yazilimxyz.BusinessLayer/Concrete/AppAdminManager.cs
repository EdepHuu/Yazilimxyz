using AutoMapper;
using Microsoft.AspNetCore.Identity;
using System.Collections.Generic;
using System.Threading.Tasks;
using Yazilimxyz.BusinessLayer.Abstract;
using Yazilimxyz.BusinessLayer.DTOs.AppAdmin;
using Yazilimxyz.DataAccessLayer.Abstract;
using Yazilimxyz.EntityLayer.Entities;

namespace Yazilimxyz.BusinessLayer.Concrete
{
    public class AppAdminManager : IAppAdminService
    {
        private readonly IAppAdminRepository _appAdminRepository;
        private readonly IMapper _mapper;
        private readonly UserManager<AppUser> _userManager;

        public AppAdminManager(IAppAdminRepository appAdminRepository, IMapper mapper, UserManager<AppUser> userManager)
        {
            _appAdminRepository = appAdminRepository;
            _mapper = mapper;
            _userManager = userManager;
        }

        public async Task<List<ResultAppAdminDto>> GetAllActiveAsync()
        {
            var admins = await _appAdminRepository.GetAllActiveAsync();
            return _mapper.Map<List<ResultAppAdminDto>>(admins);
        }

        public async Task<ResultAppAdminDto?> GetByIdAsync(string id)
        {
            var admin = await _appAdminRepository.GetByIdAsync(id);
            return _mapper.Map<ResultAppAdminDto?>(admin);
        }

        public async Task<ResultAppAdminDto?> GetByEmailAsync(string email)
        {
            var admin = await _appAdminRepository.GetByEmailAsync(email);
            return _mapper.Map<ResultAppAdminDto?>(admin);
        }

        public async Task<bool> ExistsAsync(string id)
        {
            return await _appAdminRepository.ExistsAsync(id);
        }

        public async Task<ResultAppAdminDto?> CreateAsync(CreateAppAdminDto dto, string password)
        {
            var admin = _mapper.Map<AppAdmin>(dto);
            var created = await _appAdminRepository.CreateAsync(admin, password);
            return _mapper.Map<ResultAppAdminDto?>(created);
        }

        public async Task<ResultAppAdminDto?> UpdateAsync(UpdateAppAdminDto dto)
        {
            var existingAdmin = await _appAdminRepository.GetByIdAsync(dto.AppUserId);
            if (existingAdmin == null) return null;

            _mapper.Map(dto, existingAdmin);
            var updated = await _appAdminRepository.UpdateAsync(existingAdmin);
            return _mapper.Map<ResultAppAdminDto?>(updated);
        }

        public async Task DeleteAsync(string id)
        {
            await _appAdminRepository.DeleteAsync(id);
        }
    }
}
