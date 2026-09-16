using MailPulse.Application.Interfaces;
using MailPulse.Domain.Entities;
using MailPulse.Persistence.Data;

namespace MailPulse.Persistence.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly MailPulseDbContext _context;

    private IRepository<User>? _users;
    private IRepository<Subscriber>? _subscribers;
    private IRepository<EmailTemplate>? _emailTemplates;
    private IRepository<EmailCampaign>? _emailCampaigns;
    private IRepository<EmailSending>? _emailSendings;
    private IRepository<SmtpSettings>? _smtpSettings;
    private IRepository<PasswordResetToken>? _passwordResetTokens;
    private IRepository<RefreshToken>? _refreshTokens;
    private IRepository<AuditLog>? _auditLogs;

    public UnitOfWork(MailPulseDbContext context)
    {
        _context = context;
    }

    public IRepository<User> Users =>
        _users ??= new Repository<User>(_context);

    public IRepository<Subscriber> Subscribers =>
        _subscribers ??= new Repository<Subscriber>(_context);

    public IRepository<EmailTemplate> EmailTemplates =>
        _emailTemplates ??= new Repository<EmailTemplate>(_context);

    public IRepository<EmailCampaign> EmailCampaigns =>
        _emailCampaigns ??= new Repository<EmailCampaign>(_context);

    public IRepository<EmailSending> EmailSendings =>
        _emailSendings ??= new Repository<EmailSending>(_context);

    public IRepository<SmtpSettings> SmtpSettings =>
        _smtpSettings ??= new Repository<SmtpSettings>(_context);

    public IRepository<PasswordResetToken> PasswordResetTokens =>
        _passwordResetTokens ??= new Repository<PasswordResetToken>(_context);

    public IRepository<RefreshToken> RefreshTokens =>
        _refreshTokens ??= new Repository<RefreshToken>(_context);

    public IRepository<AuditLog> AuditLogs =>
        _auditLogs ??= new Repository<AuditLog>(_context);

    public async Task<int> SaveChangesAsync(CancellationToken ct = default)
    {
        return await _context.SaveChangesAsync(ct);
    }
}
