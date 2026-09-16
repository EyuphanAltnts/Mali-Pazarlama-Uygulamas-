namespace MailPulse.Domain.Enums
{
    /// <summary>
    /// Represents the status of an individual email sending.
    /// </summary>
    public enum EmailSendingStatus
    {
        Pending = 0,
        Processing = 1,
        Sent = 2,
        Failed = 3
    }
}
