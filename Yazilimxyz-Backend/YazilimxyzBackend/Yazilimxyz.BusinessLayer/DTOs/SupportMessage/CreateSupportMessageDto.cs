namespace Yazilimxyz.BusinessLayer.DTOs.SupportMessage
{
    public class CreateSupportMessageDto
    {
        public string ReceiverId { get; set; }  // Alıcı destek personeli olabilir
        public string Message { get; set; }
        public bool IsFromSupport { get; set; }
    }
}
