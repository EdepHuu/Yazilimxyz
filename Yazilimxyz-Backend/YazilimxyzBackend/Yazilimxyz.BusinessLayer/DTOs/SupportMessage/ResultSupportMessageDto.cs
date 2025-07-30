namespace Yazilimxyz.BusinessLayer.DTOs.SupportMessage
{
    public class ResultSupportMessageDto
    {
        public int Id { get; set; }
        public string SenderFullName { get; set; }
        public string ReceiverFullName { get; set; }
        public string Message { get; set; }
        public bool IsFromSupport { get; set; }
        public DateTime CreatedDate { get; set; }  
    }
}
