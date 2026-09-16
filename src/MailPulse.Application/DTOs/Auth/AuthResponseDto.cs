using System;

namespace MailPulse.Application.DTOs.Auth;

public record AuthResponseDto(string AccessToken, string RefreshToken, string Email, string FullName, string Role, DateTime ExpiresAt);
