using System;

namespace MailPulse.Domain.Entities
{
    /// <summary>
    /// Represents an audit log entry for tracking actions in the system.
    /// </summary>
    public class AuditLog : BaseEntity
    {
        public Guid? UserId { get; set; }
        public required string Action { get; set; }
        public required string EntityType { get; set; }
        public string? EntityId { get; set; }
        public string? Details { get; set; }
        public string? IpAddress { get; set; }

        public User? User { get; set; }
    }
}
