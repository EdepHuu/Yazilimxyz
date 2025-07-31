using AutoMapper;
using Yazilimxyz.BusinessLayer.Abstract;
using Yazilimxyz.BusinessLayer.DTOs.Merchant;
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

        public async Task<List<ResultMerchantDto>> GetAllAsync()
        {
            var merchants = await _merchantRepository.GetAllAsync();
            return _mapper.Map<List<ResultMerchantDto>>(merchants);
        }

        public async Task<ResultMerchantDto> GetByIdAsync(int id)
        {
            var merchant = await _merchantRepository.GetByIdAsync(id);
            return _mapper.Map<ResultMerchantDto>(merchant);
        }

        public async Task CreateAsync(CreateMerchantDto dto)
        {
            var merchant = _mapper.Map<Merchant>(dto);
            await _merchantRepository.AddAsync(merchant);
        }

        public async Task UpdateAsync(UpdateMerchantDto dto)
        {
            var merchant = _mapper.Map<Merchant>(dto);
            await _merchantRepository.UpdateAsync(merchant);
        }

        public async Task DeleteAsync(int id)
        {
            var merchant = await _merchantRepository.GetByIdAsync(id);
            if (merchant != null)
            {
                await _merchantRepository.DeleteAsync(merchant);
            }
        }
    }
}
