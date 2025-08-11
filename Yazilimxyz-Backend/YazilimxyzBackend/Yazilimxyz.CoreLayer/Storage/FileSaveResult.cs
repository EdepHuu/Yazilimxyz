using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Yazilimxyz.CoreLayer.Storage
{
	public class FileSaveResult
	{
		public string FileName { get; set; } = null!;
		public string RelativePath { get; set; } = null!;
		public string PublicUrl { get; set; } = null!;
	}
}
