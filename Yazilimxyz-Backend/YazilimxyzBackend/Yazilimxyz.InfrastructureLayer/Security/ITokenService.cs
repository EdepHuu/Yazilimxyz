using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Yazilimxyz.EntityLayer.Entities;

namespace Yazilimxyz.InfrastructureLayer.Security
{
	public interface ITokenService
	{
		string CreateToken(AppUser user, string role);
	}
}
