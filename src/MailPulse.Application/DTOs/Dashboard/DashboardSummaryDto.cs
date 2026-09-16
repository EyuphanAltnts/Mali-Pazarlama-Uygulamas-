namespace MailPulse.Application.DTOs.Dashboard;

public record DashboardSummaryDto(int TotalSubscribers, int TotalTemplates, int TotalCampaigns, int TotalEmailsSent, int SuccessfulEmails, int FailedEmails, double SuccessRate);
