
﻿using AutoMapper;
using Core.Aspects.Autofac.Caching;
using Core.Utilities.Results;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;
using Yazilimxyz.BusinessLayer.Abstract;
using Yazilimxyz.BusinessLayer.Constans;
using Yazilimxyz.BusinessLayer.DTOs.ProductImage;
using Yazilimxyz.CoreLayer.Storage;
using Yazilimxyz.DataAccessLayer.Abstract;
using Yazilimxyz.EntityLayer.Entities;

namespace Yazilimxyz.BusinessLayer.Concrete
{
    public class ProductImageManager : IProductImageService
    {
        private readonly IProductImageRepository _productImageRepository;
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IFileStorage _storage;

        public ProductImageManager(
            IProductImageRepository productImageRepository,
            IMapper mapper,
            IHttpContextAccessor httpContextAccessor,
            IFileStorage storage)
        {
            _productImageRepository = productImageRepository;
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
            _storage = storage;
        }

        public async Task<IDataResult<GetByIdProductImageDto>> GetByIdAsync(int id)
        {
            if (id <= 0)
                return new ErrorDataResult<GetByIdProductImageDto>(null, "Id 0'dan büyük olmalıdır.");

            var image = await _productImageRepository.GetByIdAsync(id);
            if (image == null)
                return new ErrorDataResult<GetByIdProductImageDto>(null, Messages.ProductImageNotFound);

            return new SuccessDataResult<GetByIdProductImageDto>(_mapper.Map<GetByIdProductImageDto>(image), Messages.ProductImagesListed);
        }

        [CacheAspect]
        public async Task<IDataResult<List<ResultProductImageDto>>> GetAllAsync()
        {
            var images = await _productImageRepository.GetAllAsync();
            return new SuccessDataResult<List<ResultProductImageDto>>(_mapper.Map<List<ResultProductImageDto>>(images), Messages.ProductImagesListed);
        }

        [CacheAspect]
        public async Task<IDataResult<List<ResultProductImageDto>>> GetByProductIdAsync(int productId)
        {
            if (productId <= 0)
                return new ErrorDataResult<List<ResultProductImageDto>>(null, "ProductId 0'dan büyük olmalıdır.");

            var images = await _productImageRepository.GetByProductIdAsync(productId);
            return new SuccessDataResult<List<ResultProductImageDto>>(_mapper.Map<List<ResultProductImageDto>>(images), Messages.ProductImagesListed);
        }

        [CacheAspect]
        public async Task<IDataResult<ResultProductImageDto>> GetMainImageAsync(int productId)
        {
            if (productId <= 0)
                return new ErrorDataResult<ResultProductImageDto>(null, "ProductId 0'dan büyük olmalıdır.");

            var mainImage = await _productImageRepository.GetMainImageAsync(productId);
            if (mainImage == null)
                return new ErrorDataResult<ResultProductImageDto>(null, Messages.ProductImageNotFound);

            return new SuccessDataResult<ResultProductImageDto>(_mapper.Map<ResultProductImageDto>(mainImage), Messages.ProductMainImageSet);
        }

        [CacheRemoveAspect("IProductImageService.Get")]
        public async Task<IResult> ReorderImagesAsync(int productId, List<int> imageIds)
        {
            if (productId <= 0)
                return new ErrorResult("ProductId 0'dan büyük olmalıdır.");
            if (imageIds == null || !imageIds.Any())
                return new ErrorResult("Resim ID listesi boş olamaz.");
            if (imageIds.Any(id => id <= 0))
                return new ErrorResult("Tüm resim ID'leri 0'dan büyük olmalıdır.");
            if (imageIds.Count != imageIds.Distinct().Count())
                return new ErrorResult("Resim ID listesinde tekrar eden değerler olamaz.");

            await CheckProductOwnershipAsync(productId);

            var allImages = await _productImageRepository.GetByProductIdAsync(productId);
            var nonMainImageIds = allImages.Where(x => !x.IsMain).Select(x => x.Id).ToList();
            if (!imageIds.All(id => nonMainImageIds.Contains(id)))
                return new ErrorResult("Sıralama listesi yalnızca main olmayan resimleri içermelidir.");

            await _productImageRepository.ReorderImagesAsync(productId, imageIds);
            return new SuccessResult(Messages.ProductImagesReordered);
        }

        [CacheRemoveAspect("IProductImageService.Get")]
        public async Task<IResult> CreateAsync(CreateProductImageDto dto)
        {
            if (dto == null)
                return new ErrorResult("Veri gönderilmedi.");
            if (dto.ProductId <= 0)
                return new ErrorResult("ProductId 0'dan büyük olmalıdır.");
            if (dto.Image == null || dto.Image.Length == 0)
                return new ErrorResult("Geçerli bir resim dosyası yükleyiniz.");
            if (!IsAllowedImage(dto.Image))
                return new ErrorResult("Sadece JPEG/PNG/GIF türünde ve 10MB'dan küçük dosyalar kabul edilir.");

            var product = await _productImageRepository.GetProductWithMerchantAsync(dto.ProductId);
            if (product == null)
                return new ErrorResult("Ürün bulunamadı.");

            var userId = _httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return new ErrorResult("Kullanıcı doğrulanamadı.");
            if (product.AppUserId != userId)
                return new ErrorResult("Bu ürüne fotoğraf ekleme yetkiniz yok.");

            var existingImages = await _productImageRepository.GetByProductIdAsync(dto.ProductId);
            if (existingImages.Count() >= 10)
                return new ErrorResult(Messages.ProductImageLimit);

            var subFolder = $"products/{dto.ProductId}";
            using var stream = dto.Image.OpenReadStream();
            var saved = await _storage.SaveAsync(stream, dto.Image.FileName, subFolder);

            var image = new ProductImage
            {
                ProductId = dto.ProductId,
                AltText = string.IsNullOrWhiteSpace(dto.AltText) ? "" : dto.AltText!,
                ImageUrl = saved.RelativePath,
                SortOrder = existingImages.Any() ? existingImages.Max(i => i.SortOrder) + 1 : 1,
                IsMain = (await _productImageRepository.GetMainImageAsync(dto.ProductId)) == null
            };

            await _productImageRepository.AddAsync(image);
            return new SuccessResult(Messages.ProductImageAdded);
        }

