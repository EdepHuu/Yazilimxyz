using AutoMapper;
using Core.Aspects.Autofac.Caching;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;
using Yazilimxyz.BusinessLayer.Abstract;
using Yazilimxyz.BusinessLayer.DTOs.Merchant;
using Yazilimxyz.BusinessLayer.DTOs.Product;
using Yazilimxyz.DataAccessLayer.Abstract;
using Yazilimxyz.EntityLayer.Entities;

namespace Yazilimxyz.BusinessLayer.Concrete
{
    public class MerchantManager : IMerchantService
    {
        private readonly IMerchantRepository _merchantRepository;
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _http;

        public MerchantManager(IMerchantRepository merchantRepository, IMapper mapper, IHttpContextAccessor http)
        {
            _merchantRepository = merchantRepository;
            _mapper = mapper;
            _http = http;
        }

        // ---------- SELF ----------
        [CacheAspect] // key, value
        public async Task<ResultMerchantDto?> GetMyProfileAsync()
        {
            var userId = _http.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return null;
            }

            var me = await _merchantRepository.GetByAppUserIdAsync(userId);
            return _mapper.Map<ResultMerchantDto?>(me);
        }

        [CacheRemoveAspect("IMerchantService.Get")]
        public async Task UpdateMyProfileAsync(UpdateMyMerchantProfileDto dto)
        {
            if (dto == null)
            {
                throw new ArgumentException("Geçersiz veri.");
            }

            var userId = _http.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                throw new UnauthorizedAccessException("Kullanıcı doğrulanamadı.");
            }

            var merchant = await _merchantRepository.GetByAppUserIdAsync(userId);
            if (merchant == null)
            {
                throw new Exception("Merchant profili bulunamadı.");
            }

            if (string.IsNullOrWhiteSpace(dto.CompanyName)) { throw new ArgumentException("Şirket adı zorunludur."); }
            if (string.IsNullOrWhiteSpace(dto.Iban)) { throw new ArgumentException("IBAN zorunludur."); }
            if (string.IsNullOrWhiteSpace(dto.TaxNumber)) { throw new ArgumentException("Vergi numarası zorunludur."); }
            if (string.IsNullOrWhiteSpace(dto.CompanyAddress)) { throw new ArgumentException("Şirket adresi zorunludur."); }
            if (string.IsNullOrWhiteSpace(dto.Phone)) { throw new ArgumentException("Telefon zorunludur."); }

            // (opsiyonel) benzersizlik kontrolleri varsa:
            if (await _merchantRepository.ExistsByIbanAsync(dto.Iban, merchant.Id))
            {
                throw new ArgumentException("Bu IBAN başka bir kayıtta mevcut.");
            }
            if (await _merchantRepository.ExistsByTaxNumberAsync(dto.TaxNumber, merchant.Id))
            {
                throw new ArgumentException("Bu vergi numarası başka bir kayıtta mevcut.");
            }

            merchant.CompanyName = dto.CompanyName;
            merchant.Iban = dto.Iban;
            merchant.TaxNumber = dto.TaxNumber;
            merchant.CompanyAddress = dto.CompanyAddress;
            merchant.Phone = dto.Phone;

