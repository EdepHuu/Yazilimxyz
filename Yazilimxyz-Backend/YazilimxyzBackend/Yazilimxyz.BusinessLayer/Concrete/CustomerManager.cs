using AutoMapper;
using Core.Aspects.Autofac.Caching;
using Core.Utilities.Results;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;
using Yazilimxyz.BusinessLayer.Abstract;
using Yazilimxyz.BusinessLayer.Constans;
using Yazilimxyz.BusinessLayer.DTOs.Customer;
using Yazilimxyz.DataAccessLayer.Abstract;
using Yazilimxyz.EntityLayer.Entities;

namespace Yazilimxyz.BusinessLayer.Concrete
{
    public class CustomerManager : ICustomerService
    {
        private readonly ICustomerRepository _customerRepository;
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _http;

        public CustomerManager(ICustomerRepository customerRepository, IMapper mapper, IHttpContextAccessor http)
        {
            _customerRepository = customerRepository;
            _mapper = mapper;
            _http = http;
        }

        // -------- SELF --------
        [CacheAspect]
        public async Task<IDataResult<ResultCustomerDto?>> GetMyProfileAsync()
        {
            var userId = _http.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return new ErrorDataResult<ResultCustomerDto?>(null, Messages.AuthorizationDenied);

            var customer = await _customerRepository.GetByAppUserIdWithUserAndAddressesAsync(userId);
            if (customer == null)
                return new ErrorDataResult<ResultCustomerDto?>(null, Messages.CustomerNotFound);

            var dto = _mapper.Map<ResultCustomerDto?>(customer);
            return new SuccessDataResult<ResultCustomerDto?>(dto, Messages.CustomerProfileRetrieved);
        }

        // -------- ADMIN --------
        [CacheAspect]
        public async Task<IDataResult<ResultCustomerDto?>> GetByIdAsync(int id)
        {
            if (id <= 0)
                return new ErrorDataResult<ResultCustomerDto?>(null, Messages.InvalidCustomerId);

            var customer = await _customerRepository.GetByIdWithUserAsync(id);
            if (customer == null)
                return new ErrorDataResult<ResultCustomerDto?>(null, Messages.CustomerNotFound);

            var dto = _mapper.Map<ResultCustomerDto?>(customer);
            return new SuccessDataResult<ResultCustomerDto?>(dto);
        }

        [CacheAspect]
        public async Task<IDataResult<ResultCustomerDto?>> GetByAppUserIdAsync(string appUserId)
        {
            if (string.IsNullOrWhiteSpace(appUserId))
                return new ErrorDataResult<ResultCustomerDto?>(null, Messages.InvalidCustomerId);

            var customer = await _customerRepository.GetByAppUserIdWithUserAsync(appUserId);
            if (customer == null)
                return new ErrorDataResult<ResultCustomerDto?>(null, Messages.CustomerNotFound);

            var dto = _mapper.Map<ResultCustomerDto?>(customer);
            return new SuccessDataResult<ResultCustomerDto?>(dto);
        }

        [CacheAspect]
        public async Task<IDataResult<ResultCustomerWithAddressesDto?>> GetWithAddressesAsync(int id)
        {
            if (id <= 0)
                return new ErrorDataResult<ResultCustomerWithAddressesDto?>(null, Messages.InvalidCustomerId);

            var customer = await _customerRepository.GetWithAddressesAsync(id);
            if (customer == null)
                return new ErrorDataResult<ResultCustomerWithAddressesDto?>(null, Messages.CustomerNotFound);

            var dto = _mapper.Map<ResultCustomerWithAddressesDto?>(customer);
            return new SuccessDataResult<ResultCustomerWithAddressesDto?>(dto);
        }

        [CacheRemoveAspect("ICustomerService.Get")]
        public async Task<IResult> AdminCreateAsync(AdminCreateCustomerDto dto)
        {
            if (dto == null)
                return new ErrorResult("Geçersiz istek.");

            if (string.IsNullOrWhiteSpace(dto.AppUserId))
                return new ErrorResult("AppUserId zorunludur.");

            var exists = await _customerRepository.GetByAppUserIdAsync(dto.AppUserId);
            if (exists != null)
                return new ErrorResult(Messages.CustomerAlreadyExists);

            var entity = new Customer
            {
                AppUserId = dto.AppUserId
            };
            await _customerRepository.AddAsync(entity);

            return new SuccessResult(Messages.CustomerAdded);
        }

        [CacheRemoveAspect("ICustomerService.Get")]
        public async Task<IResult> AdminSetActiveAsync(int id, bool isActive)
        {
            if (id <= 0)
                return new ErrorResult(Messages.InvalidCustomerId);

            await _customerRepository.SetActiveAsync(id, isActive);
            return new SuccessResult(Messages.CustomerUpdated);
        }

        // -------- REGISTER --------
        [CacheRemoveAspect("ICustomerService.Get")]
        public async Task<IResult> CreateForUserAsync(string appUserId)
        {
            if (string.IsNullOrWhiteSpace(appUserId))
                return new ErrorResult("AppUserId zorunludur.");

            var exists = await _customerRepository.GetByAppUserIdAsync(appUserId);
            if (exists != null)
                return new ErrorResult(Messages.CustomerAlreadyExists);

            await _customerRepository.AddAsync(new Customer { AppUserId = appUserId });
            return new SuccessResult(Messages.CustomerAdded);
        }
    }
}
