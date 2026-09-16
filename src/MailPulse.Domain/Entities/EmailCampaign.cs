using System;
using System.Collections.Generic;
using MailPulse.Domain.Enums;

namespace MailPulse.Domain.Entities
{
    /// <summary>
    /// Represents an email campaign sent to subscribers.
    /// </summary>
    public class EmailCampaign : BaseEntity
    {
        public required string Name { get; set; }
        public Guid TemplateId { get; set; }
        public Guid CreatedByUserId { get; set; }
        public int TotalRecipients { get; set; }
        public CampaignStatus Status { get; set; } = CampaignStatus.Draft;
        public DateTime? StartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }

        public EmailTemplate Template { get; set; } = null!;
        public User CreatedBy { get; set; } = null!;
        public ICollection<EmailSending> Sendings { get; set; } = new List<EmailSending>();
    }
}
