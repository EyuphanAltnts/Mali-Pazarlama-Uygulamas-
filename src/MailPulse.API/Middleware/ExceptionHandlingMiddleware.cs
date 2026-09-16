using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using MailPulse.Application.DTOs;

namespace MailPulse.API.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;
    private readonly IHostEnvironment _env;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger, IHostEnvironment env)
    {
        _next = next;
        _logger = logger;
        _env = env;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception has occurred.");
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var response = new ApiResponse<object>
        {
            Success = false
        };

        switch (exception)
        {
            case InvalidOperationException e:
                context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                response.Message = e.Message;
                break;
            case KeyNotFoundException e:
                context.Response.StatusCode = (int)HttpStatusCode.NotFound;
                response.Message = e.Message;
                break;
            case UnauthorizedAccessException e:
                context.Response.StatusCode = (int)HttpStatusCode.Unauthorized;
                response.Message = "Unauthorized access.";
                break;
            case ValidationException e:
                context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                response.Message = "Validation failed.";
                response.Errors = e.Errors.Select(err => err.ErrorMessage).ToList();
                break;
            default:
                context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                response.Message = _env.IsDevelopment() ? exception.Message : "Something went wrong";
                if (_env.IsDevelopment())
                {
                    response.Data = exception.StackTrace;
                }
                break;
        }

        var result = JsonSerializer.Serialize(response, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
        await context.Response.WriteAsync(result);
    }
}

public class ValidationException : Exception
{
    public ValidationException(IEnumerable<FluentValidation.Results.ValidationFailure> errors)
    {
        Errors = errors;
    }

    public IEnumerable<FluentValidation.Results.ValidationFailure> Errors { get; }
}
