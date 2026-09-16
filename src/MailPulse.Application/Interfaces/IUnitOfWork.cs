using System;
using System.Threading;
using System.Threading.Tasks;
using MailPulse.Domain.Entities;

namespace MailPulse.Application.Interfaces;

/// <summary>
/// Unit of work interface for coordinating repository operations.
/// </summary>
public interface IUnitOfWork
{
    IRepository<User> Users { get; }
    IRepository<Subscriber> Subscribers { get; }
    IRepository<EmailTemplate> EmailTemplates { get; }
    IRepository<EmailCampaign> EmailCampaigns { get; }
    IRepository<EmailSending> EmailSendings { get; }
    IRepository<SmtpSettings> SmtpSettings { get; }
    IRepository<PasswordResetToken> PasswordResetTokens { get; }
    IRepository<RefreshToken> RefreshTokens { get; }
    IRepository<AuditLog> AuditLogs { get; }
    Task<int> SaveChangesAsync(CancellationToken ct = default);
}
