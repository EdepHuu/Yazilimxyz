namespace Yazilimxyz.BusinessLayer.DTOs.AppAdmin
{
    public class UpdateAppAdminDto
    {
        public int Id { get; set; }
        public string AppUserId { get; set; }
        public string Name { get; set; }
        public string LastName { get; set; }
        public bool IsActive { get; set; }
    }
}
