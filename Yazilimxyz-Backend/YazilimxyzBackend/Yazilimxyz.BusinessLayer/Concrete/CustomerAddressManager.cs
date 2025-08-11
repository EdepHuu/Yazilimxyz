using AutoMapper;
using Core.Aspects.Autofac.Caching;
using Core.Utilities.Results;
using Yazilimxyz.BusinessLayer.Abstract;
using Yazilimxyz.BusinessLayer.Constans;
using Yazilimxyz.BusinessLayer.DTOs.CustomerAddress;
using Yazilimxyz.DataAccessLayer.Abstract;
using Yazilimxyz.EntityLayer.Entities;

namespace Yazilimxyz.BusinessLayer.Concrete
{
    public class CustomerAddressManager : ICustomerAddressService
    {
        private readonly ICustomerAddressRepository _customerAddressRepository;
        private readonly IMapper _mapper;

        public CustomerAddressManager(ICustomerAddressRepository customerAddressRepository, IMapper mapper)
        {
            _customerAddressRepository = customerAddressRepository;
            _mapper = mapper;
        }

        [CacheAspect]
        public async Task<IDataResult<List<ResultCustomerAddressDto>>> GetByCustomerIdAsync(int customerId)
        {
            if (customerId <= 0)
                return new ErrorDataResult<List<ResultCustomerAddressDto>>(Messages.InvalidCustomerId);

            var addresses = await _customerAddressRepository.GetByCustomerIdAsync(customerId);
            var resultDto = _mapper.Map<List<ResultCustomerAddressDto>>(addresses);

            return new SuccessDataResult<List<ResultCustomerAddressDto>>(resultDto, Messages.CustomerAddressesListed);
        }

        [CacheAspect]
        public async Task<IDataResult<ResultCustomerAddressDto?>> GetDefaultAddressAsync(int customerId)
        {
            if (customerId <= 0)
                return new ErrorDataResult<ResultCustomerAddressDto?>(null, Messages.InvalidCustomerId);

            var address = await _customerAddressRepository.GetDefaultAddressAsync(customerId);

            if (address == null)
                return new ErrorDataResult<ResultCustomerAddressDto?>(null, Messages.DefaultAddressNotFound);

            var mapped = _mapper.Map<ResultCustomerAddressDto?>(address);
            return new SuccessDataResult<ResultCustomerAddressDto?>(mapped, Messages.DefaultAddressSet);
        }

        [CacheRemoveAspect("ICustomerAddressService.Get")]
        public async Task<IResult> SetDefaultAddressAsync(int customerId, int addressId)
        {
            if (customerId <= 0)
                return new ErrorResult(Messages.InvalidCustomerId);

            if (addressId <= 0)
                return new ErrorResult(Messages.InvalidAddressId);

            await _customerAddressRepository.SetDefaultAddressAsync(customerId, addressId);
            return new SuccessResult(Messages.DefaultAddressSet);
        }

        [CacheAspect]
        public async Task<IDataResult<ResultCustomerAddressDto?>> GetByIdAsync(int id)
        {
            if (id <= 0)
                return new ErrorDataResult<ResultCustomerAddressDto?>(null, Messages.InvalidAddressId);

            var address = await _customerAddressRepository.GetByIdAsync(id);

            if (address == null)
                return new ErrorDataResult<ResultCustomerAddressDto?>(null, Messages.CustomerAddressNotFound);

            var mapped = _mapper.Map<ResultCustomerAddressDto?>(address);
            return new SuccessDataResult<ResultCustomerAddressDto?>(mapped);
        }

        [CacheRemoveAspect("ICustomerAddressService.Get")]
        public async Task<IResult> CreateAsync(CreateCustomerAddressDto dto)
        {
            if (dto == null)
                return new ErrorResult("Geçersiz istek.");

            if (dto.CustomerId <= 0)
                return new ErrorResult(Messages.InvalidCustomerId);

            if (string.IsNullOrWhiteSpace(dto.FullName))
                return new ErrorResult("Ad Soyad zorunludur.");

            if (string.IsNullOrWhiteSpace(dto.Phone))
                return new ErrorResult("Telefon numarası zorunludur.");

            if (string.IsNullOrWhiteSpace(dto.Address))
                return new ErrorResult("Adres bilgisi zorunludur.");

            var address = _mapper.Map<CustomerAddress>(dto);
            await _customerAddressRepository.AddAsync(address);

            return new SuccessResult(Messages.CustomerAddressAdded);
        }

        [CacheRemoveAspect("ICustomerAddressService.Get")]
        public async Task<IResult> UpdateAsync(UpdateCustomerAddressDto dto)
        {
            if (dto == null)
                return new ErrorResult("Geçersiz istek.");

            if (dto.Id <= 0)
                return new ErrorResult(Messages.InvalidAddressId);

            var existing = await _customerAddressRepository.GetByIdAsync(dto.Id);
            if (existing == null)
                return new ErrorResult(Messages.CustomerAddressNotFound);

            if (string.IsNullOrWhiteSpace(dto.FullName))
                return new ErrorResult("Ad Soyad zorunludur.");

            if (string.IsNullOrWhiteSpace(dto.Phone))
                return new ErrorResult("Telefon numarası zorunludur.");

            if (string.IsNullOrWhiteSpace(dto.Address))
                return new ErrorResult("Adres bilgisi zorunludur.");

            _mapper.Map(dto, existing);
            await _customerAddressRepository.UpdateAsync(existing);

            return new SuccessResult(Messages.CustomerAddressUpdated);
        }

        [CacheRemoveAspect("ICustomerAddressService.Get")]
        public async Task<IResult> DeleteAsync(int id)
        {
            if (id <= 0)
                return new ErrorResult(Messages.InvalidAddressId);

            var existing = await _customerAddressRepository.GetByIdAsync(id);
            if (existing == null)
                return new ErrorResult(Messages.CustomerAddressNotFound);

            await _customerAddressRepository.DeleteAsync(id);

            return new SuccessResult(Messages.CustomerAddressDeleted);
        }
    }
}
