using System;
using MailPulse.Domain.Enums;

namespace MailPulse.Application.DTOs.Campaigns;

public record CampaignDetailDto(Guid Id, string Name, string TemplateName, string CreatedByName, int TotalRecipients, CampaignStatus Status, DateTime CreatedAt, DateTime? StartedAt, DateTime? CompletedAt, int Pending, int Processing, int Sent, int Failed, double ProgressPercentage) 
    : CampaignDto(Id, Name, TemplateName, CreatedByName, TotalRecipients, Status, CreatedAt, StartedAt, CompletedAt);
