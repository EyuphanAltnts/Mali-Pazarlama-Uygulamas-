namespace MailPulse.Domain.Entities
{
    /// <summary>
    /// Represents the SMTP configuration settings used to send emails.
    /// </summary>
    public class SmtpSettings : BaseEntity
    {
        public required string Host { get; set; }
        public int Port { get; set; }
        public bool EnableSsl { get; set; }
        public required string Username { get; set; }
        public required string EncryptedPassword { get; set; }
        public required string SenderEmail { get; set; }
        public string? SenderName { get; set; }
    }
}
