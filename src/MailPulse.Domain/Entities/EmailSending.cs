using System;
using MailPulse.Domain.Enums;

namespace MailPulse.Domain.Entities
{
    /// <summary>
    /// Represents a single email sending instance for a subscriber in a campaign.
    /// </summary>
    public class EmailSending : BaseEntity
    {
        public Guid CampaignId { get; set; }
        public Guid SubscriberId { get; set; }
        public required string EmailAddress { get; set; }
        public EmailSendingStatus Status { get; set; } = EmailSendingStatus.Pending;
        public string? ErrorMessage { get; set; }
        public DateTime? SentAt { get; set; }

        public EmailCampaign Campaign { get; set; } = null!;
        public Subscriber Subscriber { get; set; } = null!;
    }
}
