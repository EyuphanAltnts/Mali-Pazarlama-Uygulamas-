using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MailPulse.Application.DTOs;
using MailPulse.Application.DTOs.Templates;
using MailPulse.Application.Interfaces;

namespace MailPulse.API.Controllers;

[Route("api/templates")]
[Authorize]
[Tags("Templates")]
public class TemplatesController : BaseApiController
{
    private readonly ITemplateService _templateService;

    public TemplatesController(ITemplateService templateService)
    {
        _templateService = templateService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PagedResult<TemplateDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10, CancellationToken ct = default)
    {
        var result = await _templateService.GetTemplatesAsync(pageNumber, pageSize, ct);
        return Ok(new ApiResponse<PagedResult<TemplateDto>>
        {
            Success = true,
            Message = "Templates retrieved successfully",
            Data = result
        });
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<TemplateDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct = default)
    {
        var result = await _templateService.GetTemplateByIdAsync(id, ct);
        return Ok(new ApiResponse<TemplateDto>
        {
            Success = true,
            Message = "Template retrieved successfully",
            Data = result
        });
    }

    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<TemplateDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateTemplateDto dto, [FromServices] IValidator<CreateTemplateDto> validator, CancellationToken ct = default)
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

        var result = await _templateService.CreateTemplateAsync(dto, UserId, ct);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, new ApiResponse<TemplateDto>
        {
            Success = true,
            Message = "Template created successfully",
            Data = result
        });
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<TemplateDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateTemplateDto dto, [FromServices] IValidator<UpdateTemplateDto> validator, CancellationToken ct = default)
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

        var result = await _templateService.UpdateTemplateAsync(id, dto, ct);
        return Ok(new ApiResponse<TemplateDto>
        {
            Success = true,
            Message = "Template updated successfully",
            Data = result
        });
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct = default)
    {
        await _templateService.DeleteTemplateAsync(id, ct);
        return Ok(new ApiResponse
        {
            Success = true,
            Message = "Template deleted successfully"
        });
    }
}
