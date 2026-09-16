using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MailPulse.Application.DTOs;
using MailPulse.Application.DTOs.Dashboard;
using MailPulse.Application.Interfaces;

namespace MailPulse.API.Controllers;

[Route("api/dashboard")]
[Authorize]
[Tags("Dashboard")]
public class DashboardController : BaseApiController
{
    private readonly IDashboardService _dashboardService;

    public DashboardController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    [HttpGet("summary")]
    [ProducesResponseType(typeof(ApiResponse<DashboardSummaryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSummary()
    {
        var result = await _dashboardService.GetSummaryAsync();
        return Ok(result);
    }

    [HttpGet("daily-sends")]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<DailySendDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDailySends([FromQuery] int days = 7)
    {
        var result = await _dashboardService.GetDailySendsAsync(days);
        return Ok(result);
    }

    [HttpGet("status-distribution")]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<StatusDistributionDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetStatusDistribution()
    {
        var result = await _dashboardService.GetStatusDistributionAsync();
        return Ok(result);
    }

    [HttpGet("template-performance")]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<TemplatePerformanceDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTemplatePerformance()
    {
        var result = await _dashboardService.GetTemplatePerformanceAsync();
        return Ok(result);
    }

    [HttpGet("recent-activity")]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<RecentActivityDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetRecentActivity([FromQuery] int count = 10)
    {
        var result = await _dashboardService.GetRecentActivityAsync(count);
        return Ok(result);
    }
}
