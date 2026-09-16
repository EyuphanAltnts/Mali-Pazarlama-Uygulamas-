using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MailPulse.Application.DTOs;
using MailPulse.Application.DTOs.Reports;
using MailPulse.Application.Interfaces;
using MailPulse.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace MailPulse.Application.Services;

public class ReportService : IReportService
{
    private readonly IUnitOfWork _unitOfWork;

    public ReportService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<PagedResult<ReportItemDto>> GetReportItemsAsync(ReportFilterDto filter, CancellationToken ct = default)
    {
        var query = _unitOfWork.EmailSendings.Query()
            .Include(e => e.Campaign)
                .ThenInclude(c => c.Template)
            .AsQueryable();

        if (filter.TemplateId.HasValue)
        {
            query = query.Where(e => e.Campaign != null && e.Campaign.TemplateId == filter.TemplateId.Value);
        }

        if (!string.IsNullOrEmpty(filter.Email))
        {
            query = query.Where(e => e.EmailAddress.Contains(filter.Email));
        }

        if (filter.Status.HasValue)
        {
            query = query.Where(e => e.Status == filter.Status.Value);
        }

        if (filter.StartDate.HasValue)
        {
            query = query.Where(e => e.CreatedAt >= filter.StartDate.Value);
        }

        if (filter.EndDate.HasValue)
        {
            query = query.Where(e => e.CreatedAt <= filter.EndDate.Value);
        }

        var total = await query.CountAsync(ct);

        var items = await query
            .OrderByDescending(e => e.CreatedAt)
            .Skip((filter.PageNumber - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .Select(e => new ReportItemDto(
                e.EmailAddress,
                e.Campaign != null && e.Campaign.Template != null ? e.Campaign.Template.Title : "Unknown",
                e.Campaign != null ? e.Campaign.Name : "Unknown",
                e.SentAt,
                e.Status,
                e.ErrorMessage
            ))
            .ToListAsync(ct);

        return PagedResult<ReportItemDto>.Create(items, total, filter.PageNumber, filter.PageSize);
    }

    public async Task<ReportSummaryDto> GetReportSummaryAsync(ReportFilterDto filter, CancellationToken ct = default)
    {
        var query = _unitOfWork.EmailSendings.Query();

        if (filter.TemplateId.HasValue)
        {
            query = query.Where(e => e.Campaign != null && e.Campaign.TemplateId == filter.TemplateId.Value);
        }

        if (!string.IsNullOrEmpty(filter.Email))
        {
            query = query.Where(e => e.EmailAddress.Contains(filter.Email));
        }

        if (filter.Status.HasValue)
        {
            query = query.Where(e => e.Status == filter.Status.Value);
        }

        if (filter.StartDate.HasValue)
        {
            query = query.Where(e => e.CreatedAt >= filter.StartDate.Value);
        }

        if (filter.EndDate.HasValue)
        {
            query = query.Where(e => e.CreatedAt <= filter.EndDate.Value);
        }

        var total = await query.CountAsync(ct);
        var sentCount = await query.CountAsync(e => e.Status == EmailSendingStatus.Sent, ct);
        var failedCount = await query.CountAsync(e => e.Status == EmailSendingStatus.Failed, ct);
        
        var successRate = total > 0 ? Math.Round((double)sentCount / total * 100, 2) : 0;

        return new ReportSummaryDto(sentCount + failedCount, sentCount, failedCount, successRate);
    }
}
