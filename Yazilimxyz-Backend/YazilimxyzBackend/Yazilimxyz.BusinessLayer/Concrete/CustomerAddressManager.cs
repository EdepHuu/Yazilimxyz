using AutoMapper;
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

        public async Task<List<ResultCustomerAddressDto>> GetByCustomerIdAsync(int customerId)
        {
            var addresses = await _customerAddressRepository.GetByCustomerIdAsync(customerId);
            return _mapper.Map<List<ResultCustomerAddressDto>>(addresses);
        }

        public async Task<ResultCustomerAddressDto?> GetDefaultAddressAsync(int customerId)
        {
            var address = await _customerAddressRepository.GetDefaultAddressAsync(customerId);
            return _mapper.Map<ResultCustomerAddressDto?>(address);
        }

        public async Task SetDefaultAddressAsync(int customerId, int addressId)
        {
            await _customerAddressRepository.SetDefaultAddressAsync(customerId, addressId);
        }

        public async Task<ResultCustomerAddressDto?> GetByIdAsync(int id)
        {
            var address = await _customerAddressRepository.GetByIdAsync(id);
            return _mapper.Map<ResultCustomerAddressDto?>(address);
        }

        public async Task CreateAsync(CreateCustomerAddressDto dto)
        {
            var address = _mapper.Map<CustomerAddress>(dto);
            await _customerAddressRepository.AddAsync(address);
        }

        public async Task UpdateAsync(UpdateCustomerAddressDto dto)
        {
            var existing = await _customerAddressRepository.GetByIdAsync(dto.Id);
            if (existing != null)
            {
                _mapper.Map(dto, existing);
                await _customerAddressRepository.UpdateAsync(existing);
            }
        }

        public async Task DeleteAsync(int id)
        {
            await _customerAddressRepository.DeleteAsync(id);
        }
    }
}
