using System;
using System.Collections.Generic;

namespace MailPulse.Domain.Entities
{
    /// <summary>
    /// Represents an email template that can be used in campaigns.
    /// </summary>
    public class EmailTemplate : BaseEntity
    {
        public required string Title { get; set; }
        public required string HtmlContent { get; set; }
        public bool IsActive { get; set; } = true;
        public Guid CreatedByUserId { get; set; }

        public User CreatedBy { get; set; } = null!;
        public ICollection<EmailCampaign> Campaigns { get; set; } = new List<EmailCampaign>();
    }
}
