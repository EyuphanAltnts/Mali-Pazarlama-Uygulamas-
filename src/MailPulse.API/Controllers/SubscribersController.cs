using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MailPulse.Application.DTOs;
using MailPulse.Application.DTOs.Subscribers;
using MailPulse.Application.Interfaces;

namespace MailPulse.API.Controllers;

[Route("api/subscribers")]
[Authorize]
[Tags("Subscribers")]
public class SubscribersController : BaseApiController
{
    private readonly ISubscriberService _subscriberService;

    public SubscribersController(ISubscriberService subscriberService)
    {
        _subscriberService = subscriberService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PagedResult<SubscriberDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll([FromQuery] SubscriberFilterDto filter, CancellationToken ct)
    {
        var result = await _subscriberService.GetSubscribersAsync(filter, ct);
        return Ok(new ApiResponse<PagedResult<SubscriberDto>>
        {
            Success = true,
            Message = "Subscribers retrieved successfully",
            Data = result
        });
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<SubscriberDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var result = await _subscriberService.GetSubscriberByIdAsync(id, ct);
        return Ok(new ApiResponse<SubscriberDto>
        {
            Success = true,
            Message = "Subscriber retrieved successfully",
            Data = result
        });
    }

    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<SubscriberDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateSubscriberDto dto, [FromServices] IValidator<CreateSubscriberDto> validator, CancellationToken ct)
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

        var result = await _subscriberService.CreateSubscriberAsync(dto, ct);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, new ApiResponse<SubscriberDto>
        {
            Success = true,
            Message = "Subscriber created successfully",
            Data = result
        });
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<SubscriberDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateSubscriberDto dto, [FromServices] IValidator<UpdateSubscriberDto> validator, CancellationToken ct)
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

        var result = await _subscriberService.UpdateSubscriberAsync(id, dto, ct);
        return Ok(new ApiResponse<SubscriberDto>
        {
            Success = true,
            Message = "Subscriber updated successfully",
            Data = result
        });
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _subscriberService.DeleteSubscriberAsync(id, ct);
        return Ok(new ApiResponse
        {
            Success = true,
            Message = "Subscriber deleted successfully"
        });
    }
}
