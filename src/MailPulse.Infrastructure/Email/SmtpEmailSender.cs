using System;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Net.Sockets;
using System.Threading;
using System.Threading.Tasks;
using MailPulse.Application.Interfaces;
using MailPulse.Domain.Constants;
using Microsoft.Extensions.Logging;

namespace MailPulse.Infrastructure.Email;

/// <summary>
/// Implements email sending via SMTP.
/// </summary>
internal class SmtpEmailSender : IEmailSender
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IEncryptionService _encryptionService;
    private readonly ILogger<SmtpEmailSender> _logger;

    public SmtpEmailSender(IUnitOfWork unitOfWork, IEncryptionService encryptionService, ILogger<SmtpEmailSender> logger)
    {
        _unitOfWork = unitOfWork;
        _encryptionService = encryptionService;
        _logger = logger;
    }

    public async Task<bool> SendEmailAsync(string to, string subject, string body, CancellationToken cancellationToken = default)
    {
        var settingsList = await _unitOfWork.SmtpSettings.GetAllAsync(cancellationToken);
        var settings = settingsList.FirstOrDefault();

        if (settings == null)
        {
            _logger.LogError("SMTP settings are not configured in the database.");
            return false;
        }

        using var client = new SmtpClient(settings.Host, settings.Port)
        {
            EnableSsl = settings.EnableSsl,
            Timeout = AppConstants.SmtpTimeoutSeconds * 1000
        };

        if (!string.IsNullOrEmpty(settings.Username))
        {
            client.Credentials = new NetworkCredential(settings.Username, _encryptionService.Decrypt(settings.EncryptedPassword));
        }

        using var mailMessage = new MailMessage
        {
            From = new MailAddress(settings.SenderEmail, settings.SenderName),
            Subject = subject,
            Body = body,
            IsBodyHtml = true
        };
        mailMessage.To.Add(to);

        try
        {
            await client.SendMailAsync(mailMessage, cancellationToken);
            return true;
        }
        catch (SmtpException ex)
        {
            _logger.LogError(ex, "SMTP error sending email to {To}", to);
            return false;
        }
        catch (TimeoutException ex)
        {
            _logger.LogError(ex, "Timeout sending email to {To}", to);
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending email to {To}", to);
            return false;
        }
    }

    public async Task<bool> TestConnectionAsync(CancellationToken cancellationToken = default)
    {
        var settingsList = await _unitOfWork.SmtpSettings.GetAllAsync(cancellationToken);
        var settings = settingsList.FirstOrDefault();

        if (settings == null)
        {
            return false;
        }

        try
        {
            using var client = new TcpClient();
            using var timeoutCts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
            timeoutCts.CancelAfter(TimeSpan.FromSeconds(AppConstants.SmtpTimeoutSeconds));
            await client.ConnectAsync(settings.Host, settings.Port, timeoutCts.Token);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "SMTP connection test failed.");
            return false;
        }
    }
}
