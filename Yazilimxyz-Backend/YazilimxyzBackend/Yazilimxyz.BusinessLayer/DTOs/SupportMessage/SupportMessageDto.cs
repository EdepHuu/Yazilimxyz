using System;
using System.Collections.Generic;

namespace Yazilimxyz.BusinessLayer.DTOs.SupportMessage
{
    public class SupportUserDto
    {
        public string Id { get; set; }
        public string UserName { get; set; }
        public string Email { get; set; }
    }

    public class SupportMessageDto
    {
        public int Id { get; set; }
        public string Content { get; set; }
        public string SenderId { get; set; }
        public string ReceiverId { get; set; }
        public string? ConversationId { get; set; }
        public SupportUserDto Sender { get; set; }
        public DateTime SentAt { get; set; }
    }

    public class SupportConversationDto
    {
        public int Id { get; set; }
        public SupportUserDto Customer { get; set; }
        public SupportUserDto SupportAgent { get; set; }
        public List<SupportMessageDto> Messages { get; set; }
        public DateTime? LastMessageAt { get; set; }
    }

    public class CreateSupportMessageDto
    {
        public string SenderId { get; set; }
        public string ReceiverId { get; set; }
        public string Content { get; set; }
        public string? ConversationId { get; set; }
    }

    public class UpdateSupportMessageDto
    {
        public int Id { get; set; }
        public string Content { get; set; }
    }

    public class GetByIdSupportMessageDto
    {
        public int Id { get; set; }
        public string Content { get; set; }
        public SupportUserDto Sender { get; set; }
        public DateTime SentAt { get; set; }
    }

    public class ResultSupportMessageDto
    {
        public int Id { get; set; }
        public string Content { get; set; }
        public string CustomerName { get; set; }
        public string CustomerEmail { get; set; }
        public DateTime SentAt { get; set; }
    }
}
