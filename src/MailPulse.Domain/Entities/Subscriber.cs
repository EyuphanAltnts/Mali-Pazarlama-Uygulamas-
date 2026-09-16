using System.Collections.Generic;

namespace MailPulse.Domain.Entities
{
    /// <summary>
    /// Represents a subscriber who receives emails from campaigns.
    /// </summary>
    public class Subscriber : BaseEntity
    {
        public required string Email { get; set; }
        public bool IsActive { get; set; } = true;

        public ICollection<EmailSending> EmailSendings { get; set; } = new List<EmailSending>();
    }
}
