using System;
using MailPulse.Domain.Enums;

namespace MailPulse.Application.DTOs.Reports;

public class ReportFilterDto
{
    public Guid? TemplateId { get; set; }
    public string? Email { get; set; }
    public EmailSendingStatus? Status { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}
