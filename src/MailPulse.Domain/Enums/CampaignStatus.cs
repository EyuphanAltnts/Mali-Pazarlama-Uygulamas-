namespace MailPulse.Domain.Enums
{
    /// <summary>
    /// Represents the status of an email campaign.
    /// </summary>
    public enum CampaignStatus
    {
        Draft = 0,
        Processing = 1,
        Completed = 2,
        Failed = 3,
        Cancelled = 4
    }
}
