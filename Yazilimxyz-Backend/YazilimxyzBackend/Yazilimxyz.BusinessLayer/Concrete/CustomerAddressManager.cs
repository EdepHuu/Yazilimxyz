using AutoMapper;
using Core.Aspects.Autofac.Caching;
using Yazilimxyz.BusinessLayer.Abstract;
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

        [CacheAspect] // key, value
        public async Task<List<ResultCustomerAddressDto>> GetByCustomerIdAsync(int customerId)
        {
            if (customerId <= 0)
                throw new ArgumentException("Geçersiz müşteri id.");

            var addresses = await _customerAddressRepository.GetByCustomerIdAsync(customerId);
            return _mapper.Map<List<ResultCustomerAddressDto>>(addresses);
        }

        [CacheAspect] // key, value
        public async Task<ResultCustomerAddressDto?> GetDefaultAddressAsync(int customerId)
        {
            if (customerId <= 0)
                throw new ArgumentException("Geçersiz müşteri id.");

            var address = await _customerAddressRepository.GetDefaultAddressAsync(customerId);
            return _mapper.Map<ResultCustomerAddressDto?>(address);
        }

        [CacheRemoveAspect("ICustomerAddressService.Get")]
        public async Task SetDefaultAddressAsync(int customerId, int addressId)
        {
            if (customerId <= 0)
                throw new ArgumentException("Geçersiz müşteri id.");

            if (addressId <= 0)
                throw new ArgumentException("Geçersiz adres id.");

            await _customerAddressRepository.SetDefaultAddressAsync(customerId, addressId);
        }

        [CacheAspect] // key, value
        public async Task<ResultCustomerAddressDto?> GetByIdAsync(int id)
        {
            if (id <= 0)
                throw new ArgumentException("Geçersiz adres id.");

            var address = await _customerAddressRepository.GetByIdAsync(id);
            return _mapper.Map<ResultCustomerAddressDto?>(address);
        }

        [CacheRemoveAspect("ICustomerAddressService.Get")]
        public async Task CreateAsync(CreateCustomerAddressDto dto)
        {
            if (dto == null)
                throw new ArgumentException("Geçersiz istek.");

            if (dto.CustomerId <= 0)
                throw new ArgumentException("Geçersiz müşteri id.");

            if (string.IsNullOrWhiteSpace(dto.FullName))
                throw new ArgumentException("Ad Soyad zorunludur.");

            if (string.IsNullOrWhiteSpace(dto.Phone))
                throw new ArgumentException("Telefon numarası zorunludur.");

            if (string.IsNullOrWhiteSpace(dto.Address))
                throw new ArgumentException("Adres bilgisi zorunludur.");

            var address = _mapper.Map<CustomerAddress>(dto);
            await _customerAddressRepository.AddAsync(address);
        }

        [CacheRemoveAspect("ICustomerAddressService.Get")]
        public async Task UpdateAsync(UpdateCustomerAddressDto dto)
        {
            if (dto == null)
                throw new ArgumentException("Geçersiz istek.");

            if (dto.Id <= 0)
                throw new ArgumentException("Geçersiz adres id.");

            var existing = await _customerAddressRepository.GetByIdAsync(dto.Id);
            if (existing == null)
                throw new ArgumentException("Adres bulunamadı.");

            if (string.IsNullOrWhiteSpace(dto.FullName))
                throw new ArgumentException("Ad Soyad zorunludur.");

            if (string.IsNullOrWhiteSpace(dto.Phone))
                throw new ArgumentException("Telefon numarası zorunludur.");

            if (string.IsNullOrWhiteSpace(dto.Address))
                throw new ArgumentException("Adres bilgisi zorunludur.");

            _mapper.Map(dto, existing);
            await _customerAddressRepository.UpdateAsync(existing);
        }

        [CacheRemoveAspect("ICustomerAddressService.Get")]
        public async Task DeleteAsync(int id)
        {
            if (id <= 0)
                throw new ArgumentException("Geçersiz adres id.");

            var existing = await _customerAddressRepository.GetByIdAsync(id);
            if (existing == null)
                throw new ArgumentException("Adres bulunamadı.");

            await _customerAddressRepository.DeleteAsync(id);
        }
    }
}