using System;
using MailPulse.Domain.Enums;

namespace MailPulse.Application.DTOs.Reports;

public record ReportItemDto(string Email, string TemplateName, string CampaignName, DateTime? SentAt, EmailSendingStatus Status, string? ErrorMessage);
