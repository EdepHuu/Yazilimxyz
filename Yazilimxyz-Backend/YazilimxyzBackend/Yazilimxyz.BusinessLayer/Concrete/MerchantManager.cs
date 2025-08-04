using AutoMapper;
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

        public MerchantManager(IMerchantRepository merchantRepository, IMapper mapper)
        {
            _merchantRepository = merchantRepository;
            _mapper = mapper;
        }

        public async Task<ResultMerchantDto?> GetByIdAsync(int id)
        {
            var merchant = await _merchantRepository.GetByIdAsync(id);
            return _mapper.Map<ResultMerchantDto?>(merchant);
        }

        public async Task<ResultMerchantDto?> GetByAppUserIdAsync(string appUserId)
        {
            var merchant = await _merchantRepository.GetByAppUserIdAsync(appUserId);
            return _mapper.Map<ResultMerchantDto?>(merchant);
        }

        public async Task<List<ResultMerchantDto>> GetAllAsync()
        {
            var merchants = await _merchantRepository.GetAllAsync();
            return _mapper.Map<List<ResultMerchantDto>>(merchants);
        }

        public async Task<List<ResultMerchantDto>> GetByCompanyNameAsync(string companyName)
        {
            var merchants = await _merchantRepository.GetByCompanyName(companyName);
            return _mapper.Map<List<ResultMerchantDto>>(merchants);
        }

        public async Task<List<ResultProductDto>> GetProductsByMerchantAsync(int merchantId)
        {
            var products = await _merchantRepository.GetProductsByMerchantAsync(merchantId);
            return _mapper.Map<List<ResultProductDto>>(products);
        }

        public async Task CreateAsync(CreateMerchantDto dto)
        {
            var merchant = _mapper.Map<Merchant>(dto);
            await _merchantRepository.AddAsync(merchant);
        }

        public async Task UpdateAsync(UpdateMerchantDto dto)
        {
            var existing = await _merchantRepository.GetByIdAsync(dto.Id);
            if (existing != null)
            {
                _mapper.Map(dto, existing);
                await _merchantRepository.UpdateAsync(existing);
            }
        }

        public async Task DeleteAsync(int id)
        {
            await _merchantRepository.DeleteAsync(id);
        }
    }
}
