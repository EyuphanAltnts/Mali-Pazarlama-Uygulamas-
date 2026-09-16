using MailPulse.Application.Interfaces;
using MailPulse.Infrastructure.BackgroundJobs;
using MailPulse.Infrastructure.Email;
using MailPulse.Infrastructure.Security;
using MailPulse.Infrastructure.Services;
using Microsoft.Extensions.DependencyInjection;

namespace MailPulse.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services)
    {
        services.AddSingleton<IPasswordHasher, PasswordHasher>();
        services.AddSingleton<ITokenService, TokenService>();
        services.AddSingleton<IEncryptionService, EncryptionService>();
        services.AddScoped<IEmailSender, SmtpEmailSender>();
        services.AddScoped<IAuditService, AuditService>();
        services.AddSingleton<IBackgroundTaskQueue, BackgroundTaskQueue>();
        services.AddHostedService<EmailSenderBackgroundService>();
        return services;
    }
}
