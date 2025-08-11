using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Yazilimxyz.CoreLayer.Storage
{
	public interface IFileStorage
	{
		Task<FileSaveResult> SaveAsync(Stream stream, string originalFileName, string subFolder);
		Task<bool> DeleteAsync(string relativePath);
	}
}
