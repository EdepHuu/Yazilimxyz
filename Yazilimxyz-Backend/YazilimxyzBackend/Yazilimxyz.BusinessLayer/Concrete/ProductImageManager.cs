using AutoMapper;
using Yazilimxyz.BusinessLayer.Abstract;
using Yazilimxyz.BusinessLayer.DTOs.ProductImage;
using Yazilimxyz.DataAccessLayer.Abstract;
using Yazilimxyz.EntityLayer.Entities;

namespace Yazilimxyz.BusinessLayer.Concrete
{
    public class ProductImageManager : IProductImageService
    {
        private readonly IProductImageRepository _productImageRepository;
        private readonly IMapper _mapper;

        public ProductImageManager(IProductImageRepository productImageRepository, IMapper mapper)
        {
            _productImageRepository = productImageRepository;
            _mapper = mapper;
        }

        public async Task<ResultProductImageDto?> GetByIdAsync(int id)
        {
            var image = await _productImageRepository.GetByIdAsync(id);
            return _mapper.Map<ResultProductImageDto>(image);
        }

        public async Task<List<ResultProductImageDto>> GetAllAsync()
        {
            var images = await _productImageRepository.GetAllAsync();
            return _mapper.Map<List<ResultProductImageDto>>(images);
        }

        public async Task<List<ResultProductImageDto>> GetByProductIdAsync(int productId)
        {
            var images = await _productImageRepository.GetByProductIdAsync(productId);
            return _mapper.Map<List<ResultProductImageDto>>(images);
        }

        public async Task<ResultProductImageDto?> GetMainImageAsync(int productId)
        {
            var mainImage = await _productImageRepository.GetMainImageAsync(productId);
            return _mapper.Map<ResultProductImageDto>(mainImage);
        }

        public async Task ReorderImagesAsync(int productId, List<int> imageIds)
        {
            await _productImageRepository.ReorderImagesAsync(productId, imageIds);
        }

        public async Task CreateAsync(CreateProductImageDto dto)
        {
            var image = _mapper.Map<ProductImage>(dto);
            await _productImageRepository.AddAsync(image);
        }

        public async Task UpdateAsync(UpdateProductImageDto dto)
        {
            var image = await _productImageRepository.GetByIdAsync(dto.Id);
            if (image != null)
            {
                _mapper.Map(dto, image);
                await _productImageRepository.UpdateAsync(image);
            }
        }

        public async Task DeleteAsync(int id)
        {
            await _productImageRepository.DeleteAsync(id);
        }
    }
}
