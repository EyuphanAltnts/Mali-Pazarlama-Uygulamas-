using System;
using MailPulse.Domain.Enums;

namespace MailPulse.Application.DTOs.Campaigns;

public class CampaignFilterDto
{
    public CampaignStatus? Status { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}
