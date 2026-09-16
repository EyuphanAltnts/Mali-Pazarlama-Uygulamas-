using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MailPulse.Application.DTOs;
using MailPulse.Application.DTOs.Campaigns;
using MailPulse.Application.Interfaces;

namespace MailPulse.API.Controllers;

[Route("api/campaigns")]
[Authorize]
[Tags("Campaigns")]
public class CampaignsController : BaseApiController
{
    private readonly ICampaignService _campaignService;

    public CampaignsController(ICampaignService campaignService)
    {
        _campaignService = campaignService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PagedResult<CampaignDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll([FromQuery] CampaignFilterDto filter, CancellationToken ct = default)
    {
        var result = await _campaignService.GetCampaignsAsync(filter, ct);
        return Ok(new ApiResponse<PagedResult<CampaignDto>>
        {
            Success = true,
            Message = "Campaigns retrieved successfully",
            Data = result
        });
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<CampaignDetailDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct = default)
    {
        var result = await _campaignService.GetCampaignByIdAsync(id, ct);
        return Ok(new ApiResponse<CampaignDetailDto>
        {
            Success = true,
            Message = "Campaign retrieved successfully",
            Data = result
        });
    }

    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<CampaignDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateCampaignDto dto, [FromServices] IValidator<CreateCampaignDto> validator, CancellationToken ct = default)
    {
        var validationResult = await validator.ValidateAsync(dto, ct);
        if (!validationResult.IsValid)
        {
            return BadRequest(new ApiResponse<object>
            {
                Success = false,
                Message = "Validation failed",
                Errors = validationResult.Errors.Select(e => e.ErrorMessage).ToList()
            });
        }

        var result = await _campaignService.CreateCampaignAsync(dto, UserId, ct);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, new ApiResponse<CampaignDto>
        {
            Success = true,
            Message = "Campaign created successfully",
            Data = result
        });
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<CampaignDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Update(Guid id, [FromBody] CreateCampaignDto dto, [FromServices] IValidator<CreateCampaignDto> validator, CancellationToken ct = default)
    {
        var validationResult = await validator.ValidateAsync(dto, ct);
        if (!validationResult.IsValid)
        {
            return BadRequest(new ApiResponse<object>
            {
                Success = false,
                Message = "Validation failed",
                Errors = validationResult.Errors.Select(e => e.ErrorMessage).ToList()
            });
        }

        var result = await _campaignService.UpdateCampaignAsync(id, dto, ct);
        return Ok(new ApiResponse<CampaignDto>
        {
            Success = true,
            Message = "Campaign updated successfully",
            Data = result
        });
    }

    [HttpPost("{id:guid}/send")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> Send(Guid id, CancellationToken ct = default)
    {
        await _campaignService.SendCampaignAsync(id, ct);
        return Ok(new ApiResponse
        {
            Success = true,
            Message = "Campaign sending queued successfully"
        });
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct = default)
    {
        await _campaignService.DeleteCampaignAsync(id, ct);
        return Ok(new ApiResponse
        {
            Success = true,
            Message = "Campaign deleted successfully"
        });
    }
}