            await _merchantRepository.UpdateAsync(merchant);
        }

        // ---------- ADMIN ----------
        [CacheAspect] // key, value
        public async Task<ResultMerchantDto?> GetByIdAsync(int id)
        {
            var merchant = await _merchantRepository.GetByIdAsync(id);
            return _mapper.Map<ResultMerchantDto?>(merchant);
        }

        [CacheAspect] // key, value
        public async Task<ResultMerchantDto?> GetByAppUserIdAsync(string appUserId)
        {
            var merchant = await _merchantRepository.GetByAppUserIdAsync(appUserId);
            return _mapper.Map<ResultMerchantDto?>(merchant);
        }

        [CacheAspect] // key, value
        public async Task<List<ResultMerchantDto>> GetAllAsync()
        {
            var merchants = await _merchantRepository.GetAllAsync();
            return _mapper.Map<List<ResultMerchantDto>>(merchants);
        }

        [CacheAspect] // key, value
        public async Task<List<ResultMerchantDto>> GetByCompanyNameAsync(string companyName)
        {
            var merchants = await _merchantRepository.GetByCompanyName(companyName?.Trim() ?? string.Empty);
            return _mapper.Map<List<ResultMerchantDto>>(merchants);
        }

        [CacheAspect] // key, value
        public async Task<List<ResultProductDto>> GetProductsByMerchantAsync(int merchantId)
        {
            var products = await _merchantRepository.GetProductsByMerchantAsync(merchantId);
            return _mapper.Map<List<ResultProductDto>>(products);
        }

        [CacheRemoveAspect("IMerchantService.Get")]
        public async Task AdminUpdateAsync(int id, UpdateMerchantDto dto)
        {
            if (id <= 0 || dto == null) { throw new ArgumentException("Geçersiz veri."); }

            var merchant = await _merchantRepository.GetByIdAsync(id);
            if (merchant == null) { throw new Exception("Merchant bulunamadı."); }

            if (string.IsNullOrWhiteSpace(dto.CompanyName)) { throw new ArgumentException("Şirket adı zorunludur."); }
            if (string.IsNullOrWhiteSpace(dto.Iban)) { throw new ArgumentException("IBAN zorunludur."); }
            if (string.IsNullOrWhiteSpace(dto.TaxNumber)) { throw new ArgumentException("Vergi numarası zorunludur."); }

            if (await _merchantRepository.ExistsByIbanAsync(dto.Iban, id)) { throw new ArgumentException("Bu IBAN başka bir kayıtta mevcut."); }
            if (await _merchantRepository.ExistsByTaxNumberAsync(dto.TaxNumber, id)) { throw new ArgumentException("Bu vergi numarası başka bir kayıtta mevcut."); }

            merchant.CompanyName = dto.CompanyName;
            merchant.Iban = dto.Iban;
            merchant.TaxNumber = dto.TaxNumber;
            merchant.CompanyAddress = dto.CompanyAddress;
            merchant.Phone = dto.Phone;

            await _merchantRepository.UpdateAsync(merchant);
        }

        [CacheRemoveAspect("IMerchantService.Get")]
        public async Task AdminSetActiveAsync(int id, bool isActive)
        {
            if (id <= 0) { throw new ArgumentException("Geçersiz id."); }
            await _merchantRepository.SetActiveAsync(id, isActive);
        }

        // ---------- REGISTER/ADMIN CREATE ----------
        [CacheRemoveAspect("IMerchantService.Get")]
        public async Task CreateForUserAsync(CreateMerchantDto dto)
        {
            if (dto == null) { throw new ArgumentException("Geçersiz veri."); }
            if (string.IsNullOrWhiteSpace(dto.AppUserId)) { throw new ArgumentException("AppUserId zorunludur."); }

            if (string.IsNullOrWhiteSpace(dto.CompanyName)) { throw new ArgumentException("Şirket adı zorunludur."); }
            if (string.IsNullOrWhiteSpace(dto.Iban)) { throw new ArgumentException("IBAN zorunludur."); }
            if (string.IsNullOrWhiteSpace(dto.TaxNumber)) { throw new ArgumentException("Vergi numarası zorunludur."); }
            if (await _merchantRepository.ExistsByIbanAsync(dto.Iban, null)) { throw new ArgumentException("Bu IBAN başka bir kayıtta mevcut."); }
            if (await _merchantRepository.ExistsByTaxNumberAsync(dto.TaxNumber, null)) { throw new ArgumentException("Bu vergi numarası başka bir kayıtta mevcut."); }

            var entity = _mapper.Map<Merchant>(dto);
            await _merchantRepository.AddAsync(entity);
        }
    }
}