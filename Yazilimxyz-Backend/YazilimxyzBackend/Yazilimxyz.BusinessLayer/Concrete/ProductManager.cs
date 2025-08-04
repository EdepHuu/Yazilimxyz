using AutoMapper;
using System.Collections.Generic;
using System.Threading.Tasks;
using Yazilimxyz.BusinessLayer.Abstract;
using Yazilimxyz.BusinessLayer.DTOs.Product;
using Yazilimxyz.DataAccessLayer.Abstract;
using Yazilimxyz.EntityLayer.Entities;
using Yazilimxyz.EntityLayer.Enums;

namespace Yazilimxyz.BusinessLayer.Concrete
{
    public class ProductManager : IProductService
    {
        private readonly IProductRepository _productRepository;
        private readonly IMapper _mapper;

        public ProductManager(IProductRepository productRepository, IMapper mapper)
        {
            _productRepository = productRepository;
            _mapper = mapper;
        }

        public async Task<ResultProductDto?> GetByIdAsync(int id)
        {
            var product = await _productRepository.GetByIdAsync(id);
            return _mapper.Map<ResultProductDto>(product);
        }

        public async Task<List<ResultProductDto>> GetAllAsync()
        {
            var products = await _productRepository.GetAllAsync();
            return _mapper.Map<List<ResultProductDto>>(products);
        }

        public async Task<List<ResultProductDto>> GetActiveAsync()
        {
            var products = await _productRepository.GetActiveAsync();
            return _mapper.Map<List<ResultProductDto>>(products);
        }

        public async Task<List<ResultProductDto>> GetByCategoryIdAsync(int categoryId)
        {
            var products = await _productRepository.GetByCategoryIdAsync(categoryId);
            return _mapper.Map<List<ResultProductDto>>(products);
        }

        public async Task<List<ResultProductDto>> GetByMerchantIdAsync(int merchantId)
        {
            var products = await _productRepository.GetByMerchantIdAsync(merchantId);
            return _mapper.Map<List<ResultProductDto>>(products);
        }

        public async Task<List<ResultProductDto>> GetByGenderAsync(GenderType gender)
        {
            var products = await _productRepository.GetByGenderAsync(gender);
            return _mapper.Map<List<ResultProductDto>>(products);
        }

        //public async Task<ResultProductWithVariantsDto?> GetWithVariantsAsync(int id)
        //{
        //    var product = await _productRepository.GetWithVariantsAsync(id);
        //    return _mapper.Map<ResultProductWithVariantsDto>(product);
        //}

        //public async Task<ResultProductWithImagesDto?> GetWithImagesAsync(int id)
        //{
        //    var product = await _productRepository.GetWithImagesAsync(id);
        //    return _mapper.Map<ResultProductWithImagesDto>(product);
        //}

        //public async Task<ResultProductDetailedDto?> GetDetailedAsync(int id)
        //{
        //    var product = await _productRepository.GetDetailedAsync(id);
        //    return _mapper.Map<ResultProductDetailedDto>(product);
        //}

        public async Task<List<ResultProductDto>> SearchAsync(string searchTerm)
        {
            var products = await _productRepository.SearchAsync(searchTerm);
            return _mapper.Map<List<ResultProductDto>>(products);
        }

        public async Task CreateAsync(CreateProductDto dto)
        {
            var product = _mapper.Map<Product>(dto);
            await _productRepository.AddAsync(product);
        }

        public async Task UpdateAsync(UpdateProductDto dto)
        {
            var product = await _productRepository.GetByIdAsync(dto.Id);
            if (product != null)
            {
                _mapper.Map(dto, product);
                await _productRepository.UpdateAsync(product);
            }
        }

        public async Task DeleteAsync(int id)
        {
            await _productRepository.DeleteAsync(id);
        }
    }
}
