using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MailPulse.Application.DTOs;
using MailPulse.Application.DTOs.Settings;
using MailPulse.Application.Interfaces;

namespace MailPulse.API.Controllers;

[Route("api/settings/smtp")]
[Authorize(Roles = "Admin")]
[Tags("Settings")]
public class SettingsController : BaseApiController
{
    private readonly ISmtpSettingsService _settingsService;

    public SettingsController(ISmtpSettingsService settingsService)
    {
        _settingsService = settingsService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<SmtpSettingsDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSmtpSettings(CancellationToken ct = default)
    {
        var result = await _settingsService.GetSettingsAsync(ct);
        return Ok(new ApiResponse<SmtpSettingsDto>
        {
            Success = true,
            Message = "SMTP settings retrieved successfully",
            Data = result
        });
    }

    [HttpPut]
    [ProducesResponseType(typeof(ApiResponse<SmtpSettingsDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UpdateSmtpSettings([FromBody] UpdateSmtpSettingsDto dto, [FromServices] IValidator<UpdateSmtpSettingsDto> validator, CancellationToken ct = default)
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

        var result = await _settingsService.UpdateSettingsAsync(dto, ct);
        return Ok(new ApiResponse<SmtpSettingsDto>
        {
            Success = true,
            Message = "SMTP settings updated successfully",
            Data = result
        });
    }

    [HttpPost("test")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    public async Task<IActionResult> TestSmtpConnection(CancellationToken ct = default)
    {
        var result = await _settingsService.TestSettingsAsync(ct);
        return Ok(new ApiResponse<bool>
        {
            Success = result,
            Message = result ? "SMTP connection successful" : "SMTP connection failed",
            Data = result
        });
    }
}
