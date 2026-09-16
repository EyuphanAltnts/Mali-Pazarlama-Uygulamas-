namespace MailPulse.Application.DTOs.Auth;

public record ResetPasswordDto(string Token, string NewPassword, string ConfirmPassword);
