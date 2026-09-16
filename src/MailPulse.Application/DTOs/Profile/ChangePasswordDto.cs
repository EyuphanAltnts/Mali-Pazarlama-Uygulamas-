namespace MailPulse.Application.DTOs.Profile;

public record ChangePasswordDto(string CurrentPassword, string NewPassword, string ConfirmPassword);
