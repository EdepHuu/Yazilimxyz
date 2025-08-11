
﻿using AutoMapper;
using Core.Aspects.Autofac.Caching;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;
using Yazilimxyz.BusinessLayer.Abstract;
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
		private readonly IFileStorage _storage;   // << ekle

		public ProductImageManager(
			IProductImageRepository productImageRepository,
			IMapper mapper,
			IHttpContextAccessor httpContextAccessor,
			IFileStorage storage)                 // << ekle
		{
			_productImageRepository = productImageRepository;
			_mapper = mapper;
			_httpContextAccessor = httpContextAccessor;
			_storage = storage;                   // << ekle
		}

		public async Task<GetByIdProductImageDto?> GetByIdAsync(int id)
		{
			if (id <= 0)
				throw new Exception("Id 0'dan büyük olmalıdır.");

			var image = await _productImageRepository.GetByIdAsync(id);
			return _mapper.Map<GetByIdProductImageDto>(image);
		}

		[CacheAspect]
		public async Task<List<ResultProductImageDto>> GetAllAsync()
		{
			var images = await _productImageRepository.GetAllAsync();
			return _mapper.Map<List<ResultProductImageDto>>(images);
		}

		[CacheAspect]
		public async Task<List<ResultProductImageDto>> GetByProductIdAsync(int productId)
		{
			if (productId <= 0)
				throw new Exception("ProductId 0'dan büyük olmalıdır.");

			var images = await _productImageRepository.GetByProductIdAsync(productId);
			return _mapper.Map<List<ResultProductImageDto>>(images);
		}

		[CacheAspect]
		public async Task<ResultProductImageDto?> GetMainImageAsync(int productId)
		{
			if (productId <= 0)
				throw new Exception("ProductId 0'dan büyük olmalıdır.");

			var mainImage = await _productImageRepository.GetMainImageAsync(productId);
			return _mapper.Map<ResultProductImageDto>(mainImage);
		}

		[CacheRemoveAspect("IProductImageService.Get")]
		public async Task ReorderImagesAsync(int productId, List<int> imageIds)
		{
			if (productId <= 0)
				throw new Exception("ProductId 0'dan büyük olmalıdır.");
			if (imageIds == null || !imageIds.Any())
				throw new Exception("Resim ID listesi boş olamaz.");
			if (imageIds.Any(id => id <= 0))
				throw new Exception("Tüm resim ID'leri 0'dan büyük olmalıdır.");
			if (imageIds.Count != imageIds.Distinct().Count())
				throw new Exception("Resim ID listesinde tekrar eden değerler olamaz.");

			await CheckProductOwnershipAsync(productId);

			var allImages = await _productImageRepository.GetByProductIdAsync(productId);
			var nonMainImageIds = allImages.Where(x => !x.IsMain).Select(x => x.Id).ToList();
			if (!imageIds.All(id => nonMainImageIds.Contains(id)))
				throw new Exception("Sıralama listesi yalnızca main olmayan resimleri içermelidir.");

			await _productImageRepository.ReorderImagesAsync(productId, imageIds);
		}

		// -------------------------------
		// CREATE (upload ile)
		// -------------------------------
		[CacheRemoveAspect("IProductImageService.Get")]
		public async Task CreateAsync(CreateProductImageDto dto)
		{
			if (dto == null)
				throw new Exception("Veri gönderilmedi.");
			if (dto.ProductId <= 0)
				throw new Exception("ProductId 0'dan büyük olmalıdır.");
			if (dto.Image == null || dto.Image.Length == 0)
				throw new Exception("Geçerli bir resim dosyası yükleyiniz.");
			if (!IsAllowedImage(dto.Image))
				throw new Exception("Sadece JPEG/PNG/GIF türünde ve 10MB'dan küçük dosyalar kabul edilir.");

			var product = await _productImageRepository.GetProductWithMerchantAsync(dto.ProductId);
			if (product == null)
				throw new Exception("Ürün bulunamadı.");

			var userId = _httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
			if (string.IsNullOrEmpty(userId))
				throw new UnauthorizedAccessException("Kullanıcı doğrulanamadı.");
			if (product.AppUserId != userId)
				throw new UnauthorizedAccessException("Bu ürüne fotoğraf ekleme yetkiniz yok.");

			var existingImages = await _productImageRepository.GetByProductIdAsync(dto.ProductId);
			if (existingImages.Count() >= 10)
				throw new Exception("Bir ürün için maksimum 10 resim eklenebilir.");

			// Dosyayı kaydet
			var subFolder = $"products/{dto.ProductId}";
			using var stream = dto.Image.OpenReadStream();
			var saved = await _storage.SaveAsync(stream, dto.Image.FileName, subFolder); // saved.RelativePath DB’ye yazılır

			var image = new ProductImage
			{
				ProductId = dto.ProductId,
				AltText = string.IsNullOrWhiteSpace(dto.AltText) ? "" : dto.AltText!,
				ImageUrl = saved.RelativePath, // relative path
				SortOrder = existingImages.Any() ? existingImages.Max(i => i.SortOrder) + 1 : 1,
				IsMain = (await _productImageRepository.GetMainImageAsync(dto.ProductId)) == null
			};

			await _productImageRepository.AddAsync(image);
		}

		// -------------------------------
		// SET MAIN
		// -------------------------------
		[CacheRemoveAspect("IProductImageService.Get")]
		public async Task SetMainImageAsync(int imageId)
		{
			if (imageId <= 0)
				throw new Exception("Resim ID'si 0'dan büyük olmalıdır.");

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

		// -------------------------------
		// UPDATE (isteğe bağlı yeni dosya ile)
		// -------------------------------
		[CacheRemoveAspect("IProductImageService.Get")]
		public async Task UpdateAsync(UpdateProductImageDto dto)
		{
			// Beklenen yeni DTO:
			// public int Id {get;set;}
			// public int ProductId {get;set;}
			// public IFormFile? Image {get;set;}   // opsiyonel: yüklenirse resim değişir
			// public string? AltText {get;set;}

			if (dto.Id <= 0)
				throw new Exception("Id 0'dan büyük olmalıdır.");
			if (dto.ProductId <= 0)
				throw new Exception("ProductId 0'dan büyük olmalıdır.");
			if (!string.IsNullOrWhiteSpace(dto.AltText) && dto.AltText!.Length > 255)
				throw new Exception("Alt text maksimum 255 karakter olabilir.");

			var image = await _productImageRepository.GetByIdAsync(dto.Id);
			if (image == null)
				throw new Exception("Fotoğraf bulunamadı.");

			await CheckProductOwnershipAsync(image.ProductId);
			if (dto.ProductId != image.ProductId)
				throw new Exception("ProductId güncellenemez veya geçersiz.");

			// Yeni dosya geldiyse: kaydet ve eskisini sil
			if (dto.Image != null && dto.Image.Length > 0)
			{
				if (!IsAllowedImage(dto.Image))
					throw new Exception("Sadece JPEG/PNG/GIF türünde ve 10MB'dan küçük dosyalar kabul edilir.");

				var subFolder = $"products/{dto.ProductId}";
				using var stream = dto.Image.OpenReadStream();
				var saved = await _storage.SaveAsync(stream, dto.Image.FileName, subFolder);

				// Eski dosyayı sil (relative path)
				if (!string.IsNullOrWhiteSpace(image.ImageUrl))
					_ = _storage.DeleteAsync(image.ImageUrl);

				image.ImageUrl = saved.RelativePath; // relative path
			}

			image.AltText = dto.AltText ?? image.AltText;

			await _productImageRepository.UpdateAsync(image);
		}

		// -------------------------------
		// DELETE (dosyayı da sil)
		// -------------------------------
		[CacheRemoveAspect("IProductImageService.Get")]
		public async Task DeleteAsync(int id)
		{
			if (id <= 0)
				throw new Exception("Id 0'dan büyük olmalıdır.");

			var image = await _productImageRepository.GetByIdAsync(id);
			if (image == null)
				throw new Exception("Fotoğraf bulunamadı.");

			await CheckProductOwnershipAsync(image.ProductId);

			// Main resim koruması (başka resim varsa)
			var siblings = await _productImageRepository.GetByProductIdAsync(image.ProductId);
			if (image.IsMain && siblings.Count() > 1)
				throw new Exception("Ana resim silinemez. Önce başka bir resmi ana resim yapınız.");

			// Dosyayı sil (relative path)
			if (!string.IsNullOrWhiteSpace(image.ImageUrl))
				_ = _storage.DeleteAsync(image.ImageUrl);

			await _productImageRepository.DeleteAsync(id);
		}

		// -------------------------------
		// Helpers
		// -------------------------------
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
			// 10 MB sınır
			const long maxBytes = 10 * 1024 * 1024;
			if (file.Length <= 0 || file.Length > maxBytes) return false;

			var allowed = new[] { "image/jpeg", "image/png", "image/gif", "image/webp" }; // WEBP eklendi
			return allowed.Contains(file.ContentType);
		}
	}
}

