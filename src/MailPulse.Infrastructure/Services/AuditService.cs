using System;
using System.Threading;
using System.Threading.Tasks;
using MailPulse.Application.Interfaces;
using MailPulse.Domain.Entities;

namespace MailPulse.Infrastructure.Services;

/// <summary>
/// Service for managing audit logs.
/// </summary>
internal class AuditService : IAuditService
{
    private readonly IUnitOfWork _unitOfWork;

    public AuditService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task LogAsync(
        Guid? userId,
        string action,
        string entityType,
        string? entityId = null,
        string? details = null,
        string? ipAddress = null,
        CancellationToken ct = default)
    {
        var auditLog = new AuditLog
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Action = action,
            EntityType = entityType,
            EntityId = entityId,
            Details = details,
            IpAddress = ipAddress,
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.AuditLogs.AddAsync(auditLog, ct);
        await _unitOfWork.SaveChangesAsync(ct);
    }
}
