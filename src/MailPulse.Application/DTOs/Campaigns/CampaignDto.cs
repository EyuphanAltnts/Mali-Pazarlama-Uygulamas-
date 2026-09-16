using System;
using MailPulse.Domain.Enums;

namespace MailPulse.Application.DTOs.Campaigns;

public record CampaignDto(Guid Id, string Name, string TemplateName, string CreatedByName, int TotalRecipients, CampaignStatus Status, DateTime CreatedAt, DateTime? StartedAt, DateTime? CompletedAt);
