using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MailPulse.Application.DTOs;
using MailPulse.Application.DTOs.Profile;
using MailPulse.Application.Interfaces;

namespace MailPulse.API.Controllers;

[Route("api/profile")]
[Authorize]
[Tags("Profile")]
public class ProfileController : BaseApiController
{
    private readonly IProfileService _profileService;

    public ProfileController(IProfileService profileService)
    {
        _profileService = profileService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<ProfileDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetProfile(CancellationToken ct = default)
    {
        var result = await _profileService.GetProfileAsync(UserId, ct);
        return Ok(new ApiResponse<ProfileDto>
        {
            Success = true,
            Message = "Profile retrieved successfully",
            Data = result
        });
    }

    [HttpPut]
    [ProducesResponseType(typeof(ApiResponse<ProfileDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto, [FromServices] IValidator<UpdateProfileDto> validator, CancellationToken ct = default)
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

        var result = await _profileService.UpdateProfileAsync(UserId, dto, ct);
        return Ok(new ApiResponse<ProfileDto>
        {
            Success = true,
            Message = "Profile updated successfully",
            Data = result
        });
    }

    [HttpPut("password")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto, [FromServices] IValidator<ChangePasswordDto> validator, CancellationToken ct = default)
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

        var result = await _profileService.ChangePasswordAsync(UserId, dto, ct);
        return Ok(result);
    }
}
