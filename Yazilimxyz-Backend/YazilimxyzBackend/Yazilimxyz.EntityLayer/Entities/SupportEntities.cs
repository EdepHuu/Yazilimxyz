using System;
using System.Collections.Generic;

namespace Yazilimxyz.EntityLayer.Entities
{
    public class SupportMessage
    {
        public int Id { get; set; }

        public int SenderId { get; set; }
        public AppUser Sender { get; set; }

        public int ReceiverId { get; set; }
        public AppUser Receiver { get; set; }

        public string Content { get; set; }
        public DateTime SentAt { get; set; }

        public int? ConversationId { get; set; }
        public SupportConversation Conversation { get; set; }
    }

    public class SupportConversation
    {
        public int Id { get; set; }

        public int CustomerId { get; set; }
        public AppUser Customer { get; set; }

        public int? SupportAgentId { get; set; }
        public AppUser SupportAgent { get; set; }

        public List<SupportMessage> Messages { get; set; } = new List<SupportMessage>();

        public DateTime? LastMessageAt { get; set; }
    }
}