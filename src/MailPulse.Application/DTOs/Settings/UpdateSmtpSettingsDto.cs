namespace MailPulse.Application.DTOs.Settings;

public record UpdateSmtpSettingsDto(string Host, int Port, bool EnableSsl, string Username, string Password, string SenderEmail, string SenderName);
