using AutoMapper;
using Yazilimxyz.BusinessLayer.Abstract;
using Yazilimxyz.BusinessLayer.DTOs.Customer;
using Yazilimxyz.DataAccessLayer.Abstract;
using Yazilimxyz.EntityLayer.Entities;

namespace Yazilimxyz.BusinessLayer.Concrete
{
    public class CustomerManager : ICustomerService
    {
        private readonly ICustomerRepository _customerRepository;
        private readonly IMapper _mapper;

        public CustomerManager(ICustomerRepository customerRepository, IMapper mapper)
        {
            _customerRepository = customerRepository;
            _mapper = mapper;
        }

        public async Task<ResultCustomerDto?> GetByIdAsync(int id)
        {
            var customer = await _customerRepository.GetByIdAsync(id);
            return _mapper.Map<ResultCustomerDto?>(customer);
        }

        public async Task<ResultCustomerDto?> GetByAppUserIdAsync(string appUserId)
        {
            var customer = await _customerRepository.GetByAppUserIdAsync(appUserId);
            return _mapper.Map<ResultCustomerDto?>(customer);
        }

        public async Task<ResultCustomerWithAddressesDto?> GetWithAddressesAsync(int id)
        {
            var customer = await _customerRepository.GetWithAddressesAsync(id);
            return _mapper.Map<ResultCustomerWithAddressesDto?>(customer);
        }

        public async Task CreateAsync(CreateCustomerDto dto)
        {
            var customer = _mapper.Map<Customer>(dto);
            await _customerRepository.AddAsync(customer);
        }

        public async Task UpdateAsync(UpdateCustomerDto dto)
        {
            var existing = await _customerRepository.GetByIdAsync(dto.Id);
            if (existing != null)
            {
                _mapper.Map(dto, existing);
                await _customerRepository.UpdateAsync(existing);
            }
        }

        public async Task DeleteAsync(int id)
        {
            await _customerRepository.DeleteAsync(id);
        }
    }
}