        [CacheRemoveAspect("IProductImageService.Get")]
        public async Task<IResult> SetMainImageAsync(int imageId)
        {
            if (imageId <= 0)
                return new ErrorResult("Resim ID'si 0'dan büyük olmalıdır.");

            var selectedImage = await _productImageRepository.GetByIdAsync(imageId);
            if (selectedImage == null)
                return new ErrorResult(Messages.ProductImageNotFound);

            await CheckProductOwnershipAsync(selectedImage.ProductId);

            var currentMain = await _productImageRepository.GetMainImageAsync(selectedImage.ProductId);

            if (currentMain != null && currentMain.Id != selectedImage.Id)
            {
                await _productImageRepository.ResetMainImageAsync(selectedImage.ProductId);
                selectedImage.IsMain = true;
                await _productImageRepository.SwapImageOrderAsync(currentMain.Id, selectedImage.Id);
            }
            else
            {
                await _productImageRepository.ResetMainImageAsync(selectedImage.ProductId);
                selectedImage.IsMain = true;
            }

            await _productImageRepository.UpdateAsync(selectedImage);
            return new SuccessResult(Messages.ProductMainImageSet);
        }

        [CacheRemoveAspect("IProductImageService.Get")]
        public async Task<IResult> UpdateAsync(UpdateProductImageDto dto)
        {
            if (dto.Id <= 0)
                return new ErrorResult("Id 0'dan büyük olmalıdır.");
            if (dto.ProductId <= 0)
                return new ErrorResult("ProductId 0'dan büyük olmalıdır.");
            if (!string.IsNullOrWhiteSpace(dto.AltText) && dto.AltText!.Length > 255)
                return new ErrorResult("Alt text maksimum 255 karakter olabilir.");

            var image = await _productImageRepository.GetByIdAsync(dto.Id);
            if (image == null)
                return new ErrorResult(Messages.ProductImageNotFound);

            await CheckProductOwnershipAsync(image.ProductId);
            if (dto.ProductId != image.ProductId)
                return new ErrorResult("ProductId güncellenemez veya geçersiz.");

            if (dto.Image != null && dto.Image.Length > 0)
            {
                if (!IsAllowedImage(dto.Image))
                    return new ErrorResult("Sadece JPEG/PNG/GIF türünde ve 10MB'dan küçük dosyalar kabul edilir.");

                var subFolder = $"products/{dto.ProductId}";
                using var stream = dto.Image.OpenReadStream();
                var saved = await _storage.SaveAsync(stream, dto.Image.FileName, subFolder);

                if (!string.IsNullOrWhiteSpace(image.ImageUrl))
                    _ = _storage.DeleteAsync(image.ImageUrl);

                image.ImageUrl = saved.RelativePath;
            }

            image.AltText = dto.AltText ?? image.AltText;

            await _productImageRepository.UpdateAsync(image);
            return new SuccessResult(Messages.ProductImageUpdated);
        }

        [CacheRemoveAspect("IProductImageService.Get")]
        public async Task<IResult> DeleteAsync(int id)
        {
            if (id <= 0)
                return new ErrorResult("Id 0'dan büyük olmalıdır.");

            var image = await _productImageRepository.GetByIdAsync(id);
            if (image == null)
                return new ErrorResult(Messages.ProductImageNotFound);

            await CheckProductOwnershipAsync(image.ProductId);

            var siblings = await _productImageRepository.GetByProductIdAsync(image.ProductId);
            if (image.IsMain && siblings.Count() > 1)
                return new ErrorResult("Ana resim silinemez. Önce başka bir resmi ana resim yapınız.");

            if (!string.IsNullOrWhiteSpace(image.ImageUrl))
                _ = _storage.DeleteAsync(image.ImageUrl);

            await _productImageRepository.DeleteAsync(id);
            return new SuccessResult(Messages.ProductImageDeleted);
        }

        private async Task CheckProductOwnershipAsync(int productId)
        {
            if (productId <= 0)
                throw new Exception("ProductId 0'dan büyük olmalıdır.");

            var userId = _httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                throw new UnauthorizedAccessException("Kullanıcı doğrulanamadı.");

            var product = await _productImageRepository.GetProductWithMerchantAsync(productId);
            if (product == null)
                throw new Exception("Ürün bulunamadı.");

            if (product.AppUserId != userId)
                throw new UnauthorizedAccessException("Bu ürüne işlem yapma yetkiniz yok.");
        }

        private static bool IsAllowedImage(IFormFile file)
        {
            const long maxBytes = 10 * 1024 * 1024;
            if (file.Length <= 0 || file.Length > maxBytes) return false;

            var allowed = new[] { "image/jpeg", "image/png", "image/gif", "image/webp" };
            return allowed.Contains(file.ContentType);
        }
    }

}

