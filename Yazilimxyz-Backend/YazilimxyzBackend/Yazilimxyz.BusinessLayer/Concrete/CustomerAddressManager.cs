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
            if (dto == null) return new ErrorResult("Geçersiz istek.");
            if (dto.CustomerId <= 0) return new ErrorResult(Messages.InvalidCustomerId);
            if (string.IsNullOrWhiteSpace(dto.FullName)) return new ErrorResult("Ad Soyad zorunludur.");
            if (string.IsNullOrWhiteSpace(dto.Phone)) return new ErrorResult("Telefon numarası zorunludur.");
            if (string.IsNullOrWhiteSpace(dto.Address)) return new ErrorResult("Adres bilgisi zorunludur.");
            
            // Posta kodu kontrolü
            if (string.IsNullOrWhiteSpace(dto.PostalCode) ||
                dto.PostalCode.Length != 5 ||
                !dto.PostalCode.All(char.IsDigit))
            {
                return new ErrorResult("Posta kodu 5 rakamdan oluşmalıdır.");
            }

            // 1) Insert sırasında indexe takılmamak için her zaman false kaydediyoruz
            var wantDefault = dto.IsDefault;
            var address = _mapper.Map<CustomerAddress>(dto);
            address.IsDefault = false;

            await _customerAddressRepository.AddAsync(address); // EF return sonrası address.Id dolu olur

            // 2) Default isteniyorsa şimdi ayarla (eski default'u otomatik false yapacak)
            if (wantDefault)
            {
                await _customerAddressRepository.SetDefaultAddressAsync(address.CustomerId, address.Id);
            }
            else
            {
                // İsteğe bağlı: hiç default yoksa bunu default yap
                var currentDefault = await _customerAddressRepository.GetDefaultAddressAsync(address.CustomerId);
                if (currentDefault is null)
                    await _customerAddressRepository.SetDefaultAddressAsync(address.CustomerId, address.Id);
            }

            return new SuccessResult(Messages.CustomerAddressAdded);
        }

        [CacheRemoveAspect("ICustomerAddressService.Get")]
        public async Task<IResult> UpdateAsync(int id, UpdateCustomerAddressDto dto)
        {
            if (dto == null) return new ErrorResult("Geçersiz istek.");
            if (id <= 0) return new ErrorResult(Messages.InvalidAddressId);

            var existing = await _customerAddressRepository.GetByIdAsync(id);
            if (existing == null) return new ErrorResult(Messages.CustomerAddressNotFound);

            if (string.IsNullOrWhiteSpace(dto.FullName)) return new ErrorResult("Ad Soyad zorunludur.");
            if (string.IsNullOrWhiteSpace(dto.Phone)) return new ErrorResult("Telefon numarası zorunludur.");
            if (string.IsNullOrWhiteSpace(dto.Address)) return new ErrorResult("Adres bilgisi zorunludur.");

            // Posta kodu kontrolü
            if (string.IsNullOrWhiteSpace(dto.PostalCode) ||
                dto.PostalCode.Length != 5 ||
                !dto.PostalCode.All(char.IsDigit))
            {
                return new ErrorResult("Posta kodu 5 rakamdan oluşmalıdır.");
            }

            // 1) Default'u şimdilik elleme, diğer alanları güncelle
            var wantDefault = dto.IsDefault;

            existing.Title = dto.Title;
            existing.FullName = dto.FullName;
            existing.Phone = dto.Phone;
            existing.Address = dto.Address;
            existing.AddressLine2 = dto.AddressLine2;
            existing.City = dto.City;
            existing.District = dto.District;
            existing.PostalCode = dto.PostalCode;
            existing.Country = dto.Country;

            await _customerAddressRepository.UpdateAsync(existing);

            // 2) Default yapılması isteniyorsa şimdi ayarla (indexe takılmadan)
            if (wantDefault && !existing.IsDefault)
            {
                await _customerAddressRepository.SetDefaultAddressAsync(existing.CustomerId, existing.Id);
            }

            return new SuccessResult(Messages.CustomerAddressUpdated);
        }

        [CacheRemoveAspect("ICustomerAddressService.Get")]
        public async Task<IResult> DeleteAsync(int id)
        {
            if (id <= 0)
                return new ErrorResult("Geçersiz adres ID.");

            var address = await _customerAddressRepository.GetByIdAsync(id);
            if (address == null)
                return new ErrorResult("Adres bulunamadı.");

            bool wasDefault = address.IsDefault;
            int customerId = address.CustomerId;

            await _customerAddressRepository.DeleteAsync(id);

            if (wasDefault)
            {
                var latestAddress = await _customerAddressRepository.GetLatestByCustomerIdAsync(customerId);

                if (latestAddress != null)
                {
                    latestAddress.IsDefault = true;
                    await _customerAddressRepository.UpdateAsync(latestAddress);
                }
            }

            return new SuccessResult("Adres başarıyla silindi.");
        }
    }
}
