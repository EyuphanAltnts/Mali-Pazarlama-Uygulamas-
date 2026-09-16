using System.Threading.Tasks;
using MailPulse.Application.DTOs;
using MailPulse.Application.DTOs.Auth;

namespace MailPulse.Application.Interfaces;

/// <summary>
/// Service for handling user authentication and registration.
/// </summary>
public interface IAuthService
{
    Task<AuthResponseDto> RegisterAsync(RegisterDto dto);
    Task<AuthResponseDto> LoginAsync(LoginDto dto);
    Task<AuthResponseDto> RefreshAsync(RefreshTokenDto dto);
    Task<ApiResponse> ForgotPasswordAsync(ForgotPasswordDto dto);
    Task<ApiResponse> ResetPasswordAsync(ResetPasswordDto dto);
}
