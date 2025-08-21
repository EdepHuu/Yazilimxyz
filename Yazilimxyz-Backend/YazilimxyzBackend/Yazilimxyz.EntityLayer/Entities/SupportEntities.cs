using System;
using System.Collections.Generic;

namespace Yazilimxyz.EntityLayer.Entities
{
    public class SupportMessage
    {
        public int Id { get; set; }

        public string SenderId { get; set; }
        public AppUser Sender { get; set; }

        public string ReceiverId { get; set; }
        public AppUser Receiver { get; set; }

        public string Content { get; set; }
        public DateTime SentAt { get; set; }

        public int? ConversationId { get; set; }
        public SupportConversation Conversation { get; set; }
    }

    public class SupportConversation
    {
        public int Id { get; set; }

        public string CustomerId { get; set; }
        public AppUser Customer { get; set; }

        public string SupportAgentId { get; set; }
        public AppUser SupportAgent { get; set; }

        public List<SupportMessage> Messages { get; set; } = new List<SupportMessage>();

        public DateTime? LastMessageAt { get; set; }
    }
}
