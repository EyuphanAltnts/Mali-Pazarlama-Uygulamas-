using System.Threading;
using System.Threading.Tasks;
using MailPulse.Application.DTOs.Dashboard;

namespace MailPulse.Application.Interfaces;

/// <summary>
/// Service for providing dashboard statistics and data.
/// </summary>
public interface IDashboardService
{
    Task<DashboardSummaryDto> GetSummaryAsync(CancellationToken ct = default);
    Task<DailySendDto[]> GetDailySendsAsync(int days = 7, CancellationToken ct = default);
    Task<StatusDistributionDto[]> GetStatusDistributionAsync(CancellationToken ct = default);
    Task<TemplatePerformanceDto[]> GetTemplatePerformanceAsync(CancellationToken ct = default);
    Task<RecentActivityDto[]> GetRecentActivityAsync(int count = 10, CancellationToken ct = default);
}
