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
			// --- subFolder güvenliği (../ vb. engelle)
			var safeSub = (subFolder ?? string.Empty)
				.Replace('\\', '/')
				.Trim()
				.TrimStart('/')
				.TrimEnd('/');

			if (safeSub.Split('/').Any(seg => seg == ".." || seg == "." || string.IsNullOrWhiteSpace(seg)))
				throw new InvalidOperationException("Geçersiz alt klasör yolu.");

			var webRoot = Path.Combine(_env.ContentRootPath, "wwwroot");
			var uploads = Path.Combine(webRoot, "uploads");
			var targetDir = Path.Combine(uploads, safeSub);

			Directory.CreateDirectory(targetDir);

			var ext = Path.GetExtension(originalFileName);
			if (string.IsNullOrWhiteSpace(ext)) ext = ".bin"; // güvenli varsayılan
			var fileName = $"{Guid.NewGuid():N}{ext}".ToLowerInvariant();

			var fullPath = Path.Combine(targetDir, fileName);
			using (var fs = new FileStream(fullPath, FileMode.Create, FileAccess.Write, FileShare.None))
				await stream.CopyToAsync(fs);

			var relative = $"/uploads/{safeSub}/{fileName}".Replace("\\", "/");

			return new FileSaveResult
			{
				FileName = fileName,
				RelativePath = relative,     // ör: /uploads/merchant/5/products/12/abc.webp
				PublicUrl = relative        // dışarıda base URL ile birleştirilebilir
			};
		}

		public Task<bool> DeleteAsync(string relativePath)
		{
			if (string.IsNullOrWhiteSpace(relativePath))
				return Task.FromResult(false);

			// absolute URL geldiyse kırp
			var pathPart = relativePath;
			var idx = relativePath.IndexOf("/uploads/", StringComparison.OrdinalIgnoreCase);
			if (idx >= 0) pathPart = relativePath.Substring(idx);

			var webRoot = Path.Combine(_env.ContentRootPath, "wwwroot");
			var fullPath = Path.Combine(
				webRoot,
				pathPart.TrimStart('/').Replace("/", Path.DirectorySeparatorChar.ToString())
			);

			if (File.Exists(fullPath))
			{
				File.Delete(fullPath);
				return Task.FromResult(true);
			}
			return Task.FromResult(false);
		}
	}
}
