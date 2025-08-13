using AutoMapper;
using Core.Aspects.Autofac.Caching;
using Core.Utilities.Results;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;
using Yazilimxyz.BusinessLayer.Abstract;
using Yazilimxyz.BusinessLayer.Constans;
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

        [CacheAspect]
        public async Task<IDataResult<ResultMerchantDto?>> GetMyProfileAsync()
        {
            var userId = _http.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return new ErrorDataResult<ResultMerchantDto?>(null, Messages.AuthorizationDenied);
            }

            var me = await _merchantRepository.GetByAppUserIdAsync(userId);
            var resultDto = _mapper.Map<ResultMerchantDto?>(me);
            return new SuccessDataResult<ResultMerchantDto?>(resultDto, Messages.CustomerProfileRetrieved);
        }

        [CacheRemoveAspect("IMerchantService.Get")]
        public async Task<IResult> UpdateMyProfileAsync(UpdateMyMerchantProfileDto dto)
        {
            if (dto == null)
                return new ErrorResult("Geçersiz veri.");

            var userId = _http.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return new ErrorResult(Messages.AuthorizationDenied);

            var merchant = await _merchantRepository.GetByAppUserIdAsync(userId);
            if (merchant == null)
                return new ErrorResult("Merchant profili bulunamadı.");

            if (string.IsNullOrWhiteSpace(dto.CompanyName)) return new ErrorResult("Şirket adı zorunludur.");
            if (string.IsNullOrWhiteSpace(dto.Iban)) return new ErrorResult("IBAN zorunludur.");
            if (string.IsNullOrWhiteSpace(dto.TaxNumber)) return new ErrorResult("Vergi numarası zorunludur.");
            if (string.IsNullOrWhiteSpace(dto.CompanyAddress)) return new ErrorResult("Şirket adresi zorunludur.");
            if (string.IsNullOrWhiteSpace(dto.Phone)) return new ErrorResult("Telefon zorunludur.");

            if (await _merchantRepository.ExistsByIbanAsync(dto.Iban, merchant.Id))
                return new ErrorResult("Bu IBAN başka bir kayıtta mevcut.");
            if (await _merchantRepository.ExistsByTaxNumberAsync(dto.TaxNumber, merchant.Id))
                return new ErrorResult("Bu vergi numarası başka bir kayıtta mevcut.");

            merchant.CompanyName = dto.CompanyName;
            merchant.Iban = dto.Iban;
            merchant.TaxNumber = dto.TaxNumber;
            merchant.CompanyAddress = dto.CompanyAddress;
            merchant.Phone = dto.Phone;

            await _merchantRepository.UpdateAsync(merchant);

            return new SuccessResult("Profil başarıyla güncellendi.");
        }

        // ---------- ADMIN ----------

        [CacheAspect]
        public async Task<IDataResult<ResultMerchantDto?>> GetByIdAsync(int id)
        {
            var merchant = await _merchantRepository.GetByIdAsync(id);
            if (merchant == null)
                return new ErrorDataResult<ResultMerchantDto?>(null, Messages.CustomerNotFound);

            var dto = _mapper.Map<ResultMerchantDto?>(merchant);
            return new SuccessDataResult<ResultMerchantDto?>(dto, Messages.CustomerProfileRetrieved);
        }

        [CacheAspect]
        public async Task<IDataResult<ResultMerchantDto?>> GetByAppUserIdAsync(string appUserId)
        {
            var merchant = await _merchantRepository.GetByAppUserIdAsync(appUserId);
            if (merchant == null)
                return new ErrorDataResult<ResultMerchantDto?>(null, Messages.CustomerNotFound);

            var dto = _mapper.Map<ResultMerchantDto?>(merchant);
            return new SuccessDataResult<ResultMerchantDto?>(dto, Messages.CustomerProfileRetrieved);
        }

        [CacheAspect]
        public async Task<IDataResult<List<ResultMerchantDto>>> GetAllAsync()
        {
            var merchants = await _merchantRepository.GetAllAsync();
            var dtos = _mapper.Map<List<ResultMerchantDto>>(merchants);
            return new SuccessDataResult<List<ResultMerchantDto>>(dtos, Messages.CustomersListed);
        }

        [CacheAspect]
        public async Task<IDataResult<List<ResultMerchantDto>>> GetByCompanyNameAsync(string companyName)
        {
            var merchants = await _merchantRepository.GetByCompanyName(companyName?.Trim() ?? string.Empty);
            var dtos = _mapper.Map<List<ResultMerchantDto>>(merchants);
            return new SuccessDataResult<List<ResultMerchantDto>>(dtos, Messages.CustomersListed);
        }

        [CacheAspect]
        public async Task<IDataResult<List<ResultProductDto>>> GetProductsByMerchantAsync(int merchantId)
        {
            var products = await _merchantRepository.GetProductsByMerchantAsync(merchantId);
            var dtos = _mapper.Map<List<ResultProductDto>>(products);
            return new SuccessDataResult<List<ResultProductDto>>(dtos, Messages.ProductsListed);
        }

        [CacheRemoveAspect("IMerchantService.Get")]
        public async Task<IResult> AdminUpdateAsync(int id, UpdateMerchantDto dto)
        {
            if (id <= 0 || dto == null)
                return new ErrorResult("Geçersiz veri.");

            var merchant = await _merchantRepository.GetByIdAsync(id);
            if (merchant == null)
                return new ErrorResult(Messages.CustomerNotFound);

            if (string.IsNullOrWhiteSpace(dto.CompanyName))
                return new ErrorResult("Şirket adı zorunludur.");
            if (string.IsNullOrWhiteSpace(dto.Iban))
                return new ErrorResult("IBAN zorunludur.");
            if (string.IsNullOrWhiteSpace(dto.TaxNumber))
                return new ErrorResult("Vergi numarası zorunludur.");

            if (await _merchantRepository.ExistsByIbanAsync(dto.Iban, id))
                return new ErrorResult("Bu IBAN başka bir kayıtta mevcut.");
            if (await _merchantRepository.ExistsByTaxNumberAsync(dto.TaxNumber, id))
                return new ErrorResult("Bu vergi numarası başka bir kayıtta mevcut.");

            merchant.CompanyName = dto.CompanyName;
            merchant.Iban = dto.Iban;
            merchant.TaxNumber = dto.TaxNumber;
            merchant.CompanyAddress = dto.CompanyAddress;
            merchant.Phone = dto.Phone;

            await _merchantRepository.UpdateAsync(merchant);

            return new SuccessResult(Messages.CustomerUpdated);
        }

        [CacheRemoveAspect("IMerchantService.Get")]
        public async Task<IResult> AdminSetActiveAsync(int id, bool isActive)
        {
            if (id <= 0)
                return new ErrorResult("Geçersiz id.");

            await _merchantRepository.SetActiveAsync(id, isActive);
            return new SuccessResult("Durum başarıyla güncellendi.");
        }

        // ---------- REGISTER/ADMIN CREATE ----------

        [CacheRemoveAspect("IMerchantService.Get")]
        public async Task<IResult> CreateForUserAsync(CreateMerchantDto dto)
        {
            if (dto == null)
                return new ErrorResult("Geçersiz veri.");
            if (string.IsNullOrWhiteSpace(dto.AppUserId))
                return new ErrorResult("AppUserId zorunludur.");

            if (string.IsNullOrWhiteSpace(dto.CompanyName))
                return new ErrorResult("Şirket adı zorunludur.");
            if (string.IsNullOrWhiteSpace(dto.Iban))
                return new ErrorResult("IBAN zorunludur.");
            if (string.IsNullOrWhiteSpace(dto.TaxNumber))
                return new ErrorResult("Vergi numarası zorunludur.");

            if (await _merchantRepository.ExistsByIbanAsync(dto.Iban, null))
                return new ErrorResult("Bu IBAN başka bir kayıtta mevcut.");
            if (await _merchantRepository.ExistsByTaxNumberAsync(dto.TaxNumber, null))
                return new ErrorResult("Bu vergi numarası başka bir kayıtta mevcut.");

            var entity = _mapper.Map<Merchant>(dto);
            await _merchantRepository.AddAsync(entity);

            return new SuccessResult(Messages.CustomerAdded);
        }
    }
}
