using System.Threading;
using System.Threading.Tasks;
using MailPulse.Application.DTOs.Settings;

namespace MailPulse.Application.Interfaces;

/// <summary>
/// Service for managing SMTP settings.
/// </summary>
public interface ISmtpSettingsService
{
    Task<SmtpSettingsDto?> GetSettingsAsync(CancellationToken ct = default);
    Task<SmtpSettingsDto> UpdateSettingsAsync(UpdateSmtpSettingsDto dto, CancellationToken ct = default);
    Task<bool> TestSettingsAsync(CancellationToken ct = default);
}
