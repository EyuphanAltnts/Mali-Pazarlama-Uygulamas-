using System;
using MailPulse.Domain.Enums;

namespace MailPulse.Application.DTOs.Dashboard;

public record RecentActivityDto(string Email, string TemplateName, string CampaignName, EmailSendingStatus Status, DateTime? SentAt);
