namespace MailPulse.Application.DTOs.Settings;

public record SmtpSettingsDto(string Host, int Port, bool EnableSsl, string Username, string SenderEmail, string SenderName);
