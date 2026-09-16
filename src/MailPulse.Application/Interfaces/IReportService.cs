using System.Threading;
using System.Threading.Tasks;
using MailPulse.Application.DTOs;
using MailPulse.Application.DTOs.Reports;

namespace MailPulse.Application.Interfaces;

/// <summary>
/// Service for retrieving campaign and sending reports.
/// </summary>
public interface IReportService
{
    Task<PagedResult<ReportItemDto>> GetReportItemsAsync(ReportFilterDto filter, CancellationToken ct = default);
    Task<ReportSummaryDto> GetReportSummaryAsync(ReportFilterDto filter, CancellationToken ct = default);
}
