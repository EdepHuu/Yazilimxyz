using AutoMapper;
using Core.Aspects.Autofac.Caching;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;
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
        private readonly IHttpContextAccessor _httpContextAccessor;

        public ProductImageManager(IProductImageRepository productImageRepository, IMapper mapper, IHttpContextAccessor httpContextAccessor)
        {
            _productImageRepository = productImageRepository;
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<GetByIdProductImageDto?> GetByIdAsync(int id)
        {
            if (id <= 0)
            {
                throw new Exception("Id 0'dan büyük olmalıdır.");
            }

            var image = await _productImageRepository.GetByIdAsync(id);
            return _mapper.Map<GetByIdProductImageDto>(image);
        }

        [CacheAspect] // key, value - Tüm resimler cache'lenir
        public async Task<List<ResultProductImageDto>> GetAllAsync()
        {
            var images = await _productImageRepository.GetAllAsync();
            return _mapper.Map<List<ResultProductImageDto>>(images);
        }

        [CacheAspect] // Ürüne göre resimler cache'lenir
        public async Task<List<ResultProductImageDto>> GetByProductIdAsync(int productId)
        {
            if (productId <= 0)
            {
                throw new Exception("ProductId 0'dan büyük olmalıdır.");
            }

            var images = await _productImageRepository.GetByProductIdAsync(productId);
            return _mapper.Map<List<ResultProductImageDto>>(images);
        }

        [CacheAspect] // Main resim cache'lenir
        public async Task<ResultProductImageDto?> GetMainImageAsync(int productId)
        {
            if (productId <= 0)
            {
                throw new Exception("ProductId 0'dan büyük olmalıdır.");
            }

            var mainImage = await _productImageRepository.GetMainImageAsync(productId);
            return _mapper.Map<ResultProductImageDto>(mainImage);
        }

        [CacheRemoveAspect("IProductImageService.Get")] // Cache temizlenir
        public async Task ReorderImagesAsync(int productId, List<int> imageIds)
        {
            if (productId <= 0)
            {
                throw new Exception("ProductId 0'dan büyük olmalıdır.");
            }

            if (imageIds == null || !imageIds.Any())
            {
                throw new Exception("Resim ID listesi boş olamaz.");
            }

            if (imageIds.Any(id => id <= 0))
            {
                throw new Exception("Tüm resim ID'leri 0'dan büyük olmalıdır.");
            }

            if (imageIds.Count != imageIds.Distinct().Count())
            {
                throw new Exception("Resim ID listesinde tekrar eden değerler olamaz.");
            }

            await CheckProductOwnershipAsync(productId);

            // Reorder sadece main olmayanlar için geçerli
            var allImages = await _productImageRepository.GetByProductIdAsync(productId);
            var mainImage = allImages.FirstOrDefault(x => x.IsMain);

            // Main dışındaki resimler listede yoksa: geçersiz
            var nonMainImageIds = allImages.Where(x => !x.IsMain).Select(x => x.Id).ToList();
            if (!imageIds.All(id => nonMainImageIds.Contains(id)))
                throw new Exception("Sıralama listesi yalnızca main olmayan resimleri içermelidir.");

            await _productImageRepository.ReorderImagesAsync(productId, imageIds);
        }

        [CacheRemoveAspect("IProductImageService.Get")] // Cache temizlenir
        public async Task CreateAsync(CreateProductImageDto dto)
        {
            // Validation
            if (dto.ProductId <= 0)
            {
                throw new Exception("ProductId 0'dan büyük olmalıdır.");
            }

            if (string.IsNullOrWhiteSpace(dto.ImageUrl))
            {
                throw new Exception("Resim URL'si boş olamaz.");
            }

            if (dto.ImageUrl.Length > 500)
            {
                throw new Exception("Resim URL'si maksimum 500 karakter olabilir.");
            }

            // URL format kontrolü
            if (!Uri.TryCreate(dto.ImageUrl, UriKind.Absolute, out var uri) ||
                (uri.Scheme != Uri.UriSchemeHttp && uri.Scheme != Uri.UriSchemeHttps))
            {
                throw new Exception("Geçerli bir URL formatı giriniz.");
            }

            if (!string.IsNullOrWhiteSpace(dto.AltText) && dto.AltText.Length > 255)
            {
                throw new Exception("Alt text maksimum 255 karakter olabilir.");
            }

            var product = await _productImageRepository.GetProductWithMerchantAsync(dto.ProductId);
            if (product == null)
                throw new Exception("Ürün bulunamadı.");

            var userId = _httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                throw new UnauthorizedAccessException("Kullanıcı doğrulanamadı.");

            if (product.AppUserId != userId)
                throw new UnauthorizedAccessException("Bu ürüne fotoğraf ekleme yetkiniz yok.");

            // Ürünün mevcut fotoğraflarını çek
            var existingImages = await _productImageRepository.GetByProductIdAsync(dto.ProductId);

            // Maksimum resim sayısı kontrolü (örnek: 10)
            if (existingImages.Count() >= 10)
            {
                throw new Exception("Bir ürün için maksimum 10 resim eklenebilir.");
            }

            var image = _mapper.Map<ProductImage>(dto);

            // ❗ Otomatik SortOrder ata
            image.SortOrder = existingImages.Any()
                ? existingImages.Max(i => i.SortOrder) + 1
                : 1;

            // ❗ Eğer ürünün hiç main fotoğrafı yoksa, bunu main yap
            var existingMain = await _productImageRepository.GetMainImageAsync(dto.ProductId);
            image.IsMain = existingMain == null;

            await _productImageRepository.AddAsync(image);
        }

        [CacheRemoveAspect("IProductImageService.Get")] // Cache temizlenir
        public async Task SetMainImageAsync(int imageId)
        {
            if (imageId <= 0)
            {
                throw new Exception("Resim ID'si 0'dan büyük olmalıdır.");
            }

            var selectedImage = await _productImageRepository.GetByIdAsync(imageId);
            if (selectedImage == null)
                throw new Exception("Fotoğraf bulunamadı.");

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
        }

        [CacheRemoveAspect("IProductImageService.Get")] // Cache temizlenir
        public async Task UpdateAsync(UpdateProductImageDto dto)
        {
            // Validation
            if (dto.Id <= 0)
            {
                throw new Exception("Id 0'dan büyük olmalıdır.");
            }

            if (dto.ProductId <= 0)
            {
                throw new Exception("ProductId 0'dan büyük olmalıdır.");
            }

            if (string.IsNullOrWhiteSpace(dto.ImageUrl))
            {
                throw new Exception("Resim URL'si boş olamaz.");
            }

            if (dto.ImageUrl.Length > 500)
            {
                throw new Exception("Resim URL'si maksimum 500 karakter olabilir.");
            }

            // URL format kontrolü
            if (!Uri.TryCreate(dto.ImageUrl, UriKind.Absolute, out var uri) ||
                (uri.Scheme != Uri.UriSchemeHttp && uri.Scheme != Uri.UriSchemeHttps))
            {
                throw new Exception("Geçerli bir URL formatı giriniz.");
            }

            if (!string.IsNullOrWhiteSpace(dto.AltText) && dto.AltText.Length > 255)
            {
                throw new Exception("Alt text maksimum 255 karakter olabilir.");
            }

            var image = await _productImageRepository.GetByIdAsync(dto.Id);
            if (image == null)
                throw new Exception("Fotoğraf bulunamadı.");

            await CheckProductOwnershipAsync(image.ProductId);

            if (dto.ProductId != image.ProductId)
                throw new Exception("ProductId güncellenemez veya geçersiz.");

            image.ImageUrl = dto.ImageUrl;
            image.AltText = dto.AltText;

            await _productImageRepository.UpdateAsync(image);
        }

        [CacheRemoveAspect("IProductImageService.Get")] // Cache temizlenir
        public async Task DeleteAsync(int id)
        {
            if (id <= 0)
            {
                throw new Exception("Id 0'dan büyük olmalıdır.");
            }

            var image = await _productImageRepository.GetByIdAsync(id);
            if (image == null)
            {
                throw new Exception("Fotoğraf bulunamadı.");
            }

            await CheckProductOwnershipAsync(image.ProductId);

            // Main resim silinmeye çalışılırsa uyarı ver
            if (image.IsMain)
            {
                var otherImages = await _productImageRepository.GetByProductIdAsync(image.ProductId);
                if (otherImages.Count() > 1)
                {
                    throw new Exception("Ana resim silinemez. Önce başka bir resmi ana resim yapınız.");
                }
            }

            await _productImageRepository.DeleteAsync(id);
        }

        private async Task CheckProductOwnershipAsync(int productId)
        {
            if (productId <= 0)
            {
                throw new Exception("ProductId 0'dan büyük olmalıdır.");
            }

            var userId = _httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                throw new UnauthorizedAccessException("Kullanıcı doğrulanamadı.");

            var product = await _productImageRepository.GetProductWithMerchantAsync(productId);
            if (product == null)
                throw new Exception("Ürün bulunamadı.");

            if (product.AppUserId != userId)
                throw new UnauthorizedAccessException("Bu ürüne işlem yapma yetkiniz yok.");
        }
    }
}