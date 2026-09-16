using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MailPulse.Application.DTOs;
using MailPulse.Application.DTOs.Settings;
using MailPulse.Application.Interfaces;
using MailPulse.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace MailPulse.Application.Services;

public class SmtpSettingsService : ISmtpSettingsService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IEncryptionService _encryptionService;
    private readonly IEmailSender _emailSender;

    public SmtpSettingsService(IUnitOfWork unitOfWork, IEncryptionService encryptionService, IEmailSender emailSender)
    {
        _unitOfWork = unitOfWork;
        _encryptionService = encryptionService;
        _emailSender = emailSender;
    }

    public async Task<SmtpSettingsDto?> GetSettingsAsync(CancellationToken ct = default)
    {
        var settings = await _unitOfWork.SmtpSettings.Query().FirstOrDefaultAsync(ct);
        if (settings == null) return null;

        return new SmtpSettingsDto(
            settings.Host, 
            settings.Port, 
            settings.EnableSsl, 
            settings.Username, 
            settings.SenderEmail, 
            settings.SenderName ?? string.Empty
        );
    }

    public async Task<SmtpSettingsDto> UpdateSettingsAsync(UpdateSmtpSettingsDto dto, CancellationToken ct = default)
    {
        var settings = await _unitOfWork.SmtpSettings.Query().FirstOrDefaultAsync(ct);

        if (settings == null)
        {
            if (string.IsNullOrWhiteSpace(dto.Password))
                throw new InvalidOperationException("A password is required when SMTP settings are created.");

            settings = new SmtpSettings
            {
                Id = Guid.NewGuid(),
                Host = dto.Host,
                Port = dto.Port,
                EnableSsl = dto.EnableSsl,
                Username = dto.Username,
                EncryptedPassword = _encryptionService.Encrypt(dto.Password),
                SenderEmail = dto.SenderEmail,
                SenderName = dto.SenderName,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            await _unitOfWork.SmtpSettings.AddAsync(settings);
        }
        else
        {
            settings.Host = dto.Host;
            settings.Port = dto.Port;
            settings.EnableSsl = dto.EnableSsl;
            settings.Username = dto.Username;
            if (!string.IsNullOrEmpty(dto.Password))
            {
                settings.EncryptedPassword = _encryptionService.Encrypt(dto.Password);
            }
            settings.SenderEmail = dto.SenderEmail;
            settings.SenderName = dto.SenderName;
            settings.UpdatedAt = DateTime.UtcNow;

            await _unitOfWork.SmtpSettings.UpdateAsync(settings);
        }

        await _unitOfWork.SaveChangesAsync();

        return new SmtpSettingsDto(settings.Host, settings.Port, settings.EnableSsl, settings.Username, settings.SenderEmail, settings.SenderName ?? string.Empty);
    }

    public async Task<bool> TestSettingsAsync(CancellationToken ct = default)
    {
        return await _emailSender.TestConnectionAsync(ct);
    }
}
