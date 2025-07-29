using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Yazilimxyz.BusinessLayer.DTOs.Auth;

namespace Yazilimxyz.BusinessLayer.Abstract
{
	public interface IAuthService
	{
		Task<ResultUserDto> RegisterAsync(RegisterDto registerDto);
		Task<ResultUserDto> LoginAsync(LoginDto loginDto);
	}
}
