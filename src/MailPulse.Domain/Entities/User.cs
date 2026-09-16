using System;
using System.Collections.Generic;

namespace MailPulse.Domain.Entities
{
    /// <summary>
    /// Represents a user of the MailPulse application.
    /// </summary>
    public class User : BaseEntity
    {
        public required string FirstName { get; set; }
        public required string LastName { get; set; }
        public required string Email { get; set; }
        public required string PasswordHash { get; set; }
        public required string PasswordSalt { get; set; }
        public string Role { get; set; } = "User";
        public bool IsActive { get; set; } = true;

        public ICollection<EmailTemplate> Templates { get; set; } = new List<EmailTemplate>();
        public ICollection<EmailCampaign> Campaigns { get; set; } = new List<EmailCampaign>();
        public ICollection<PasswordResetToken> PasswordResetTokens { get; set; } = new List<PasswordResetToken>();
        public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
        public ICollection<AuditLog> AuditLogs { get; set; } = new List<AuditLog>();
    }
}
