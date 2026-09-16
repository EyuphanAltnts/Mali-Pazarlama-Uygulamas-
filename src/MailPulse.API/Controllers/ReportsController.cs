using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MailPulse.Application.DTOs;
using MailPulse.Application.DTOs.Reports;
using MailPulse.Application.Interfaces;

namespace MailPulse.API.Controllers;

[Route("api/reports")]
[Authorize]
[Tags("Reports")]
public class ReportsController : BaseApiController
{
    private readonly IReportService _reportService;

    public ReportsController(IReportService reportService)
    {
        _reportService = reportService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PagedResult<ReportItemDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll([FromQuery] ReportFilterDto filter)
    {
        var result = await _reportService.GetReportItemsAsync(filter);
        return Ok(new ApiResponse<PagedResult<ReportItemDto>>
        {
            Success = true,
            Message = "Reports retrieved successfully",
            Data = result
        });
    }

    [HttpGet("summary")]
    [ProducesResponseType(typeof(ApiResponse<ReportSummaryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSummary([FromQuery] ReportFilterDto filter)
    {
        var result = await _reportService.GetReportSummaryAsync(filter);
        return Ok(new ApiResponse<ReportSummaryDto>
        {
            Success = true,
            Message = "Report summary retrieved successfully",
            Data = result
        });
    }
}
