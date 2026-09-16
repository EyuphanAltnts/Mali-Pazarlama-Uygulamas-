using System.Threading;
using System.Threading.Tasks;

namespace MailPulse.Application.Interfaces;

/// <summary>
/// Service for sending emails and testing SMTP connections.
/// </summary>
public interface IEmailSender
{
    Task<bool> SendEmailAsync(string to, string subject, string htmlBody, CancellationToken ct = default);
    Task<bool> TestConnectionAsync(CancellationToken ct = default);
}
