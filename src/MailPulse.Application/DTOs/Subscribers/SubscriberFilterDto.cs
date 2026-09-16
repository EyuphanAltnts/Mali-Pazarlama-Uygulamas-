using System;

namespace MailPulse.Application.DTOs.Subscribers;

public class SubscriberFilterDto
{
    public string? Search { get; set; }
    public bool? IsActive { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}
