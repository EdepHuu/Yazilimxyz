using Microsoft.Extensions.Hosting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Yazilimxyz.CoreLayer.Storage;

namespace Yazilimxyz.InfrastructureLayer.Storage
{
	public class LocalFileStorage : IFileStorage
	{
		private readonly IHostEnvironment _env;
		public LocalFileStorage(IHostEnvironment env) => _env = env;

		public async Task<FileSaveResult> SaveAsync(Stream stream, string originalFileName, string subFolder)
		{
			var webRoot = Path.Combine(_env.ContentRootPath, "wwwroot");
			var uploadsRoot = Path.Combine(webRoot, "uploads", subFolder ?? string.Empty);
			Directory.CreateDirectory(uploadsRoot);

			var ext = Path.GetExtension(originalFileName);
			var finalName = $"{Guid.NewGuid():N}{ext}".ToLowerInvariant();
			var fullPath = Path.Combine(uploadsRoot, finalName);

			using (var fs = new FileStream(fullPath, FileMode.Create, FileAccess.Write, FileShare.None))
				await stream.CopyToAsync(fs);

			var relative = $"/uploads/{subFolder}/{finalName}".Replace("\\", "/");
			return new FileSaveResult
			{
				FileName = finalName,
				RelativePath = relative,
				PublicUrl = relative // base URL'yi controller tarafında birleştiririz
			};
		}

		public Task<bool> DeleteAsync(string relativePath)
		{
			var webRoot = Path.Combine(_env.ContentRootPath, "wwwroot");
			var fullPath = Path.Combine(webRoot, relativePath.TrimStart('/').Replace("/", Path.DirectorySeparatorChar.ToString()));
			if (File.Exists(fullPath))
			{
				File.Delete(fullPath);
				return Task.FromResult(true);
			}
			return Task.FromResult(false);
		}
	}
}
