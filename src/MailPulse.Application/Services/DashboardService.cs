using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MailPulse.Application.DTOs.Dashboard;
using MailPulse.Application.Interfaces;
using MailPulse.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace MailPulse.Application.Services;

public class DashboardService : IDashboardService
{
    private readonly IUnitOfWork _unitOfWork;

    public DashboardService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<DashboardSummaryDto> GetSummaryAsync(CancellationToken ct = default)
    {
        var totalSubscribers = await _unitOfWork.Subscribers.Query().CountAsync(s => s.IsActive, ct);
        var totalTemplates = await _unitOfWork.EmailTemplates.Query().CountAsync(t => t.IsActive, ct);
        var activeCampaigns = await _unitOfWork.EmailCampaigns.Query().CountAsync(c => c.Status == CampaignStatus.Processing || c.Status == CampaignStatus.Draft, ct);
        var totalEmailsSent = await _unitOfWork.EmailSendings.Query().CountAsync(e => e.Status == EmailSendingStatus.Sent, ct);
        var successfulEmails = await _unitOfWork.EmailSendings.Query().CountAsync(e => e.Status == EmailSendingStatus.Sent, ct);
        var failedEmails = await _unitOfWork.EmailSendings.Query().CountAsync(e => e.Status == EmailSendingStatus.Failed, ct);
        var successRate = totalEmailsSent > 0 ? (double)successfulEmails / (successfulEmails + failedEmails) * 100 : 0;

        return new DashboardSummaryDto(totalSubscribers, totalTemplates, activeCampaigns, totalEmailsSent, successfulEmails, failedEmails, successRate);
    }

    public async Task<DailySendDto[]> GetDailySendsAsync(int days = 7, CancellationToken ct = default)
    {
        var startDate = DateTime.UtcNow.AddDays(-days).Date;
        var query = _unitOfWork.EmailSendings.Query()
            .Where(e => e.SentAt.HasValue && e.SentAt.Value >= startDate && (e.Status == EmailSendingStatus.Sent || e.Status == EmailSendingStatus.Failed));
            
        var grouped = await query
            .Select(e => new { SentAt = e.SentAt!.Value, e.Status })
            .GroupBy(e => e.SentAt.Date)
            .Select(g => new DailySendDto(
                g.Key, 
                g.Count(), 
                g.Count(x => x.Status == EmailSendingStatus.Sent), 
                g.Count(x => x.Status == EmailSendingStatus.Failed)
            ))
            .ToArrayAsync(ct);
            
        return grouped;
    }

    public async Task<StatusDistributionDto[]> GetStatusDistributionAsync(CancellationToken ct = default)
    {
        var grouped = await _unitOfWork.EmailSendings.Query()
            .GroupBy(e => e.Status)
            .Select(g => new StatusDistributionDto(g.Key, g.Count()))
            .ToArrayAsync(ct);
            
        return grouped;
    }

    public async Task<TemplatePerformanceDto[]> GetTemplatePerformanceAsync(CancellationToken ct = default)
    {
        var query = await _unitOfWork.EmailSendings.Query()
            .Include(e => e.Campaign)
                .ThenInclude(c => c.Template)
            .Where(e => e.Campaign != null && e.Campaign.Template != null)
            .GroupBy(e => e.Campaign.Template)
            .Select(g => new
            {
                TemplateName = g.Key.Title,
                TotalSent = g.Count(),
                SuccessfulCount = g.Count(e => e.Status == EmailSendingStatus.Sent),
                FailedCount = g.Count(e => e.Status == EmailSendingStatus.Failed)
            })
            .OrderByDescending(x => x.TotalSent)
            .Take(5)
            .ToArrayAsync(ct);
            
        return query.Select(x => new TemplatePerformanceDto(x.TemplateName, x.TotalSent, x.SuccessfulCount, x.FailedCount)).ToArray();
    }

    public async Task<RecentActivityDto[]> GetRecentActivityAsync(int count = 10, CancellationToken ct = default)
    {
        var activities = await _unitOfWork.EmailSendings.Query()
            .Include(e => e.Campaign)
                .ThenInclude(c => c.Template)
            .OrderByDescending(e => e.CreatedAt)
            .Take(count)
            .Select(e => new RecentActivityDto(
                e.EmailAddress,
                e.Campaign != null && e.Campaign.Template != null ? e.Campaign.Template.Title : "Unknown",
                e.Campaign != null ? e.Campaign.Name : "Unknown",
                e.Status,
                e.SentAt
            ))
            .ToArrayAsync(ct);
            
        return activities;
    }
}
