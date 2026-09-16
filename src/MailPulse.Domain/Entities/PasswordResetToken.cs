using System;

namespace MailPulse.Domain.Entities
{
    /// <summary>
    /// Represents a token generated for password reset.
    /// </summary>
    public class PasswordResetToken : BaseEntity
    {
        public Guid UserId { get; set; }
        public required string Token { get; set; }
        public bool IsUsed { get; set; } = false;
        public DateTime ExpiresAt { get; set; }

        public User User { get; set; } = null!;
    }
}
