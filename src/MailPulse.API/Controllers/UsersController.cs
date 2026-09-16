using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MailPulse.Application.DTOs;
using MailPulse.Application.DTOs.Users;
using MailPulse.Application.Interfaces;

namespace MailPulse.API.Controllers;

[Route("api/users")]
[Authorize(Roles = "Admin")]
[Tags("Users")]
public class UsersController : BaseApiController
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PagedResult<UserDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll([FromQuery] UserFilterDto filter, CancellationToken ct = default)
    {
        var result = await _userService.GetUsersAsync(filter, ct);
        return Ok(new ApiResponse<PagedResult<UserDto>>
        {
            Success = true,
            Message = "Users retrieved successfully",
            Data = result
        });
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<UserDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct = default)
    {
        var result = await _userService.GetUserByIdAsync(id, ct);
        return Ok(new ApiResponse<UserDto>
        {
            Success = true,
            Message = "User retrieved successfully",
            Data = result
        });
    }

    [HttpPut("{id:guid}/status")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateUserStatusDto dto, [FromServices] IValidator<UpdateUserStatusDto> validator, CancellationToken ct = default)
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

        await _userService.UpdateUserStatusAsync(id, dto, ct);
        return Ok(new ApiResponse
        {
            Success = true,
            Message = "User status updated successfully"
        });
    }
}
