using MailPulse.Domain.Entities;

namespace MailPulse.Application.Interfaces;

/// <summary>
/// Service for generating authentication tokens.
/// </summary>
public interface ITokenService
{
    string GenerateAccessToken(User user);
    string GenerateRefreshToken();
    string GeneratePasswordResetToken();
}
