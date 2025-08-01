using Yazilimxyz.BusinessLayer.DTOs.AppUser;

namespace Yazilimxyz.BusinessLayer.DTOs.AppAdmin
{
    public class GetByIdAppAdminDto
    {
        public int Id { get; set; }
        public string AppUserId { get; set; }
        public string Name { get; set; }
        public string LastName { get; set; }
        public bool IsActive { get; set; }
        public ResultAppUserDto AppUser { get; set; }
    }
}
