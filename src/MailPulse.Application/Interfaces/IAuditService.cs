using System;
using System.Threading;
using System.Threading.Tasks;

namespace MailPulse.Application.Interfaces;

/// <summary>
/// Service for logging audit events.
/// </summary>
public interface IAuditService
{
    Task LogAsync(Guid? userId, string action, string entityType, string? entityId = null, string? details = null, string? ipAddress = null, CancellationToken ct = default);
}
