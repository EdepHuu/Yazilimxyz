namespace Yazilimxyz.BusinessLayer.DTOs.SupportMessage
{
    public class GetByIdSupportMessageDto
    {
        public int Id { get; set; }
        public string Message { get; set; }
        public string SenderId { get; set; }
        public string ReceiverId { get; set; }
        public bool IsFromSupport { get; set; }
        public DateTime CreatedDate { get; set; }
    }
}
